const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs?limit=250';
const CACHE_TTL_MS = 1000 * 60 * 30;
const DAY_MS = 1000 * 60 * 60 * 24;

const roleFamilies = [
  {
    key: 'software-engineering',
    title: 'Software Engineering',
    category: 'Tech',
    keywords: ['software engineer', 'developer', 'full-stack', 'full stack', 'frontend', 'backend', 'react', 'node', 'typescript'],
    categoryKeywords: ['software development'],
  },
  {
    key: 'ai-ml-engineering',
    title: 'AI / ML Engineering',
    category: 'Tech',
    keywords: ['ai', 'ml', 'machine learning', 'llm', 'genai', 'prompt', 'mlops', 'data science'],
    categoryKeywords: ['ai / ml'],
  },
  {
    key: 'devops-cloud',
    title: 'DevOps & Cloud',
    category: 'Tech',
    keywords: ['devops', 'cloud', 'platform engineer', 'sre', 'sysadmin', 'infrastructure', 'aws', 'azure', 'gcp'],
    categoryKeywords: ['devops / sysadmin'],
  },
  {
    key: 'product-design',
    title: 'Product Design',
    category: 'Design',
    keywords: ['designer', 'design', 'ux', 'ui', 'figma', 'brand'],
    categoryKeywords: ['design'],
  },
  {
    key: 'data-analytics',
    title: 'Data & Analytics',
    category: 'Data',
    keywords: ['data', 'analytics', 'analyst', 'bi ', 'business intelligence', 'research', 'sql'],
    categoryKeywords: ['data'],
  },
  {
    key: 'marketing-content',
    title: 'Marketing & Content',
    category: 'Business',
    keywords: ['marketing', 'content', 'copywriter', 'writer', 'seo', 'growth', 'social media'],
    categoryKeywords: ['marketing', 'writing'],
  },
  {
    key: 'sales-business-dev',
    title: 'Sales & Business Development',
    category: 'Business',
    keywords: ['sales', 'business development', 'account executive', 'partnership', 'market specialist', 'market research'],
    categoryKeywords: ['sales / business'],
  },
  {
    key: 'project-product-management',
    title: 'Project & Product Management',
    category: 'Business',
    keywords: ['product manager', 'project manager', 'program manager', 'delivery manager', 'operations manager'],
    categoryKeywords: ['project management'],
  },
  {
    key: 'customer-success',
    title: 'Customer Success & Support',
    category: 'Business',
    keywords: ['customer success', 'customer support', 'support', 'success manager', 'service representative'],
    categoryKeywords: ['customer service'],
  },
  {
    key: 'operations-finance',
    title: 'Operations & Finance',
    category: 'Business',
    keywords: ['accounting', 'finance', 'bookkeeping', 'operations', 'crypto market', 'compliance'],
    categoryKeywords: ['all others'],
  },
];

let jobsCache = {
  expiresAt: 0,
  jobs: null,
};

function buildSource(fallback = false) {
  return {
    name: 'Remotive',
    url: 'https://remotive.com/remote-jobs',
    methodology: 'Role families are ranked from live Remotive postings by comparing the selected period against the previous matching period.',
    fetchedAt: new Date().toISOString(),
    fallback,
  };
}

function getWindowRange(week) {
  const now = Date.now();

  if (week === 'Last Week') {
    const end = now - 7 * DAY_MS;
    const start = end - 7 * DAY_MS;
    return { start, end, previousStart: start - 7 * DAY_MS, previousEnd: start, bucketSize: DAY_MS };
  }

  if (week === 'This Month') {
    const end = now;
    const start = end - 30 * DAY_MS;
    const duration = end - start;
    return { start, end, previousStart: start - 30 * DAY_MS, previousEnd: start, bucketSize: duration / 7 };
  }

  const end = now;
  const start = end - 7 * DAY_MS;
  return { start, end, previousStart: start - 7 * DAY_MS, previousEnd: start, bucketSize: DAY_MS };
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function jobMatchesKeyword(jobText, keyword) {
  return jobText.includes(keyword.toLowerCase());
}

function classifyJob(job) {
  const text = `${job.title} ${job.category} ${(job.tags || []).join(' ')}`.toLowerCase();

  for (const family of roleFamilies) {
    const matchedKeyword = family.keywords.some((keyword) => jobMatchesKeyword(text, keyword));
    const matchedCategory = family.categoryKeywords.some((keyword) => jobMatchesKeyword(normalizeText(job.category), keyword));
    if (matchedKeyword || matchedCategory) {
      return family;
    }
  }

  return null;
}

function isInWindow(timestamp, start, end) {
  return Number.isFinite(timestamp) && timestamp >= start && timestamp < end;
}

function countJobs(jobs, start, end) {
  return jobs.filter((job) => isInWindow(Date.parse(job.publication_date), start, end)).length;
}

function buildSparkline(jobs, start, end, bucketSize) {
  return Array.from({ length: 7 }, (_unused, index) => {
    const bucketStart = start + bucketSize * index;
    const bucketEnd = index === 6 ? end + 1 : start + bucketSize * (index + 1);
    return jobs.filter((job) => {
      const publishedAt = Date.parse(job.publication_date);
      return isInWindow(publishedAt, bucketStart, bucketEnd);
    }).length;
  });
}

function buildGrowthLabel(currentCount, previousCount) {
  if (previousCount <= 0) {
    return currentCount > 0 ? `+${currentCount} new` : '0%';
  }

  if (currentCount <= 0 && previousCount > 0) {
    return '-100%';
  }

  if (Math.abs(currentCount - previousCount) <= 1) {
    return '0%';
  }

  const deltaPercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
  return `${deltaPercent >= 0 ? '+' : ''}${deltaPercent}%`;
}

function buildStatus(currentCount, previousCount) {
  if (currentCount === 0 && previousCount > 0) return 'falling';
  if (currentCount > 0 && previousCount === 0) return 'rising';
  if (Math.abs(currentCount - previousCount) <= 1) return 'stable';
  return currentCount > previousCount ? 'rising' : 'falling';
}

function buildTopTags(jobs, windowRange, category) {
  const currentCounts = new Map();
  const previousCounts = new Map();

  for (const job of jobs) {
    const timestamp = Date.parse(job.publication_date);
    const tags = Array.isArray(job.tags) ? job.tags : [];
    for (const rawTag of tags) {
      const tag = String(rawTag).trim();
      if (!tag || tag.length > 24) continue;
      if (isInWindow(timestamp, windowRange.start, windowRange.end + 1)) {
        currentCounts.set(tag, (currentCounts.get(tag) || 0) + 1);
      } else if (isInWindow(timestamp, windowRange.previousStart, windowRange.previousEnd)) {
        previousCounts.set(tag, (previousCounts.get(tag) || 0) + 1);
      }
    }
  }

  return [...currentCounts.entries()]
    .map(([name, count]) => {
      const previousCount = previousCounts.get(name) || 0;
      return {
        name,
        category,
        trend: buildStatus(count, previousCount),
        score: count,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 10)
    .map(({ score, ...skill }) => skill);
}

function buildSkillsByCategory(roles) {
  const categoryStats = ['Tech', 'Data', 'Design', 'Business'].map((category) => {
    const matchingRoles = roles.filter((role) => role.category === category);
    const currentTotal = matchingRoles.reduce((sum, role) => sum + role.currentCount, 0);
    const previousTotal = matchingRoles.reduce((sum, role) => sum + role.previousCount, 0);

    return {
      category,
      skills: currentTotal,
      growth: buildGrowthLabel(currentTotal, previousTotal),
    };
  });

  return categoryStats;
}

function buildLocationRanks(jobs, windowRange) {
  const counts = new Map();

  for (const job of jobs) {
    const timestamp = Date.parse(job.publication_date);
    if (!isInWindow(timestamp, windowRange.start, windowRange.end + 1)) continue;
    const location = String(job.candidate_required_location || 'Worldwide').trim();
    counts.set(location, (counts.get(location) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([region, score], index) => ({ region, rank: index + 1, score }));
}

async function fetchRemotiveJobs() {
  if (jobsCache.jobs && Date.now() < jobsCache.expiresAt) {
    return jobsCache.jobs;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(REMOTIVE_API_URL, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Remotive request failed with ${response.status}`);
    }

    const payload = await response.json();
    const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];

    jobsCache = {
      jobs,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    return jobs;
  } finally {
    clearTimeout(timeout);
  }
}

function buildFamilyMetrics(jobs, windowRange) {
  return roleFamilies
    .map((family, index) => {
      const matchedJobs = jobs.filter((job) => classifyJob(job)?.key === family.key);
      const currentCount = countJobs(matchedJobs, windowRange.start, windowRange.end + 1);
      const previousCount = countJobs(matchedJobs, windowRange.previousStart, windowRange.previousEnd);
      const totalCount = currentCount + previousCount;

      if (!totalCount) {
        return null;
      }

      return {
        id: index + 1,
        slug: family.key,
        title: family.title,
        category: family.category,
        status: buildStatus(currentCount, previousCount),
        growth: buildGrowthLabel(currentCount, previousCount),
        sparkline: buildSparkline(matchedJobs, windowRange.start, windowRange.end, windowRange.bucketSize),
        currentCount,
        previousCount,
        totalCount,
        jobs: matchedJobs,
      };
    })
    .filter(Boolean);
}

export async function getLiveTrendsPayload({ week = 'This Week', category = 'All', search = '', status = 'rising' } = {}) {
  const jobs = await fetchRemotiveJobs();
  if (!jobs.length) {
    throw new Error('No live jobs returned from Remotive');
  }

  const windowRange = getWindowRange(week);
  const normalizedSearch = normalizeText(search).trim();
  const familyMetrics = buildFamilyMetrics(jobs, windowRange);

  const filteredRoles = familyMetrics
    .filter((role) => {
      const matchesCategory = category === 'All' || role.category === category;
      const matchesStatus = !status || role.status === status;
      const matchesSearch =
        !normalizedSearch ||
        normalizeText(role.title).includes(normalizedSearch) ||
        role.jobs.some((job) => normalizeText(job.title).includes(normalizedSearch) || normalizeText(job.category).includes(normalizedSearch));

      return matchesCategory && matchesStatus && matchesSearch;
    })
    .sort((left, right) => {
      if (right.currentCount !== left.currentCount) {
        return right.currentCount - left.currentCount;
      }
      return right.totalCount - left.totalCount;
    });

  const scopeForDerivedData = familyMetrics.filter((role) => category === 'All' || role.category === category);
  const scopedJobs = scopeForDerivedData.flatMap((role) => role.jobs);
  const risingRoles = familyMetrics
    .filter((role) => role.status === 'rising')
    .sort((left, right) => right.currentCount - left.currentCount);

  return {
    selectedWeek: week,
    updateDate: new Date().toISOString().slice(0, 10),
    filters: {
      weeks: ['This Week', 'Last Week', 'This Month'],
      categories: ['All', 'Tech', 'Business', 'Design', 'Data'],
      statuses: ['rising', 'stable', 'falling'],
    },
    heroStats: [
      {
        label: 'Top Rising Role',
        value: risingRoles[0]?.title ?? 'No live signal',
        change: risingRoles[0]?.growth ?? '0%',
      },
      {
        label: 'Top Demand Category',
        value: scopeForDerivedData.sort((a, b) => b.currentCount - a.currentCount)[0]?.category ?? 'No live signal',
        change: `${scopeForDerivedData.reduce((sum, role) => sum + role.currentCount, 0)} live roles`,
      },
      {
        label: 'Most Active Source',
        value: 'Remotive',
        change: `${jobs.length} tracked postings`,
      },
      {
        label: 'Updated',
        value: new Date().toISOString().slice(0, 10),
        change: week,
      },
    ],
    roles: filteredRoles.map(({ jobs: matchedJobs, totalCount, previousCount, currentCount, ...role }) => ({
      ...role,
      demandCount: currentCount,
      previousCount,
      liveJobExamples: matchedJobs.slice(0, 2).map((job) => ({
        title: job.title,
        company: job.company_name,
        url: job.url,
      })),
    })),
    skills: buildTopTags(scopedJobs, windowRange, category === 'All' ? 'Tech' : category),
    skillsByCategory: buildSkillsByCategory(familyMetrics),
    regions: buildLocationRanks(scopedJobs.length ? scopedJobs : jobs, windowRange),
    liveSource: buildSource(false),
  };
}

export async function getLiveTrendingRoles() {
  const payload = await getLiveTrendsPayload({ week: 'This Week', category: 'All', status: 'rising' });
  return {
    roles: payload.roles.slice(0, 3),
    source: payload.liveSource,
  };
}

export function getFallbackTrendSource() {
  return buildSource(true);
}
