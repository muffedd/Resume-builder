import {
  designationFamiliesByCategory,
  spotlightFamiliesByCategory,
  trendCategories,
} from './trendDefinitions.js';
import { getLinkedInExamples } from './linkedinExamples.js';

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
const CACHE_TTL_MS = 1000 * 60 * 30;
const FETCH_CONCURRENCY = 2;
const MAX_CATEGORY_ROLE_COUNT = 50;
const LINKEDIN_EXAMPLE_LIMIT = 8;
const GROWTH_ROLE_LIMIT = 12;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const categoryList = trendCategories.filter((category) => category !== 'All');

function getCountry() {
  return process.env.ADZUNA_COUNTRY || 'us';
}

function getCredentials() {
  return {
    appId: process.env.ADZUNA_APP_ID,
    appKey: process.env.ADZUNA_APP_KEY,
  };
}

let payloadCache = {
  expiresAt: 0,
  entries: new Map(),
};

let currentRoleCache = new Map();
let trailingRoleCache = new Map();

function isConfigured() {
  const { appId, appKey } = getCredentials();
  return Boolean(appId && appKey);
}

function buildSource({ fallback, reason } = {}) {
  return {
    name: 'Adzuna',
    url: 'https://developer.adzuna.com/',
    country: getCountry(),
    methodology: 'Role demand is estimated from Adzuna search-count queries over the last 7 days, with category pages expanded to 50 tracked designations.',
    fetchedAt: new Date().toISOString(),
    fallback: Boolean(fallback),
    reason: reason || null,
  };
}

function buildCacheKey(query) {
  return JSON.stringify(query);
}

function buildRoleCacheKey(family) {
  return family.slug;
}

function getCached(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(cache, key, data) {
  cache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data,
  });
  return data;
}

function buildGrowthLabel(currentCount, previousCount) {
  if (previousCount <= 0) {
    return currentCount > 0 ? `+${currentCount} new` : '0%';
  }

  if (currentCount <= 0 && previousCount > 0) {
    return '-100%';
  }

  const deltaPercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
  return `${deltaPercent >= 0 ? '+' : ''}${deltaPercent}%`;
}

function buildStatus(currentCount, previousCount) {
  if (previousCount == null) {
    return currentCount > 0 ? 'rising' : 'stable';
  }
  if (currentCount === previousCount) return 'stable';
  return currentCount > previousCount ? 'rising' : 'falling';
}

async function withConcurrency(items, limit, iteratee) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await iteratee(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAdzunaCount({ what, maxDaysOld, categoryTag }) {
  const { appId, appKey } = getCredentials();
  const query = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '3',
    what,
    max_days_old: String(maxDaysOld),
    'content-type': 'application/json',
  });

  if (categoryTag) {
    query.set('category', categoryTag);
  }

  const url = `${ADZUNA_BASE_URL}/${getCountry()}/search/1?${query.toString()}`;
  let attempt = 0;

  while (attempt < 4) {
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      return {
        count: payload.count || 0,
        examples: (payload.results || []).slice(0, 3).map((job) => ({
          title: job.title,
          company: job.company?.display_name || 'Unknown company',
          url: job.redirect_url,
        })),
      };
    }

    attempt += 1;
    if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt >= 4) {
      throw new Error(`Adzuna request failed with ${response.status}`);
    }

    await sleep(400 * attempt);
  }

  throw new Error('Adzuna request failed after retries');
}

async function getCurrentFamilyData(family) {
  const key = buildRoleCacheKey(family);
  const cached = getCached(currentRoleCache, key);
  if (cached) return cached;

  const data = await fetchAdzunaCount({
    what: family.what,
    maxDaysOld: 7,
    categoryTag: family.categoryTag,
  });

  return setCached(currentRoleCache, key, data);
}

async function getTrailingFamilyCount(family) {
  const key = buildRoleCacheKey(family);
  const cached = getCached(trailingRoleCache, key);
  if (cached != null) return cached;

  const data = await fetchAdzunaCount({
    what: family.what,
    maxDaysOld: 14,
    categoryTag: family.categoryTag,
  });

  return setCached(trailingRoleCache, key, data.count || 0);
}

function buildMetric(family, currentData, previousCount = null) {
  const currentCount = currentData.count;
  const hasTrend = typeof previousCount === 'number';

  return {
    id: family.slug,
    slug: family.slug,
    title: family.title,
    category: family.category,
    currentCount,
    previousCount,
    growth: hasTrend ? buildGrowthLabel(currentCount, previousCount) : 'Updated weekly',
    status: buildStatus(currentCount, previousCount),
    liveJobExamples: currentData.examples ?? [],
    sparkline: hasTrend
      ? [previousCount, previousCount, currentCount, currentCount, currentCount, currentCount, currentCount]
      : [currentCount, currentCount, currentCount, currentCount, currentCount, currentCount, currentCount],
  };
}

async function getFamilyMetrics(families, options = {}) {
  const { withGrowth = true } = options;
  if (!families.length) return [];

  const currentEntries = await withConcurrency(families, FETCH_CONCURRENCY, async (family) => ({
    family,
    currentData: await getCurrentFamilyData(family),
  }));

  const sortedCurrentEntries = [...currentEntries].sort((left, right) => right.currentData.count - left.currentData.count);
  const growthFamilies = withGrowth
    ? sortedCurrentEntries.slice(0, Math.min(GROWTH_ROLE_LIMIT, sortedCurrentEntries.length)).map((entry) => entry.family)
    : [];

  const trailingCounts = new Map(
    await withConcurrency(growthFamilies, FETCH_CONCURRENCY, async (family) => [
      family.slug,
      await getTrailingFamilyCount(family),
    ]),
  );

  return currentEntries
    .map(({ family, currentData }) => {
      const trailingFourteen = trailingCounts.get(family.slug);
      const previousCount = typeof trailingFourteen === 'number'
        ? Math.max(trailingFourteen - currentData.count, 0)
        : null;
      return buildMetric(family, currentData, previousCount);
    })
    .sort((left, right) => right.currentCount - left.currentCount);
}

function getVisibleFamilies(selectedCategory) {
  if (selectedCategory === 'All') {
    return categoryList.flatMap((category) => spotlightFamiliesByCategory[category]);
  }

  return (designationFamiliesByCategory[selectedCategory] || []).slice(0, MAX_CATEGORY_ROLE_COUNT);
}

async function buildCategorySummaries(selectedCategory, selectedMetrics) {
  const selectedMetricsByCategory = new Map(
    categoryList.map((category) => [category, selectedMetrics.filter((metric) => metric.category === category)]),
  );

  return Promise.all(
    categoryList.map(async (category) => {
      let metrics;

      if (selectedCategory === 'All') {
        metrics = selectedMetricsByCategory.get(category) || [];
      } else if (category === selectedCategory) {
        metrics = selectedMetrics;
      } else {
        metrics = await getFamilyMetrics(spotlightFamiliesByCategory[category], { withGrowth: false });
      }

      return {
        category,
        openings: metrics.reduce((sum, role) => sum + role.currentCount, 0),
        growth: 'Updated weekly',
        roleCount: designationFamiliesByCategory[category]?.length || 0,
        topDesignations: metrics.slice(0, 3).map((role) => role.title),
      };
    }),
  );
}

export async function getAdzunaTrendsPayload(query = {}) {
  const key = buildCacheKey(query);
  if (Date.now() < payloadCache.expiresAt && payloadCache.entries.has(key)) {
    return payloadCache.entries.get(key);
  }

  const selectedCategory = query.category || 'All';
  const normalizedSearch = String(query.search || '').trim().toLowerCase();
  const visibleFamilies = getVisibleFamilies(selectedCategory);
  const metrics = await getFamilyMetrics(visibleFamilies, { withGrowth: true });

  const roles = metrics.filter((role) => {
    const matchesCategory = selectedCategory === 'All' || role.category === selectedCategory;
    const matchesSearch = !normalizedSearch || role.title.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  const categorySummaries = await buildCategorySummaries(selectedCategory, metrics);
  const orderedCategories = [...categorySummaries].sort((left, right) => right.openings - left.openings);
  const familiesForExamples = roles
    .filter((role) => role.currentCount > 0)
    .slice(0, LINKEDIN_EXAMPLE_LIMIT)
    .map((role) => visibleFamilies.find((family) => family.slug === role.slug))
    .filter(Boolean);

  const linkedInExamples = await getLinkedInExamples(familiesForExamples);
  const mergedRoles = roles.map((role) => ({
    ...role,
    liveJobExamples: linkedInExamples.examplesBySlug[role.slug]?.length ? linkedInExamples.examplesBySlug[role.slug] : role.liveJobExamples,
    examplesSource: linkedInExamples.examplesBySlug[role.slug]?.length ? 'linkedin' : 'adzuna',
  }));

  const payload = {
    selectedWeek: query.week || 'This Week',
    updateDate: new Date().toISOString().slice(0, 10),
    filters: {
      weeks: ['This Week'],
      categories: trendCategories,
      statuses: ['rising'],
    },
    heroStats: orderedCategories.map((category) => ({
      label: `${category.category} Jobs`,
      value: `${category.openings.toLocaleString()} postings`,
      change: category.growth,
    })),
    roles: mergedRoles,
    categorySummaries,
    skills: [],
    skillsByCategory: categorySummaries,
    regions: [],
    liveSource: {
      ...buildSource(),
      countsSource: 'Adzuna',
      examplesSource: linkedInExamples.source.fallback ? 'Adzuna' : linkedInExamples.source.name,
      examplesConfigured: linkedInExamples.source.configured,
      examplesReady: linkedInExamples.source.ready,
      examplesBrowserPath: linkedInExamples.source.browserPath,
      examplesFallback: linkedInExamples.source.fallback,
      examplesReason: linkedInExamples.source.reason,
    },
  };

  payloadCache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    entries: new Map(payloadCache.entries).set(key, payload),
  };

  return payload;
}

export async function getAdzunaHomeRoles() {
  const payload = await getAdzunaTrendsPayload({ week: 'This Week', category: 'All', status: 'rising', search: '' });
  return {
    roles: payload.roles.slice(0, 3),
    source: payload.liveSource,
  };
}

export function getAdzunaFallbackSource() {
  if (!isConfigured()) {
    return buildSource({ fallback: true, reason: 'Missing ADZUNA_APP_ID or ADZUNA_APP_KEY' });
  }

  return buildSource({ fallback: true, reason: 'Adzuna request failed' });
}

export function isAdzunaConfigured() {
  return isConfigured();
}
