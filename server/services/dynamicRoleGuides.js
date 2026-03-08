import { designationFamiliesByCategory } from './trendDefinitions.js';
import { enhanceRoleGuideWithOpenRouter, isOpenRouterConfigured } from './openRouterRoleGuides.js';

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
const CACHE_TTL_MS = 1000 * 60 * 30;

const categoryTagDefaults = {
  Tech: 'it-jobs',
  Business: null,
  Design: 'creative-design-jobs',
  Data: 'it-jobs',
};

const skillCatalog = {
  Tech: ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'APIs', 'Terraform', 'CI/CD', 'Security', 'Git'],
  Business: ['Stakeholder Management', 'Project Management', 'Product Strategy', 'Operations', 'Analytics', 'Excel', 'SQL', 'CRM', 'Forecasting', 'Communication', 'Sales', 'Marketing', 'Leadership', 'Planning', 'Customer Success'],
  Design: ['Figma', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems', 'Accessibility', 'Visual Design', 'Interaction Design', 'Usability Testing', 'Adobe Creative Suite', 'Information Architecture', 'Storytelling'],
  Data: ['SQL', 'Python', 'Tableau', 'Power BI', 'Statistics', 'Machine Learning', 'Data Visualization', 'Forecasting', 'Experimentation', 'ETL', 'dbt', 'R', 'Data Modeling', 'Business Intelligence'],
};

const toolCatalog = {
  Tech: ['GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Jira', 'Postman', 'Datadog', 'Splunk', 'VS Code'],
  Business: ['Excel', 'Salesforce', 'HubSpot', 'Jira', 'Notion', 'Tableau', 'Looker', 'Power BI', 'Google Analytics', 'Marketo'],
  Design: ['Figma', 'FigJam', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe After Effects', 'Miro', 'Maze', 'Dovetail', 'Sketch'],
  Data: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'dbt', 'Snowflake', 'Looker', 'Jupyter', 'R'],
};

let guideCache = new Map();

function getCountry() {
  return process.env.ADZUNA_COUNTRY || 'us';
}

function getCredentials() {
  return {
    appId: process.env.ADZUNA_APP_ID,
    appKey: process.env.ADZUNA_APP_KEY,
  };
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function cacheKey({ title, category }) {
  return `${category}:${title.toLowerCase()}`;
}

function getCachedGuide(key) {
  const entry = guideCache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    guideCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedGuide(key, value) {
  guideCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

async function fetchAdzunaJobs({ title, category, maxDaysOld, resultsPerPage = 20 }) {
  const { appId, appKey } = getCredentials();
  const query = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: title.toLowerCase(),
    max_days_old: String(maxDaysOld),
    results_per_page: String(resultsPerPage),
    'content-type': 'application/json',
  });

  const categoryTag = categoryTagDefaults[category];
  if (categoryTag) {
    query.set('category', categoryTag);
  }

  const response = await fetch(`${ADZUNA_BASE_URL}/${getCountry()}/search/1?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`Adzuna role guide request failed with ${response.status}`);
  }

  return response.json();
}

function collectText(results) {
  return results.map((job) => `${job.title || ''} ${job.description || ''}`).join(' ');
}

function countPhrase(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

function topMatches(text, values, limit) {
  return values
    .map((value) => ({ value, count: countPhrase(text, value) }))
    .filter((entry) => entry.count > 0)
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .slice(0, limit)
    .map((entry, index) => ({
      name: entry.value,
      level: index < 2 ? 'core' : index < 4 ? 'rising' : 'optional',
      required: index < 4,
    }));
}

function average(numbers) {
  const valid = numbers.filter((value) => Number.isFinite(value) && value > 0);
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function formatSalary(min, max) {
  if (!min || !max) return 'Salary varies by market';
  const format = (value) => `$${Math.round(value / 1000)}K`;
  return `${format(min)} - ${format(max)}`;
}

function inferExperience(text) {
  const matches = [...text.matchAll(/(\d)\+?\s*(?:-|to)?\s*(\d)?\s+years?/gi)];
  if (!matches.length) return '2-5 years';
  const first = matches[0];
  return first[2] ? `${first[1]}-${first[2]} years` : `${first[1]}+ years`;
}

function inferRemoteProfile(results) {
  const text = collectText(results).toLowerCase();
  const remoteHits = (text.match(/remote/gi) || []).length;
  const hybridHits = (text.match(/hybrid/gi) || []).length;
  if (remoteHits > hybridHits && remoteHits > 0) return 'Remote common';
  if (hybridHits > 0) return 'Hybrid common';
  return 'Mostly on-site or hybrid';
}

function growthOutlook(weeklyCount, monthlyCount) {
  if (!monthlyCount) return 'Tracked weekly';
  const projectedMonth = weeklyCount * 4;
  if (projectedMonth >= monthlyCount * 0.9) return 'High';
  if (projectedMonth >= monthlyCount * 0.6) return 'Strong';
  return 'Moderate';
}

function buildLearningPath(title, skills, tools) {
  const foundationTopics = [...skills.slice(0, 2).map((skill) => skill.name), ...tools.slice(0, 1)].filter(Boolean);
  const appliedTopics = [...skills.slice(2, 4).map((skill) => skill.name), ...tools.slice(1, 3)].filter(Boolean);

  return [
    { stage: 'Foundation', duration: '2-3 weeks', topics: foundationTopics.length ? foundationTopics : [`${title} fundamentals`, 'Core workflows'] },
    { stage: 'Applied Practice', duration: '3-4 weeks', topics: appliedTopics.length ? appliedTopics : ['Execution habits', 'Portfolio work'] },
    { stage: 'Portfolio & Interview Prep', duration: '2-3 weeks', topics: ['Case-study storytelling', 'Mock interviews', 'Project polish'] },
  ];
}

function buildProjects(title, skills, category) {
  const primarySkill = skills[0]?.name || 'core skills';
  const secondarySkill = skills[1]?.name || 'execution';

  const categoryTemplates = {
    Tech: [
      `Build a production-ready ${title.toLowerCase()} project that highlights ${primarySkill}`,
      `Document an architecture or delivery decision with measurable tradeoffs around ${secondarySkill}`,
      'Ship a polished GitHub case study with metrics, screenshots, and technical notes',
    ],
    Business: [
      `Create a strategy memo or operating plan that demonstrates ${primarySkill}`,
      `Build a dashboard or analysis that supports decision-making with ${secondarySkill}`,
      'Present a portfolio case study showing execution, stakeholder alignment, and outcomes',
    ],
    Design: [
      `Design a case study for a ${title.toLowerCase()} workflow emphasizing ${primarySkill}`,
      `Run a lightweight research and iteration cycle using ${secondarySkill}`,
      'Publish a polished portfolio walkthrough with rationale, process, and final outcomes',
    ],
    Data: [
      `Analyze a real dataset and communicate findings through ${primarySkill}`,
      `Build a decision-ready dashboard or model that highlights ${secondarySkill}`,
      'Create a portfolio write-up with methodology, results, and business recommendations',
    ],
  };

  return categoryTemplates[category] || categoryTemplates.Tech;
}

function buildInterviewTopics(skills) {
  return skills.slice(0, 4).map((skill) => `${skill.name} examples from your past work`).concat(['Prioritization and tradeoffs', 'How you measure impact']).slice(0, 5);
}

function buildSimilarRoles(title, category) {
  return (designationFamiliesByCategory[category] || [])
    .map((family) => family.title)
    .filter((roleTitle) => roleTitle !== title)
    .slice(0, 3);
}

export async function buildDynamicRoleGuide({ title, category, slug }) {
  const key = cacheKey({ title, category });
  const cached = getCachedGuide(key);
  if (cached) return cached;

  const weeklyPayload = await fetchAdzunaJobs({ title, category, maxDaysOld: 7, resultsPerPage: 20 });
  const monthlyPayload = await fetchAdzunaJobs({ title, category, maxDaysOld: 30, resultsPerPage: 10 });

  const weeklyResults = weeklyPayload.results || [];
  const textCorpus = collectText(weeklyResults);
  const skills = topMatches(textCorpus, skillCatalog[category] || [], 6);
  const tools = topMatches(textCorpus, toolCatalog[category] || [], 6).map((tool) => tool.name);
  const avgSalaryMin = average(weeklyResults.map((job) => job.salary_min));
  const avgSalaryMax = average(weeklyResults.map((job) => job.salary_max));
  const topCompanies = [...new Set(weeklyResults.map((job) => job.company?.display_name).filter(Boolean))].slice(0, 3);

  const guide = {
    slug: slug || `${category.toLowerCase()}-${slugify(title)}`,
    title,
    category,
    status: 'rising',
    growth: `Rising ${weeklyPayload.count || 0} postings`,
    summary: weeklyPayload.count
      ? `${title} shows ${weeklyPayload.count.toLocaleString()} live postings this week on Adzuna. Recent listings most often emphasize ${skills.slice(0, 3).map((skill) => skill.name).join(', ') || 'the expected core workflow for the role'}.`
      : `${title} is tracked from recent live job postings on Adzuna, with the guide generated from current listing language.`,
    snapshot: {
      salary: formatSalary(avgSalaryMin, avgSalaryMax),
      experience: inferExperience(textCorpus),
      growth: growthOutlook(weeklyPayload.count || 0, monthlyPayload.count || 0),
      remote: inferRemoteProfile(weeklyResults),
    },
    skills: skills.length ? skills : [{ name: 'Role-specific domain knowledge', level: 'core', required: true }],
    tools: tools.length ? tools : ['Excel', 'Jira', 'Google Workspace'],
    learningPath: buildLearningPath(title, skills, tools),
    projects: buildProjects(title, skills, category),
    keywords: [title, ...skills.slice(0, 4).map((skill) => skill.name), ...tools.slice(0, 4)].filter((value, index, array) => array.indexOf(value) === index),
    interviewTopics: buildInterviewTopics(skills),
    marketSignals: {
      hiringVelocity: `${(weeklyPayload.count || 0).toLocaleString()} postings in the last 7 days`,
      competition: topCompanies.length ? `Top hiring companies in sampled listings: ${topCompanies.join(', ')}` : 'Competition data unavailable from current feed',
      timeToFill: `${(monthlyPayload.count || 0).toLocaleString()} postings found in the last 30 days`,
      similarRoles: buildSimilarRoles(title, category),
    },
    generatedFromTrend: true,
    aiEnhanced: false,
    source: {
      name: 'Adzuna',
      weeklyCount: weeklyPayload.count || 0,
      monthlyCount: monthlyPayload.count || 0,
      sampledListings: weeklyResults.length,
      aiProvider: isOpenRouterConfigured() ? 'OpenRouter (pending enhancement)' : null,
      aiModel: isOpenRouterConfigured() ? process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free' : null,
    },
  };

  let finalGuide = guide;
  try {
    finalGuide = await enhanceRoleGuideWithOpenRouter(guide, weeklyResults);
  } catch (error) {
    finalGuide = {
      ...guide,
      source: {
        ...guide.source,
        aiProvider: isOpenRouterConfigured() ? 'OpenRouter' : null,
        aiModel: isOpenRouterConfigured() ? process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free' : null,
        aiError: isOpenRouterConfigured() ? error.message : null,
      },
    };
  }

  return setCachedGuide(key, finalGuide);
}
