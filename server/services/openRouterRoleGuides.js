import { z } from 'zod';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';

const aiGuideSchema = z.object({
  summary: z.string().min(20).max(500),
  skills: z.array(z.string().min(2)).min(3).max(8),
  tools: z.array(z.string().min(2)).min(2).max(8),
  learningPath: z.array(z.object({
    stage: z.string().min(2).max(80),
    duration: z.string().min(2).max(40),
    topics: z.array(z.string().min(2)).min(2).max(5),
  })).min(3).max(4),
  projects: z.array(z.string().min(8)).min(3).max(5),
  keywords: z.array(z.string().min(2)).min(4).max(10),
  interviewTopics: z.array(z.string().min(4)).min(4).max(8),
});

function stripCodeFences(value) {
  return String(value || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

function buildPrompt(baseGuide, sampledJobs) {
  const jobContext = sampledJobs
    .slice(0, 6)
    .map((job, index) => `Job ${index + 1}: ${job.title || 'Untitled'} at ${job.company?.display_name || 'Unknown'}\n${String(job.description || '').replace(/\s+/g, ' ').slice(0, 900)}`)
    .join('\n\n');

  return [
    `You are improving a career guide for the role "${baseGuide.title}" in the category "${baseGuide.category}".`,
    'Use the sampled live job postings and the extracted draft guide to make the guide more realistic and student-friendly.',
    'Keep the output grounded in the supplied job data. Do not invent niche tools unless they are strongly implied by the listings.',
    'Return JSON only with this exact shape:',
    JSON.stringify({
      summary: 'string',
      skills: ['string'],
      tools: ['string'],
      learningPath: [{ stage: 'string', duration: 'string', topics: ['string'] }],
      projects: ['string'],
      keywords: ['string'],
      interviewTopics: ['string'],
    }),
    '\nDraft guide:',
    JSON.stringify({
      summary: baseGuide.summary,
      skills: baseGuide.skills.map((skill) => skill.name),
      tools: baseGuide.tools,
      learningPath: baseGuide.learningPath,
      projects: baseGuide.projects,
      keywords: baseGuide.keywords,
      interviewTopics: baseGuide.interviewTopics,
    }),
    '\nSampled live job postings:',
    jobContext,
  ].join('\n');
}

export async function enhanceRoleGuideWithOpenRouter(baseGuide, sampledJobs) {
  if (!isOpenRouterConfigured()) {
    return baseGuide;
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://127.0.0.1:8787',
      'X-Title': 'Career Platform Role Guides',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: buildPrompt(baseGuide, sampledJobs),
        },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with ${response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  const parsed = aiGuideSchema.parse(JSON.parse(stripCodeFences(content)));

  return {
    ...baseGuide,
    summary: parsed.summary,
    skills: parsed.skills.map((name, index) => ({
      name,
      level: index < 2 ? 'core' : index < 4 ? 'rising' : 'optional',
      required: index < 4,
    })),
    tools: parsed.tools,
    learningPath: parsed.learningPath,
    projects: parsed.projects,
    keywords: parsed.keywords,
    interviewTopics: parsed.interviewTopics,
    aiEnhanced: true,
    source: {
      ...baseGuide.source,
      aiProvider: 'OpenRouter',
      aiModel: DEFAULT_MODEL,
    },
  };
}
