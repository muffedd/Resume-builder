import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

test('GET /api/health returns service metadata', async () => {
  const response = await request(app).get('/api/health').expect(200);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'career-platform-api');
  assert.ok(response.body.timestamp);
});

test('GET /api/bootstrap returns aggregated frontend payload', async () => {
  const response = await request(app).get('/api/bootstrap').expect(200);

  assert.ok(response.body.home);
  assert.equal(response.body.home.liveSource.name, 'Adzuna');
  assert.ok(response.body.trends);
  assert.ok(response.body.roleGuides.current);
  assert.ok(Array.isArray(response.body.resume.targetRoles));
  assert.ok(response.body.resume.targetRoles.length >= 50);
  assert.ok(response.body.admin.weeklyReport);
});

test('GET /api/trends filters by category and search', async () => {
  const response = await request(app)
    .get('/api/trends')
    .query({ category: 'Tech', status: 'rising' })
    .expect(200);

  assert.equal(response.body.liveSource.name, 'Adzuna');
  assert.ok(Array.isArray(response.body.roles));
  if (response.body.roles.length > 0) {
    assert.ok(response.body.roles.every((role) => role.category === 'Tech'));
  }
});

test('GET /api/role-guides/:slug returns detailed guide', async () => {
  const response = await request(app).get('/api/role-guides/ai-product-manager').expect(200);

  assert.equal(response.body.slug, 'ai-product-manager');
  assert.ok(Array.isArray(response.body.skills));
  assert.ok(response.body.marketSignals);
});

test('GET /api/role-guides/dynamic builds a live guide from Adzuna data', async () => {
  const response = await request(app)
    .get('/api/role-guides/dynamic')
    .query({ title: 'Software Engineer', category: 'Tech', slug: 'tech-software-engineer' })
    .expect(200);

  assert.equal(response.body.slug, 'tech-software-engineer');
  assert.equal(response.body.category, 'Tech');
  assert.ok(Array.isArray(response.body.skills));
  assert.ok(Array.isArray(response.body.learningPath));
  assert.equal(response.body.generatedFromTrend, true);
});

test('POST /api/resume-check validates payload and returns role analysis', async () => {
  const response = await request(app)
    .post('/api/resume-check')
    .send({ targetRole: 'ux-research-lead', resumeText: 'Led user interviews and synthesized findings.' })
    .expect(200);

  assert.equal(response.body.role.slug, 'ux-research-lead');
  assert.ok(response.body.overallScore > 0);
  assert.ok(Array.isArray(response.body.suggestions));
  assert.ok(response.body.atsReport);
});

test('POST /api/resume-check supports dynamic trend roles', async () => {
  const response = await request(app)
    .post('/api/resume-check')
    .send({ targetRole: 'tech-software-engineer', resumeText: 'Built React dashboards, wrote JavaScript services, and shipped APIs.' })
    .expect(200);

  assert.equal(response.body.role.slug, 'tech-software-engineer');
  assert.ok(response.body.overallScore > 0);
  assert.ok(Array.isArray(response.body.skillsMatch.missing));
  assert.ok(response.body.atsReport);
});

test('POST /api/resume-check accepts uploaded resume files', async () => {
  const response = await request(app)
    .post('/api/resume-check')
    .field('targetRole', 'tech-software-engineer')
    .attach('resumeFile', Buffer.from('Built React dashboards with JavaScript and AWS integrations.'), 'resume.txt')
    .expect(200);

  assert.equal(response.body.role.slug, 'tech-software-engineer');
  assert.equal(response.body.input.parsedFromFile, true);
  assert.equal(response.body.input.resumeFileName, 'resume.txt');
});

test('POST /api/resume-check rejects invalid payload', async () => {
  const response = await request(app).post('/api/resume-check').send({ targetRole: '' }).expect(400);

  assert.equal(response.body.error, 'validation_error');
  assert.ok(Array.isArray(response.body.details));
});

test('GET /api/admin/reports/weekly returns report data', async () => {
  const response = await request(app).get('/api/admin/reports/weekly').expect(200);

  assert.equal(response.body.reportWeek, 'Week of March 1-7, 2026');
  assert.ok(Array.isArray(response.body.topWeakAreas));
  assert.ok(Array.isArray(response.body.recommendedActions));
});
