import fs from 'node:fs';
import { loadLocalEnv } from '../loadEnv.js';

loadLocalEnv();

const scraperPkg = await import('linkedin-jobs-scraper');

const { LinkedinScraper, events, timeFilter } = scraperPkg.default;

const CACHE_TTL_MS = 1000 * 60 * 30;
const INVALID_SESSION_COOLDOWN_MS = 1000 * 60 * 30;
const SCRAPER_FAILURE_COOLDOWN_MS = 1000 * 60 * 10;
const LINKEDIN_EXAMPLES_ENABLED = process.env.LINKEDIN_EXAMPLES_ENABLED === '1';
const DEFAULT_CHROME_PATHS = [
  process.env.CHROME_PATH,
  'C:\\Users\\Admin\\.cache\\puppeteer\\chrome\\win64-146.0.7680.31\\chrome-win64\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

let examplesCache = {
  expiresAt: 0,
  entries: new Map(),
};

let invalidSessionUntil = 0;
let scraperUnavailableUntil = 0;
let scraperUnavailableReason = null;

function buildCacheKey(families) {
  return families.map((family) => family.slug).sort().join('|');
}

function resolveChromePath() {
  return DEFAULT_CHROME_PATHS.find((candidate) => fs.existsSync(candidate)) ?? null;
}

export function getLinkedInSourceStatus() {
  const browserPath = resolveChromePath();
  const hasCookie = Boolean(process.env.LI_AT_COOKIE);
  const ready = hasCookie && Boolean(browserPath);
  const invalidSessionActive = Date.now() < invalidSessionUntil;
  const temporaryFailureActive = Date.now() < scraperUnavailableUntil;

  let reason = null;
  if (!LINKEDIN_EXAMPLES_ENABLED) {
    reason = 'LinkedIn example scraping is disabled; using Adzuna examples only';
  } else if (!hasCookie) {
    reason = 'Missing LI_AT_COOKIE for reliable LinkedIn scraping';
  } else if (!browserPath) {
    reason = 'Chrome executable not found for LinkedIn scraper';
  } else if (invalidSessionActive) {
    reason = 'LinkedIn rejected the current LI_AT_COOKIE during the last validation attempt';
  } else if (temporaryFailureActive) {
    reason = scraperUnavailableReason || 'LinkedIn scraping is temporarily cooling down after a failed attempt';
  }

  return {
    name: 'LinkedIn Jobs Scraper',
    configured: hasCookie,
    ready: LINKEDIN_EXAMPLES_ENABLED && ready && !invalidSessionActive && !temporaryFailureActive,
    browserPath,
    fallback: !LINKEDIN_EXAMPLES_ENABLED || !ready || invalidSessionActive || temporaryFailureActive,
    reason,
  };
}

export async function getLinkedInExamples(families) {
  const key = buildCacheKey(families);
  if (Date.now() < examplesCache.expiresAt && examplesCache.entries.has(key)) {
    return examplesCache.entries.get(key);
  }

  const linkedInStatus = getLinkedInSourceStatus();

  if (!linkedInStatus.ready) {
    return {
      source: linkedInStatus,
      examplesBySlug: {},
    };
  }

  const examplesBySlug = Object.fromEntries(families.map((family) => [family.slug, []]));
  const queryToSlug = Object.fromEntries(families.map((family) => [family.linkedinQuery, family.slug]));

  const scraper = new LinkedinScraper({
    headless: 'new',
    slowMo: 150,
    executablePath: linkedInStatus.browserPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--lang=en-US'],
  });
  let scraperError = null;

  scraper.on(events.scraper.data, (data) => {
    const slug = queryToSlug[data.query];
    if (!slug) return;
    if (examplesBySlug[slug].length >= 3) return;

    examplesBySlug[slug].push({
      title: data.title,
      company: data.company,
      url: data.link,
      place: data.place,
      dateText: data.dateText,
    });
  });

  scraper.on(events.scraper.error, (error) => {
    scraperError = error;
  });

  const queries = families.map((family) => ({
    query: family.linkedinQuery,
    options: {
      locations: ['United States'],
      limit: 3,
      applyLink: false,
      skipPromotedJobs: true,
      filters: {
        time: timeFilter.WEEK,
      },
    },
  }));

  try {
    await scraper.run(queries, { limit: 3, skipPromotedJobs: true, applyLink: false });
    const totalExamples = Object.values(examplesBySlug).reduce((sum, examples) => sum + examples.length, 0);

    if (scraperError || totalExamples === 0) {
      if (scraperError?.message?.includes('session cookie is invalid')) {
        invalidSessionUntil = Date.now() + INVALID_SESSION_COOLDOWN_MS;
      } else {
        scraperUnavailableUntil = Date.now() + SCRAPER_FAILURE_COOLDOWN_MS;
        scraperUnavailableReason = scraperError?.message || 'LinkedIn scraper returned no examples for the current queries';
      }

      const payload = {
        source: {
          ...linkedInStatus,
          fallback: true,
          reason: scraperError?.message || 'LinkedIn scraper returned no examples for the current queries',
        },
        examplesBySlug: {},
      };

      examplesCache = {
        expiresAt: Date.now() + CACHE_TTL_MS,
        entries: new Map(examplesCache.entries).set(key, payload),
      };

      return payload;
    }

    scraperUnavailableUntil = 0;
    scraperUnavailableReason = null;

    const payload = {
      source: {
        ...linkedInStatus,
        fallback: false,
        reason: null,
      },
      examplesBySlug,
    };

    examplesCache = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      entries: new Map(examplesCache.entries).set(key, payload),
    };

    return payload;
  } catch (error) {
    if (error.message?.includes('session cookie is invalid')) {
      invalidSessionUntil = Date.now() + INVALID_SESSION_COOLDOWN_MS;
    } else {
      scraperUnavailableUntil = Date.now() + SCRAPER_FAILURE_COOLDOWN_MS;
      scraperUnavailableReason = error.message;
    }

    const payload = {
      source: {
        ...linkedInStatus,
        fallback: true,
        reason: error.message,
      },
      examplesBySlug: {},
    };

    examplesCache = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      entries: new Map(examplesCache.entries).set(key, payload),
    };

    return payload;
  } finally {
    await scraper.close().catch(() => {});
  }
}
