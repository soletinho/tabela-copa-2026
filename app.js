const STORAGE_KEY = "copa-2026-tabela";
const RESULTS_URL = "data/results.json";
const MANUAL_URL = "data/manual-results.json";
const KNOCKOUT_URL = "data/knockout-schedule.json";

const groupTeams = {
  A: ["México", "África do Sul", "Coreia do Sul", "República Tcheca"],
  B: ["Canadá", "Bósnia", "Catar", "Suíça"],
  C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
  D: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  E: ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
  F: ["Holanda", "Japão", "Suécia", "Tunísia"],
  G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  H: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  I: ["França", "Senegal", "Iraque", "Noruega"],
  J: ["Argentina", "Argélia", "Áustria", "Jordânia"],
  K: ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
  L: ["Inglaterra", "Croácia", "Gana", "Panamá"],
};

const teamFlags = {
  A1: "mx", A2: "za", A3: "kr", A4: "cz",
  B1: "ca", B2: "ba", B3: "qa", B4: "ch",
  C1: "br", C2: "ma", C3: "ht", C4: "gb-sct",
  D1: "us", D2: "py", D3: "au", D4: "tr",
  E1: "de", E2: "cw", E3: "ci", E4: "ec",
  F1: "nl", F2: "jp", F3: "se", F4: "tn",
  G1: "be", G2: "eg", G3: "ir", G4: "nz",
  H1: "es", H2: "cv", H3: "sa", H4: "uy",
  I1: "fr", I2: "sn", I3: "iq", I4: "no",
  J1: "ar", J2: "dz", J3: "at", J4: "jo",
  K1: "pt", K2: "cd", K3: "uz", K4: "co",
  L1: "gb-eng", L2: "hr", L3: "gh", L4: "pa",
};

// Country name -> flag code mapping for knockout
const countryFlags = {
  "África do Sul": "za", "Alemanha": "de", "Argentina": "ar", "Argélia": "dz",
  "Austrália": "au", "Áustria": "at", "Bélgica": "be", "Bósnia": "ba",
  "Brasil": "br", "Cabo Verde": "cv", "Canadá": "ca", "Colômbia": "co",
  "Coreia do Sul": "kr", "Costa do Marfim": "ci", "Croácia": "hr", "Curaçao": "cw",
  "Egito": "eg", "Equador": "ec", "Escócia": "gb-sct", "Espanha": "es",
  "Estados Unidos": "us", "França": "fr", "Gana": "gh", "Haiti": "ht",
  "Holanda": "nl", "Inglaterra": "gb-eng", "Irã": "ir", "Iraque": "iq",
  "Japão": "jp", "Jordânia": "jo", "Marrocos": "ma", "México": "mx",
  "Noruega": "no", "Nova Zelândia": "nz", "Panamá": "pa", "Paraguai": "py",
  "Portugal": "pt", "RD Congo": "cd", "República Tcheca": "cz", "Senegal": "sn",
  "Suécia": "se", "Suíça": "ch", "Tunísia": "tn", "Turquia": "tr",
  "Uruguai": "uy", "Uzbequistão": "uz", "Catar": "qa",
};

const initialGroups = Object.entries(groupTeams).map(([letter, teams]) => ({
  id: letter,
  teams: teams.map((name, index) => ({
    id: `${letter}${index + 1}`,
    flag: teamFlags[`${letter}${index + 1}`],
    name,
  })),
}));

const groupStageRounds = [
  ["1", "2"], ["3", "4"], ["1", "3"], ["4", "2"], ["4", "1"], ["2", "3"],
];

const kickoffTimes = {
  "A-1": "2026-06-11T16:00", "A-2": "2026-06-11T23:00", "A-3": "2026-06-18T22:00",
  "A-4": "2026-06-18T13:00", "A-5": "2026-06-24T22:00", "A-6": "2026-06-24T22:00",
  "B-1": "2026-06-12T19:00", "B-2": "2026-06-13T16:00", "B-3": "2026-06-18T19:00",
  "B-4": "2026-06-18T16:00", "B-5": "2026-06-24T16:00", "B-6": "2026-06-24T16:00",
  "C-1": "2026-06-13T19:00", "C-2": "2026-06-13T22:00", "C-3": "2026-06-19T21:30",
  "C-4": "2026-06-19T19:00", "C-5": "2026-06-24T19:00", "C-6": "2026-06-24T19:00",
  "D-1": "2026-06-12T22:00", "D-2": "2026-06-14T01:00", "D-3": "2026-06-19T16:00",
  "D-4": "2026-06-20T00:00", "D-5": "2026-06-25T23:00", "D-6": "2026-06-25T23:00",
  "E-1": "2026-06-14T14:00", "E-2": "2026-06-14T20:00", "E-3": "2026-06-20T17:00",
  "E-4": "2026-06-20T21:00", "E-5": "2026-06-25T17:00", "E-6": "2026-06-25T17:00",
  "F-1": "2026-06-14T17:00", "F-2": "2026-06-14T23:00", "F-3": "2026-06-20T14:00",
  "F-4": "2026-06-21T01:00", "F-5": "2026-06-25T20:00", "F-6": "2026-06-25T20:00",
  "G-1": "2026-06-15T16:00", "G-2": "2026-06-15T22:00", "G-3": "2026-06-21T16:00",
  "G-4": "2026-06-21T22:00", "G-5": "2026-06-27T00:00", "G-6": "2026-06-27T00:00",
  "H-1": "2026-06-15T13:00", "H-2": "2026-06-15T19:00", "H-3": "2026-06-21T13:00",
  "H-4": "2026-06-21T19:00", "H-5": "2026-06-26T21:00", "H-6": "2026-06-26T21:00",
  "I-1": "2026-06-16T16:00", "I-2": "2026-06-16T19:00", "I-3": "2026-06-22T18:00",
  "I-4": "2026-06-22T21:00", "I-5": "2026-06-26T16:00", "I-6": "2026-06-26T16:00",
  "J-1": "2026-06-16T22:00", "J-2": "2026-06-17T01:00", "J-3": "2026-06-22T14:00",
  "J-4": "2026-06-23T00:00", "J-5": "2026-06-27T23:00", "J-6": "2026-06-27T23:00",
  "K-1": "2026-06-17T14:00", "K-2": "2026-06-17T23:00", "K-3": "2026-06-23T14:00",
  "K-4": "2026-06-23T23:00", "K-5": "2026-06-27T20:30", "K-6": "2026-06-27T20:30",
  "L-1": "2026-06-17T17:00", "L-2": "2026-06-17T20:00", "L-3": "2026-06-23T17:00",
  "L-4": "2026-06-23T20:00", "L-5": "2026-06-27T18:00", "L-6": "2026-06-27T18:00",
};

// ---------- Knockout bracket tree ----------
// Winner of [0] plays winner of [1] → next round slot
const knockoutTree = {
  left: {
    R32: ["R32-1","R32-2","R32-3","R32-4","R32-5","R32-6","R32-7","R32-8"],
    R16: ["R16-1","R16-2","R16-3","R16-4"],
    QF:  ["QF-1","QF-2"],
    SF:  ["SF-1"],
  },
  right: {
    R32: ["R32-9","R32-10","R32-11","R32-12","R32-13","R32-14","R32-15","R32-16"],
    R16: ["R16-5","R16-6","R16-7","R16-8"],
    QF:  ["QF-3","QF-4"],
    SF:  ["SF-2"],
  },
  center: {
    FINAL: ["FINAL"],
    THIRD: ["3RD"],
  },
};

// Adjacent pairs in R32 feed into R16, etc.
const roundConnections = {
  "R16-1": ["R32-1","R32-2"], "R16-2": ["R32-3","R32-4"],
  "R16-3": ["R32-5","R32-6"], "R16-4": ["R32-7","R32-8"],
  "R16-5": ["R32-9","R32-10"], "R16-6": ["R32-11","R32-12"],
  "R16-7": ["R32-13","R32-14"], "R16-8": ["R32-15","R32-16"],
  "QF-1": ["R16-1","R16-2"], "QF-2": ["R16-3","R16-4"],
  "QF-3": ["R16-5","R16-6"], "QF-4": ["R16-7","R16-8"],
  "SF-1": ["QF-1","QF-2"], "SF-2": ["QF-3","QF-4"],
  "FINAL": ["SF-1","SF-2"], "3RD": ["SF-1","SF-2"],
};

// ---------- State ----------
let state = loadState();
let remoteResults = { matches: {}, updatedAt: null };
let knockoutSchedule = { rounds: {} };
let allResults = {}; // merged results + manual-results

const groupsEl = document.querySelector("#groups");
const groupFilterEl = document.querySelector("#groupFilter");
const teamSearchEl = document.querySelector("#teamSearch");
const showOnlyPlayedEl = document.querySelector("#showOnlyPlayed");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDefaultState();
  try { return migrateState(JSON.parse(saved)); }
  catch { return createDefaultState(); }
}

function createDefaultState() {
  return {
    groups: initialGroups,
    matches: initialGroups.flatMap((group) =>
      groupStageRounds.map(([homeSeed, awaySeed], index) => ({
        id: `${group.id}-${index + 1}`,
        groupId: group.id,
        round: Math.floor(index / 2) + 1,
        homeId: `${group.id}${homeSeed}`,
        awayId: `${group.id}${awaySeed}`,
        scheduledAt: kickoffTimes[`${group.id}-${index + 1}`],
        homeGoals: "",
        awayGoals: "",
      })),
    ),
  };
}

function migrateState(savedState) {
  const nextState = { ...createDefaultState(), ...savedState };
  const officialTeams = new Map(initialGroups.flatMap((group) => group.teams.map((team) => [team.id, team])));
  nextState.groups = nextState.groups.map((group) => ({
    ...group,
    teams: group.teams.map((team) => {
      const officialTeam = officialTeams.get(team.id);
      if (!officialTeam) return team;
      return { ...team, flag: team.flag || officialTeam.flag, name: /^Grupo [A-L] - Selecao [1-4]$/.test(team.name) ? officialTeam.name : team.name };
    }),
  }));
  nextState.matches = nextState.matches.map((match) => ({ ...match, scheduledAt: match.scheduledAt || kickoffTimes[match.id] }));
  return nextState;
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// ---------- Data Loading ----------
async function loadAllData() {
  await Promise.all([loadRemoteResults(), loadKnockoutSchedule()]);
  mergeAllResults();
  render();
}

async function loadRemoteResults() {
  try {
    const [resResp, manResp] = await Promise.all([
      fetch(`${RESULTS_URL}?v=${Date.now()}`, { cache: "no-store" }),
      fetch(`${MANUAL_URL}?v=${Date.now()}`, { cache: "no-store" }),
    ]);
    let resData = { matches: {}, updatedAt: null };
    let manData = { matches: {}, updatedAt: null };
    if (resResp.ok) resData = await resResp.json();
    if (manResp.ok) manData = await manResp.json();
    remoteResults = { matches: { ...resData.matches, ...manData.matches }, updatedAt: manData.updatedAt || resData.updatedAt };
  } catch { /* offline ok */ }
}

async function loadKnockoutSchedule() {
  try {
    const resp = await fetch(`${KNOCKOUT_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (resp.ok) knockoutSchedule = await resp.json();
  } catch { knockoutSchedule = { rounds: {} }; }
}

function mergeAllResults() {
  allResults = { ...remoteResults.matches };
  // Apply group results to local state
  state.matches.forEach((match) => {
    const result = allResults[match.id];
    if (result && result.final) {
      match.homeGoals = String(result.homeGoals);
      match.awayGoals = String(result.awayGoals);
      match.status = result.status || "FT";
      match.source = result.source || "api";
    }
  });
}

// ---------- Helpers ----------
function getTeam(teamId) {
  for (const group of state.groups) {
    const team = group.teams.find((item) => item.id === teamId);
    if (team) return team;
  }
  return { id: teamId, flag: "", name: teamId };
}

function createFlag(team) {
  if (!team.flag) return "";
  return `<img class="team-flag" src="https://flagcdn.com/w40/${team.flag}.png" srcset="https://flagcdn.com/w80/${team.flag}.png 2x" width="24" height="18" alt="" aria-hidden="true">`;
}

function createTeamLabel(team, side = "left", variant = "") {
  const flag = createFlag(team);
  const variantClass = variant ? ` team-label-${variant}` : "";
  if (variant === "stacked") {
    const sideClass = side === "right" ? " team-label-right" : "";
    return `<span class="team-label${sideClass}${variantClass}">${flag}<span>${team.name}</span></span>`;
  }
  return side === "right"
    ? `<span class="team-label team-label-right${variantClass}"><span>${team.name}</span>${flag}</span>`
    : `<span class="team-label${variantClass}">${flag}<span>${team.name}</span></span>`;
}

function isPlayed(match) { return match.homeGoals !== "" && match.awayGoals !== ""; }
function toNumber(value) { if (value === "") return null; const n = Number(value); return Number.isFinite(n) ? n : null; }

function formatKickoff(value) {
  if (!value) return "Data a definir";
  const [date, time] = value.split("T");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}, ${time} BRT`;
}

function formatKickoffTime(value) { return value ? value.split("T")[1] : "--:--"; }

function getTodayDateBrt() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDateLongBrt(dateValue) {
  const [y, m, d] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "long" }).format(new Date(Date.UTC(y, m-1, d, 12, 0, 0)));
}

function formatKnockoutDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", month: "short", day: "numeric" }).format(new Date(`${value}:00-03:00`));
}

// ---------- Group Standings ----------
function getStandings(groupId) {
  const group = state.groups.find((item) => item.id === groupId);
  const rows = group.teams.map((team) => ({ ...team, groupId, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }));
  const rowByTeam = new Map(rows.map((r) => [r.id, r]));

  state.matches.filter((m) => m.groupId === groupId && isPlayed(m)).forEach((match) => {
    const home = rowByTeam.get(match.homeId);
    const away = rowByTeam.get(match.awayId);
    const hg = toNumber(match.homeGoals);
    const ag = toNumber(match.awayGoals);
    home.played++; away.played++;
    home.goalsFor += hg; home.goalsAgainst += ag;
    away.goalsFor += ag; away.goalsAgainst += hg;
    if (hg > ag) { home.wins++; home.points += 3; away.losses++; }
    else if (hg < ag) { away.wins++; away.points += 3; home.losses++; }
    else { home.draws++; away.draws++; home.points++; away.points++; }
  });
  rows.forEach((r) => { r.goalDifference = r.goalsFor - r.goalsAgainst; });
  return rows.sort(compareRows);
}

function compareRows(a, b) {
  return b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.goalsAgainst - b.goalsAgainst || a.name.localeCompare(b.name, "pt-BR");
}

function getThirdPlaceRanking() {
  return state.groups.map((group) => getStandings(group.id)[2]).filter(Boolean).sort(compareRows);
}

// ---------- Knockout Winner Resolution ----------
function getKnockoutWinner(matchId) {
  const result = allResults[matchId];
  if (!result || !result.final) return null;
  const scheduleMatch = findKnockoutMatch(matchId);
  if (!scheduleMatch) return null;
  const homeName = result.homeName || scheduleMatch.home;
  const awayName = result.awayName || scheduleMatch.away;
  if (result.homeGoals > result.awayGoals) return { name: homeName, flag: countryFlags[homeName] || "" };
  if (result.awayGoals > result.homeGoals) return { name: awayName, flag: countryFlags[awayName] || "" };
  return null; // draw shouldn't happen in knockout
}

function getKnockoutLoser(matchId) {
  const result = allResults[matchId];
  if (!result || !result.final) return null;
  const scheduleMatch = findKnockoutMatch(matchId);
  if (!scheduleMatch) return null;
  const homeName = result.homeName || scheduleMatch.home;
  const awayName = result.awayName || scheduleMatch.away;
  if (result.homeGoals < result.awayGoals) return { name: homeName, flag: countryFlags[homeName] || "" };
  if (result.awayGoals < result.homeGoals) return { name: awayName, flag: countryFlags[awayName] || "" };
  return null;
}

function findKnockoutMatch(matchId) {
  for (const round of Object.values(knockoutSchedule.rounds || {})) {
    const found = round.matches.find((m) => m.id === matchId);
    if (found) return found;
  }
  return null;
}

function resolveKnockoutTeam(matchId, side) {
  // First try: actual winner propagated from earlier round
  const connections = roundConnections[matchId];
  if (connections) {
    const sourceId = side === "home" ? connections[0] : connections[1];
    const sourceMatchId = allResults[sourceId] ? sourceId : null;
    if (sourceMatchId) {
      if (matchId === "3RD") {
        const loser = getKnockoutLoser(sourceMatchId);
        if (loser) return { name: loser.name, flag: loser.flag, resolved: true };
      } else {
        const winner = getKnockoutWinner(sourceMatchId);
        if (winner) return { name: winner.name, flag: winner.flag, resolved: true };
      }
    }
  }
  // Second try: scheduled team from knockout-schedule.json
  const scheduleMatch = findKnockoutMatch(matchId);
  if (scheduleMatch) {
    const name = scheduleMatch[side];
    if (name) return { name, flag: countryFlags[name] || "", resolved: true };
  }
  // Fallback
  return { name: "A definir", flag: "", resolved: false };
}

// ---------- Render: Knockout ----------
function renderKnockout() {
  const strip = document.querySelector("#qualifiedStrip");
  const bracket = document.querySelector("#knockoutBracket");
  if (!strip || !bracket) return;

  // Qualified strip
  const snapshot = getQualificationSnapshot();
  const qualifiedTeams = [];
  state.groups.forEach((group) => {
    const gs = snapshot.groups.get(group.id);
    if (!gs) return;
    qualifiedTeams.push({ ...gs.winner, qualificationLabel: `1º ${group.id}` });
    qualifiedTeams.push({ ...gs.runnerUp, qualificationLabel: `2º ${group.id}` });
    if (gs.thirdQualified) qualifiedTeams.push({ ...gs.third, qualificationLabel: `3º ${group.id}` });
  });

  strip.innerHTML = qualifiedTeams.map((t) =>
    `<span class="qualified-team"><strong>${t.qualificationLabel}</strong>${createTeamLabel(t)}</span>`
  ).join("");

  // Bracket
  bracket.innerHTML = "";
  bracket.append(createBracketSide("left"));
  bracket.append(createBracketCenter());
  bracket.append(createBracketSide("right"));
}

function createBracketSide(side) {
  const wrapper = document.createElement("div");
  wrapper.className = `bracket-side bracket-side-${side}`;
  const layout = knockoutTree[side];

  // Column order: both sides fan out from center
  // Left:  R32 → R16 → QF → SF  (left-to-right, converging toward center)
  // Right: SF  → QF  → R16 → R32 (left-to-right, converging toward center = mirrored)
  const roundOrder = side === "right"
    ? ["SF", "QF", "R16", "R32"]
    : ["R32", "R16", "QF", "SF"];

  for (const round of roundOrder) {
    const matchIds = layout[round];
    if (!matchIds) continue;
    const column = document.createElement("article");
    column.className = `bracket-round bracket-round-${round.toLowerCase()}`;
    column.innerHTML = `<h3>${round}</h3><div class="bracket-matches"></div>`;
    const matchesEl = column.querySelector(".bracket-matches");
    matchIds.forEach((id) => matchesEl.append(createBracketMatch(id)));
    wrapper.append(column);
  }
  return wrapper;
}

function createBracketCenter() {
  const center = document.createElement("div");
  center.className = "bracket-center";
  center.innerHTML = `<div class="trophy-mark" aria-hidden="true">2026</div><div class="center-stack"></div>`;
  const stack = center.querySelector(".center-stack");
  stack.append(createBracketMatch("FINAL", "final-match"));
  stack.append(createBracketMatch("3RD", "bronze-match"));
  return center;
}

function createBracketMatch(matchId, extraClass = "") {
  const result = allResults[matchId];
  const scheduleMatch = findKnockoutMatch(matchId);
  const card = document.createElement("div");
  card.className = `bracket-match ${extraClass}`.trim();

  const home = resolveKnockoutTeam(matchId, "home");
  const away = resolveKnockoutTeam(matchId, "away");
  const played = result && result.final;

  const homeScore = played ? result.homeGoals : "-";
  const awayScore = played ? result.awayGoals : "-";
  const homeWinner = played && result.homeGoals > result.awayGoals;
  const awayWinner = played && result.awayGoals > result.homeGoals;

  const dateLabel = scheduleMatch ? formatKnockoutDate(scheduleMatch.scheduledAtBrt) : "";

  card.innerHTML = `
    <div class="match-number">${matchId}${dateLabel ? ` · ${dateLabel}` : ""}</div>
    <div class="bracket-team ${home.resolved ? "resolved" : ""}${homeWinner ? " winner" : ""}">
      ${home.flag ? createTeamLabel({ flag: home.flag, name: home.name }) : `<span>${home.name}</span>`}
      <span class="bracket-score">${homeScore}</span>
    </div>
    <div class="bracket-team ${away.resolved ? "resolved" : ""}${awayWinner ? " winner" : ""}">
      ${away.flag ? createTeamLabel({ flag: away.flag, name: away.name }) : `<span>${away.name}</span>`}
      <span class="bracket-score">${awayScore}</span>
    </div>
  `;
  return card;
}

function getQualificationSnapshot() {
  const groups = new Map();
  const thirdRanking = getThirdPlaceRanking();
  const qualifiedThirdIds = new Set(thirdRanking.slice(0, 8).map((row) => row.id));

  state.groups.forEach((group) => {
    const standings = getStandings(group.id);
    groups.set(group.id, {
      winner: standings[0],
      runnerUp: standings[1],
      third: standings[2],
      thirdQualified: standings[2] ? qualifiedThirdIds.has(standings[2].id) : false,
    });
  });
  return { groups, thirdRanking, qualifiedThirdIds };
}

// ---------- Render: Third Places ----------
function renderThirdPlaces() {
  const tbody = document.querySelector("#thirdPlaces");
  if (!tbody) return;
  tbody.innerHTML = "";
  getThirdPlaceRanking().forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.className = index < 8 ? "third-qualified" : "";
    tr.innerHTML = `
      <td><span class="rank-badge ${index < 8 ? "" : "out"}">${index + 1}</span></td>
      <td>Grupo ${row.groupId}</td>
      <td>${createTeamLabel(row)}</td>
      <td><strong>${row.points}</strong></td>
      <td>${row.played}</td><td>${row.wins}</td><td>${row.draws}</td><td>${row.losses}</td>
      <td>${row.goalsFor}</td><td>${row.goalsAgainst}</td><td>${row.goalDifference}</td>
    `;
    tbody.append(tr);
  });
}

// ---------- Render: Groups ----------
function createStandingsTable(groupId) {
  const table = document.createElement("table");
  const standings = getStandings(groupId);
  const thirdRanking = getThirdPlaceRanking();
  const qualifiedThirdIds = new Set(thirdRanking.slice(0, 8).map((row) => row.id));

  table.innerHTML = `
    <thead><tr>
      <th>#</th><th>Selecao</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th>
    </tr></thead><tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  standings.forEach((row, index) => {
    const tr = document.createElement("tr");
    if (index < 2) tr.classList.add("qualified");
    if (index === 2 && qualifiedThirdIds.has(row.id)) tr.classList.add("third-qualified");

    tr.innerHTML = `
      <td>${index + 1}</td><td></td>
      <td><strong>${row.points}</strong></td>
      <td>${row.played}</td><td>${row.wins}</td><td>${row.draws}</td><td>${row.losses}</td>
      <td>${row.goalsFor}</td><td>${row.goalsAgainst}</td><td>${row.goalDifference}</td>
    `;

    const input = document.createElement("input");
    input.className = "team-name";
    input.value = row.name;
    input.setAttribute("aria-label", `Nome da selecao ${row.id}`);
    input.addEventListener("input", () => { getTeam(row.id).name = input.value; });
    input.addEventListener("blur", () => { saveState(); render(); });
    const teamCell = document.createElement("div");
    teamCell.className = "team-input";
    teamCell.innerHTML = createFlag(row);
    teamCell.append(input);
    tr.children[1].append(teamCell);
    tbody.append(tr);
  });
  return table;
}

function createMatch(match) {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  const apiResult = allResults[match.id];
  const statusLabel = apiResult?.final ? "Resultado oficial" : "Aguardando resultado";
  const div = document.createElement("div");
  div.className = "match";
  if (apiResult?.final) div.classList.add("match-final");
  div.dataset.group = match.groupId;

  div.innerHTML = `
    <div class="match-team match-team-home">${createTeamLabel(home, "left", "stacked")}</div>
    <input type="number" min="0" inputmode="numeric" value="${match.homeGoals}" aria-label="Gols ${home.name}">
    <div class="versus">x</div>
    <input type="number" min="0" inputmode="numeric" value="${match.awayGoals}" aria-label="Gols ${away.name}">
    <div class="match-team match-team-away">${createTeamLabel(away, "right", "stacked")}</div>
    <div class="match-meta">
      <span>Grupo ${match.groupId} - rodada ${match.round}</span>
      <strong>${formatKickoff(match.scheduledAt)}</strong>
      <em>${statusLabel}</em>
    </div>
  `;

  const [homeInput, awayInput] = div.querySelectorAll("input");
  homeInput.disabled = Boolean(apiResult?.final);
  awayInput.disabled = Boolean(apiResult?.final);
  homeInput.addEventListener("input", () => updateScore(match.id, "homeGoals", homeInput.value));
  awayInput.addEventListener("input", () => updateScore(match.id, "awayGoals", awayInput.value));
  return div;
}

function updateScore(matchId, field, value) {
  const match = state.matches.find((item) => item.id === matchId);
  match[field] = value === "" ? "" : Math.max(0, Number(value)).toString();
  saveState();
  render();
}

function matchesFilter(match) {
  const selectedGroup = groupFilterEl.value;
  const query = teamSearchEl.value.trim().toLocaleLowerCase("pt-BR");
  const onlyPlayed = showOnlyPlayedEl.checked;
  const homeName = getTeam(match.homeId).name.toLocaleLowerCase("pt-BR");
  const awayName = getTeam(match.awayId).name.toLocaleLowerCase("pt-BR");
  if (selectedGroup !== "all" && match.groupId !== selectedGroup) return false;
  if (onlyPlayed && !isPlayed(match)) return false;
  if (query && !homeName.includes(query) && !awayName.includes(query)) return false;
  return true;
}

// ---------- Main Render ----------
function render() {
  groupsEl.innerHTML = "";
  const template = document.querySelector("#groupTemplate");
  const visibleGroups = state.groups.filter((group) => {
    if (groupFilterEl.value !== "all" && group.id !== groupFilterEl.value) return false;
    const query = teamSearchEl.value.trim().toLocaleLowerCase("pt-BR");
    if (!query) return true;
    return group.teams.some((team) => team.name.toLocaleLowerCase("pt-BR").includes(query));
  });

  visibleGroups.forEach((group) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".group-card");
    const matches = state.matches.filter((m) => m.groupId === group.id && matchesFilter(m)).sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""));

    card.querySelector("h2").textContent = `Grupo ${group.id}`;
    card.querySelector(".group-heading span").textContent = `${matches.length} jogos`;

    // Standings
    card.querySelector(".standings-wrap").append(createStandingsTable(group.id));

    // Matches with collapse toggle
    const matchesEl = card.querySelector(".matches");
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "toggle-matches";
    toggleBtn.textContent = "▶ Mostrar jogos";
    toggleBtn.addEventListener("click", () => {
      const expanded = matchesEl.classList.toggle("expanded");
      toggleBtn.textContent = expanded ? "▼ Ocultar jogos" : "▶ Mostrar jogos";
    });

    if (matches.length) {
      matches.forEach((match) => matchesEl.append(createMatch(match)));
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Nenhum jogo encontrado.";
      matchesEl.append(empty);
    }

    card.querySelector(".group-content").append(toggleBtn);
    groupsEl.append(node);
  });

  if (!visibleGroups.length) {
    groupsEl.innerHTML = `<div class="empty-state">Nenhum grupo encontrado com os filtros atuais.</div>`;
  }

  renderThirdPlaces();
  renderKnockout();
  renderTodayMatches();
  renderSummary();
}

function renderSummary() {
  const played = state.matches.filter(isPlayed);
  const goals = played.reduce((total, match) => total + toNumber(match.homeGoals) + toNumber(match.awayGoals), 0);
  document.querySelector("#playedMatches").textContent = played.length;
  document.querySelector("#totalGoals").textContent = goals;
  document.querySelector("#averageGoals").textContent = played.length ? (goals / played.length).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";
  document.querySelector("#qualifiedCount").textContent = 32;
}

function renderTodayMatches() {
  const container = document.querySelector("#todayMatches");
  const label = document.querySelector("#todayDateLabel");
  if (!container || !label) return;

  const today = getTodayDateBrt();
  const matches = state.matches.filter((m) => m.scheduledAt?.startsWith(today)).sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""));

  label.textContent = `${formatDateLongBrt(today)} - Horário de Brasília`;
  container.innerHTML = "";
  if (!matches.length) {
    container.innerHTML = `<div class="today-empty">Nenhum jogo programado para hoje.</div>`;
    return;
  }

  matches.forEach((match) => {
    const home = getTeam(match.homeId);
    const away = getTeam(match.awayId);
    const apiResult = allResults[match.id];
    const played = isPlayed(match);
    const card = document.createElement("article");
    card.className = `today-match ${apiResult?.final ? "today-match-final" : ""}`.trim();
    card.innerHTML = `
      <div class="today-time">${formatKickoffTime(match.scheduledAt)}</div>
      <div class="today-game">
        <div class="today-team today-team-home">${createTeamLabel(home, "left", "stacked")}</div>
        <strong>${played ? `${match.homeGoals} x ${match.awayGoals}` : "x"}</strong>
        <div class="today-team today-team-away">${createTeamLabel(away, "right", "stacked")}</div>
      </div>
      <div class="today-meta"><span>Grupo ${match.groupId}</span><em>${apiResult?.final ? "Resultado oficial" : "Programado"}</em></div>
    `;
    container.append(card);
  });
}

function populateGroupFilter() {
  state.groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = `Grupo ${group.id}`;
    groupFilterEl.append(option);
  });
}

// ---------- Init ----------
document.querySelector("#saveButton").addEventListener("click", () => { saveState(); alert("Tabela salva neste navegador."); });
document.querySelector("#resetButton").addEventListener("click", () => {
  state.matches.forEach((m) => { m.homeGoals = ""; m.awayGoals = ""; });
  saveState(); render();
});

[groupFilterEl, teamSearchEl, showOnlyPlayedEl].forEach((control) => {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
});

populateGroupFilter();
render();
loadAllData();
