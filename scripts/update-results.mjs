import { readFile, writeFile } from "node:fs/promises";

const API_URL = "https://v3.football.api-sports.io/fixtures";
const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);
const CHECK_AFTER_MINUTES = 135;

const apiKey = process.env.API_FOOTBALL_KEY;
const leagueId = process.env.API_FOOTBALL_LEAGUE_ID || "";
const season = process.env.API_FOOTBALL_SEASON || "2026";
const now = process.env.RESULTS_NOW ? new Date(process.env.RESULTS_NOW) : new Date();

const schedule = await readJson("data/schedule.json");
const results = await readJson("data/results.json", {
  source: "api-football",
  updatedAt: null,
  matches: {},
});
const manualResults = await readJson("data/manual-results.json", {
  source: "manual",
  updatedAt: null,
  matches: {},
});

let changed = applyManualResults(results, manualResults);

const dueMatches = schedule.matches.filter((match) => {
  const cached = results.matches?.[match.id];
  if (cached?.final) return false;

  const kickoff = new Date(`${match.scheduledAtBrt}:00-03:00`);
  const firstCheck = new Date(kickoff.getTime() + CHECK_AFTER_MINUTES * 60 * 1000);
  return now >= firstCheck;
});

if (!dueMatches.length) {
  console.log("No matches are ready for result checks.");
  await finish(changed, results);
}

if (!apiKey) {
  throw new Error(
    "API_FOOTBALL_KEY is not configured, and there are due matches waiting for results. "
      + "Configure the repository secret or add the results to data/manual-results.json.",
  );
}

console.log(`Checking ${dueMatches.length} due match(es) against API-Football.`);
console.log(`Lookup scope: ${leagueId ? `league ${leagueId}, season ${season}` : "all competitions by date"}.`);
const fixtures = await fetchFixturesForDueDates(dueMatches);

let missingFixtureCount = 0;
for (const match of dueMatches) {
  const fixtureMatch = findFixture(fixtures, match);
  if (!fixtureMatch) {
    missingFixtureCount += 1;
    console.log(`No API fixture found for ${match.id}: ${match.home} x ${match.away}`);
    continue;
  }

  const { fixture, reversed } = fixtureMatch;
  const status = fixture.fixture?.status?.short || "";
  const homeGoals = reversed ? fixture.goals?.away : fixture.goals?.home;
  const awayGoals = reversed ? fixture.goals?.home : fixture.goals?.away;
  const final = FINAL_STATUSES.has(status);

  if (homeGoals === null || awayGoals === null || homeGoals === undefined || awayGoals === undefined) {
    console.log(`Fixture ${fixture.fixture?.id} for ${match.id} has no score yet (${status || "no status"}).`);
    continue;
  }

  const nextResult = {
    apiFixtureId: fixture.fixture?.id || null,
    status,
    final,
    homeGoals,
    awayGoals,
    checkedAt: now.toISOString(),
  };

  const previous = results.matches[match.id];
  if (JSON.stringify(previous) !== JSON.stringify(nextResult)) {
    results.matches[match.id] = nextResult;
    changed = true;
    console.log(
      `${match.id}: ${match.home} ${homeGoals} x ${awayGoals} ${match.away} (${status || "status pending"})`,
    );
  }
}

if (missingFixtureCount === dueMatches.length && fixtures.length === 0) {
  throw new Error(
    `API-Football returned zero fixtures for all checked dates, so no due matches could be updated. `
      + `Checked ${dueMatches.length} due match(es). `
      + `This usually means the configured league/season is wrong, the API plan does not expose these fixtures, `
      + `or the API provider has not published World Cup 2026 fixtures/results yet.`,
  );
}

await finish(changed, results);

async function readJson(path, fallback = undefined) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

function applyManualResults(results, manualResults) {
  let changed = false;

  for (const [matchId, result] of Object.entries(manualResults.matches || {})) {
    const previous = results.matches[matchId];
    if (previous?.final && previous.source !== "manual") continue;

    const nextResult = {
      ...result,
      source: "manual",
    };

    if (JSON.stringify(previous) === JSON.stringify(nextResult)) continue;

    results.matches[matchId] = nextResult;
    changed = true;
    console.log(`Applied manual final result for ${matchId}.`);
  }

  return changed;
}

async function finish(changed, results) {
  if (!changed) {
    console.log("No result changes detected.");
    process.exit(0);
  }

  results.source = "api-football";
  results.updatedAt = now.toISOString();
  await writeFile("data/results.json", `${JSON.stringify(results, null, 2)}\n`, "utf8");
  console.log("data/results.json updated.");
  process.exit(0);
}

async function fetchFixturesForDueDates(matches) {
  const dates = [...new Set(matches.map((match) => match.scheduledAtBrt.slice(0, 10)))];
  const fixtures = [];

  for (const date of dates) {
    let dateFixtures = [];

    try {
      dateFixtures = await fetchFixtures({ date });
    } catch (error) {
      if (!leagueId) throw error;
      console.log(`League-scoped API lookup failed for ${date}: ${error.message}`);
      console.log(`Retrying ${date} across all competitions.`);
      const fallbackFixtures = await fetchFixtures({ date, ignoreLeague: true });
      fixtures.push(...fallbackFixtures);
      continue;
    }

    if (dateFixtures.length || !leagueId) {
      fixtures.push(...dateFixtures);
      continue;
    }

    console.log(`No fixtures found for ${date} with league ${leagueId}. Retrying all competitions.`);
    const fallbackFixtures = await fetchFixtures({ date, ignoreLeague: true });
    fixtures.push(...fallbackFixtures);
  }

  return fixtures;
}

async function fetchFixtures({ date, ignoreLeague = false }) {
  const url = new URL(API_URL);
  url.searchParams.set("date", date);
  url.searchParams.set("timezone", "America/Sao_Paulo");

  if (leagueId && !ignoreLeague) {
    url.searchParams.set("league", leagueId);
    url.searchParams.set("season", season);
  }

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football request for ${date} failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const apiErrors = normalizeApiErrors(payload.errors);
  if (apiErrors.length) {
    throw new Error(`API-Football returned error(s) for ${date}: ${apiErrors.join("; ")}`);
  }

  const fixtures = payload.response || [];
  const scope = leagueId && !ignoreLeague ? `league ${leagueId}, season ${season}` : "all competitions";
  console.log(`API returned ${fixtures.length} fixture(s) for ${date} (${scope}).`);

  return fixtures;
}

function normalizeApiErrors(errors) {
  if (!errors) return [];
  if (Array.isArray(errors)) return errors.map(String).filter(Boolean);
  if (typeof errors === "string") return errors ? [errors] : [];
  if (typeof errors === "object") {
    return Object.entries(errors).flatMap(([key, value]) => {
      if (Array.isArray(value)) return value.map((item) => `${key}: ${item}`);
      if (value) return [`${key}: ${value}`];
      return [];
    });
  }
  return [String(errors)];
}

function findFixture(fixtures, match) {
  const homeAliases = aliases(match.home, match.apiHomeNames);
  const awayAliases = aliases(match.away, match.apiAwayNames);

  for (const fixture of fixtures) {
    const apiHome = normalize(fixture.teams?.home?.name || "");
    const apiAway = normalize(fixture.teams?.away?.name || "");
    const direct = homeAliases.has(apiHome) && awayAliases.has(apiAway);
    const reversed = homeAliases.has(apiAway) && awayAliases.has(apiHome);
    if (direct || reversed) return { fixture, reversed };
  }

  return null;
}

function aliases(primary, extra = []) {
  return new Set([primary, ...extra].map(normalize));
}

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}
