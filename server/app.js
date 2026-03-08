import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { z } from 'zod';
import { loadLocalEnv } from './loadEnv.js';
import {
  adminOverview,
  buildBootstrapPayload,
  buildResumeResult,
  buildTrendsPayload,
  categories,
  roleGuides,
  students,
  trendStatuses,
  weeklyReport,
} from './data/mockData.js';
import {
  getAdzunaFallbackSource,
  getAdzunaHomeRoles,
  getAdzunaTrendsPayload,
  isAdzunaConfigured,
} from './services/adzunaTrends.js';
import { buildDynamicResumeResult } from './services/dynamicResumeCheck.js';
import { buildDynamicRoleGuide } from './services/dynamicRoleGuides.js';
import { getLinkedInSourceStatus } from './services/linkedinExamples.js';
import { isOpenRouterConfigured } from './services/openRouterRoleGuides.js';
import { extractResumeTextFromFile } from './services/resumeFileParsing.js';
import { designationFamilies } from './services/trendDefinitions.js';

loadLocalEnv();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const trendsQuerySchema = z.object({
  week: z.string().optional(),
  category: z.enum(categories).optional(),
  search: z.string().optional(),
  status: z.enum(trendStatuses).optional(),
});

const resumeCheckSchema = z.object({
  targetRole: z.string().min(1),
  resumeText: z.string().max(20000).optional(),
  resumeFileName: z.string().max(200).optional(),
  parsedFromFile: z.boolean().optional(),
  parser: z.string().optional(),
});

const dynamicRoleGuideQuerySchema = z.object({
  title: z.string().min(1),
  category: z.enum(categories.filter((category) => category !== 'All')),
  slug: z.string().optional(),
});

function sendValidationError(res, error) {
  return res.status(400).json({
    error: 'validation_error',
    message: 'Request validation failed',
    details: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  });
}

function getResumeTargetRoles() {
  const merged = new Map();

  for (const role of roleGuides) {
    merged.set(role.slug, { slug: role.slug, title: role.title, category: role.category });
  }

  for (const family of designationFamilies) {
    if (!merged.has(family.slug)) {
      merged.set(family.slug, { slug: family.slug, title: family.title, category: family.category });
    }
  }

  return [...merged.values()].sort((left, right) => {
    if (left.category !== right.category) {
      return left.category.localeCompare(right.category);
    }
    return left.title.localeCompare(right.title);
  });
}

function buildResumeResponse() {
  const baseResume = buildBootstrapPayload().resume;
  return {
    ...baseResume,
    targetRoles: getResumeTargetRoles(),
  };
}

async function buildHomeResponse() {
  const baseHome = buildBootstrapPayload().home;

  try {
    const liveTrends = await getAdzunaHomeRoles();
    return {
      ...baseHome,
      trendingRoles: liveTrends.roles,
      liveSource: liveTrends.source,
    };
  } catch (_error) {
    return {
      ...baseHome,
      liveSource: getAdzunaFallbackSource(),
    };
  }
}

async function buildTrendsResponse(query) {
  try {
    return await getAdzunaTrendsPayload(query);
  } catch (_error) {
    return {
      ...buildTrendsPayload(query),
      liveSource: getAdzunaFallbackSource(),
    };
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'career-platform-api', timestamp: new Date().toISOString() });
});

app.get('/api/bootstrap', async (_req, res) => {
  const payload = buildBootstrapPayload();
  payload.home = await buildHomeResponse();
  payload.trends = await buildTrendsResponse();
  payload.resume = buildResumeResponse();
  res.json(payload);
});

app.get('/api/home', async (_req, res) => {
  res.json(await buildHomeResponse());
});

app.get('/api/data-source', (_req, res) => {
  const linkedInStatus = getLinkedInSourceStatus();

  res.json({
    provider: 'Adzuna',
    configured: isAdzunaConfigured(),
    country: process.env.ADZUNA_COUNTRY || 'us',
    requiredEnv: ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'],
    linkedInExamples: {
      provider: linkedInStatus.name,
      configured: linkedInStatus.configured,
      ready: linkedInStatus.ready,
      browserPath: linkedInStatus.browserPath,
      reason: linkedInStatus.reason,
      requiredEnv: ['LI_AT_COOKIE'],
    },
    aiGuides: {
      provider: 'OpenRouter',
      configured: isOpenRouterConfigured(),
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
      requiredEnv: ['OPENROUTER_API_KEY'],
    },
  });
});

app.get('/api/trends', async (req, res) => {
  const parsed = trendsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendValidationError(res, parsed.error);
  }

  res.json(await buildTrendsResponse(parsed.data));
});

app.get('/api/role-guides', (_req, res) => {
  res.json(
    roleGuides.map(({ id, slug, title, category, growthLabel, status, summary }) => ({
      id,
      slug,
      title,
      category,
      growth: growthLabel,
      status,
      summary,
    })),
  );
});

app.get('/api/role-guides/dynamic', async (req, res) => {
  const parsed = dynamicRoleGuideQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendValidationError(res, parsed.error);
  }

  try {
    const guide = await buildDynamicRoleGuide(parsed.data);
    res.json(guide);
  } catch (error) {
    res.status(502).json({ error: 'upstream_error', message: error.message });
  }
});

app.get('/api/role-guides/:slug', (req, res) => {
  const role = roleGuides.find((item) => item.slug === req.params.slug);
  if (!role) {
    return res.status(404).json({ error: 'not_found', message: 'Role guide not found' });
  }

  res.json(role);
});

app.post('/api/resume-check', upload.single('resumeFile'), async (req, res) => {
  let extractedFileText = '';
  let parser = null;

  if (req.file) {
    try {
      const extracted = await extractResumeTextFromFile(req.file);
      extractedFileText = extracted.text;
      parser = extracted.parser;
    } catch (error) {
      return res.status(400).json({ error: 'file_parse_error', message: error.message });
    }
  }

  const payload = {
    targetRole: req.body.targetRole,
    resumeText: extractedFileText || req.body.resumeText,
    resumeFileName: req.file?.originalname || req.body.resumeFileName,
    parsedFromFile: Boolean(req.file),
    parser: parser ?? undefined,
  };

  const parsed = resumeCheckSchema.safeParse(payload);
  if (!parsed.success) {
    return sendValidationError(res, parsed.error);
  }

  const targetRole = roleGuides.find((item) => item.slug === parsed.data.targetRole);
  if (targetRole) {
    return res.json({
      ...buildResumeResult(parsed.data.targetRole),
      input: {
        targetRole: parsed.data.targetRole,
        resumeFileName: parsed.data.resumeFileName ?? null,
        analyzedCharacters: parsed.data.resumeText?.length ?? 0,
        parsedFromFile: parsed.data.parsedFromFile ?? false,
        parser: parsed.data.parser ?? null,
      },
    });
  }

  const dynamicTargetRole = getResumeTargetRoles().find((item) => item.slug === parsed.data.targetRole);
  if (!dynamicTargetRole) {
    return res.status(404).json({ error: 'not_found', message: 'Target role not found' });
  }

  try {
    const guide = await buildDynamicRoleGuide(dynamicTargetRole);
    return res.json({
      ...buildDynamicResumeResult(guide, parsed.data.resumeText ?? ''),
      input: {
        targetRole: parsed.data.targetRole,
        resumeFileName: parsed.data.resumeFileName ?? null,
        analyzedCharacters: parsed.data.resumeText?.length ?? 0,
        parsedFromFile: parsed.data.parsedFromFile ?? false,
        parser: parsed.data.parser ?? null,
      },
    });
  } catch (error) {
    return res.status(502).json({ error: 'upstream_error', message: error.message });
  }
});

app.get('/api/admin/overview', (_req, res) => {
  res.json({
    ...adminOverview,
    weakAreas: weeklyReport.topWeakAreas,
    roleGaps: weeklyReport.roleGaps,
  });
});

app.get('/api/admin/weak-areas', (_req, res) => {
  res.json({ weakAreas: weeklyReport.topWeakAreas });
});

app.get('/api/admin/reports/weekly', (_req, res) => {
  res.json(weeklyReport);
});

app.get('/api/admin/students', (_req, res) => {
  res.json({ count: students.length, students });
});

app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: `No route for ${req.method} ${req.path}` });
});

export default app;
