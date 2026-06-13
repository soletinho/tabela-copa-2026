import { readFile, writeFile } from "node:fs/promises";

const API_URL = "https://v3.football.api-sports.io/fixtures";
const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);
const CHECK_AFTER_MINUTES = 135;

const apiKey = process.env.API_FOOTBALL_KEY;
const leagueId = process.env.API_FOOTBALL_LEAGUE_ID || "";
const season = process.env.API_FOOTBALL_SEASON || "2026";
const now = process.env.RESULTS_NOW ? new Date(process.env.RESULTS_NOW) : new Date();

if (!apiKey) {
  console.log("API_FOOTBALL_KEY is not configured. Skipping result update.");
  process.exit(0);
}

const schedule = await readJson("data/schedule.json");
const results = await readJson("data/results.json", {
  source: "api-football",
  updatedAt: null,
  matches: {},
});

const dueMatches = schedule.matches.filter((match) => {
  const cached = results.matches?.[match.id];
  if (cached?.final) return false;

  const kickoff = new Date(`${match.scheduledAtBrt}:00-03:00`);
  const firstCheck = new Date(kickoff.getTime() + CHECK_AFTER_MINUTES * 60 * 1000);
  return now >= firstCheck;
});

if (!dueMatches.length) {
  console.log("No matches are ready for result checks.");
  process.exit(0);
}

console.log(`Checking ${dueMatches.length} due match(es) against API-Football.`);
const fixtures = await fetchFixturesForDueDates(dueMatches);
let changed = false;

for (const match of dueMatches) {
  const fixtureMatch = findFixture(fixtures, match);
  if (!fixtureMatch) {
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

if (!changed) {
  console.log("No result changes detected.");
  process.exit(0);
}

results.source = "api-football";
results.updatedAt = now.toISOString();
await writeFile("data/results.json", `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log("data/results.json updated.");

async function readJson(path, fallback = undefined) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

async function fetchFixturesForDueDates(matches) {
  const dates = [...new Set(matches.map((match) => match.scheduledAtBrt.slice(0, 10)))];
  const fixtures = [];

  for (const date of dates) {
    const dateFixtures = await fetchFixtures({ date });
    fixtures.push(...dateFixtures);
  }

  return fixtures;
}

async function fetchFixtures({ date }) {
  const url = new URL(API_URL);
  url.searchParams.set("date", date);
  url.searchParams.set("timezone", "America/Sao_Paulo");

  if (leagueId) {
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
  const fixtures = payload.response || [];
  const scope = leagueId ? `league ${leagueId}, season ${season}` : "all competitions";
  console.log(`API returned ${fixtures.length} fixture(s) for ${date} (${scope}).`);

  return fixtures;
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
