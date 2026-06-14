const STORAGE_KEY = "copa-2026-tabela";
const RESULTS_URL = "data/results.json";

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

const initialGroups = Object.entries(groupTeams).map(([letter, teams]) => ({
  id: letter,
  teams: teams.map((name, index) => ({
    id: `${letter}${index + 1}`,
    name,
  })),
}));

const groupStageRounds = [
  ["1", "2"],
  ["3", "4"],
  ["1", "3"],
  ["4", "2"],
  ["4", "1"],
  ["2", "3"],
];

const kickoffTimes = {
  "A-1": "2026-06-11T16:00",
  "A-2": "2026-06-11T23:00",
  "A-3": "2026-06-18T22:00",
  "A-4": "2026-06-18T13:00",
  "A-5": "2026-06-24T22:00",
  "A-6": "2026-06-24T22:00",
  "B-1": "2026-06-12T19:00",
  "B-2": "2026-06-13T16:00",
  "B-3": "2026-06-18T19:00",
  "B-4": "2026-06-18T16:00",
  "B-5": "2026-06-24T16:00",
  "B-6": "2026-06-24T16:00",
  "C-1": "2026-06-13T19:00",
  "C-2": "2026-06-13T22:00",
  "C-3": "2026-06-19T21:30",
  "C-4": "2026-06-19T19:00",
  "C-5": "2026-06-24T19:00",
  "C-6": "2026-06-24T19:00",
  "D-1": "2026-06-12T22:00",
  "D-2": "2026-06-14T01:00",
  "D-3": "2026-06-19T16:00",
  "D-4": "2026-06-20T00:00",
  "D-5": "2026-06-25T23:00",
  "D-6": "2026-06-25T23:00",
  "E-1": "2026-06-14T14:00",
  "E-2": "2026-06-14T20:00",
  "E-3": "2026-06-20T17:00",
  "E-4": "2026-06-20T21:00",
  "E-5": "2026-06-25T17:00",
  "E-6": "2026-06-25T17:00",
  "F-1": "2026-06-14T17:00",
  "F-2": "2026-06-14T23:00",
  "F-3": "2026-06-20T14:00",
  "F-4": "2026-06-21T01:00",
  "F-5": "2026-06-25T20:00",
  "F-6": "2026-06-25T20:00",
  "G-1": "2026-06-15T16:00",
  "G-2": "2026-06-15T22:00",
  "G-3": "2026-06-21T16:00",
  "G-4": "2026-06-21T22:00",
  "G-5": "2026-06-27T00:00",
  "G-6": "2026-06-27T00:00",
  "H-1": "2026-06-15T13:00",
  "H-2": "2026-06-15T19:00",
  "H-3": "2026-06-21T13:00",
  "H-4": "2026-06-21T19:00",
  "H-5": "2026-06-26T21:00",
  "H-6": "2026-06-26T21:00",
  "I-1": "2026-06-16T16:00",
  "I-2": "2026-06-16T19:00",
  "I-3": "2026-06-22T18:00",
  "I-4": "2026-06-22T21:00",
  "I-5": "2026-06-26T16:00",
  "I-6": "2026-06-26T16:00",
  "J-1": "2026-06-16T22:00",
  "J-2": "2026-06-17T01:00",
  "J-3": "2026-06-22T14:00",
  "J-4": "2026-06-23T00:00",
  "J-5": "2026-06-27T23:00",
  "J-6": "2026-06-27T23:00",
  "K-1": "2026-06-17T14:00",
  "K-2": "2026-06-17T23:00",
  "K-3": "2026-06-23T14:00",
  "K-4": "2026-06-23T23:00",
  "K-5": "2026-06-27T20:30",
  "K-6": "2026-06-27T20:30",
  "L-1": "2026-06-17T17:00",
  "L-2": "2026-06-17T20:00",
  "L-3": "2026-06-23T17:00",
  "L-4": "2026-06-23T20:00",
  "L-5": "2026-06-27T18:00",
  "L-6": "2026-06-27T18:00",
};

const roundOf32Matches = [
  { id: 73, home: { type: "runnerUp", group: "A" }, away: { type: "runnerUp", group: "B" } },
  { id: 74, home: { type: "winner", group: "E" }, away: { type: "third", groups: ["A", "B", "C", "D", "F"] } },
  { id: 75, home: { type: "winner", group: "F" }, away: { type: "runnerUp", group: "C" } },
  { id: 76, home: { type: "winner", group: "C" }, away: { type: "runnerUp", group: "F" } },
  { id: 77, home: { type: "winner", group: "I" }, away: { type: "third", groups: ["C", "D", "F", "G", "H"] } },
  { id: 78, home: { type: "runnerUp", group: "E" }, away: { type: "runnerUp", group: "I" } },
  { id: 79, home: { type: "winner", group: "A" }, away: { type: "third", groups: ["C", "E", "F", "H", "I"] } },
  { id: 80, home: { type: "winner", group: "L" }, away: { type: "third", groups: ["E", "H", "I", "J", "K"] } },
  { id: 81, home: { type: "winner", group: "D" }, away: { type: "third", groups: ["B", "E", "F", "I", "J"] } },
  { id: 82, home: { type: "winner", group: "G" }, away: { type: "third", groups: ["A", "E", "H", "I", "J"] } },
  { id: 83, home: { type: "runnerUp", group: "K" }, away: { type: "runnerUp", group: "L" } },
  { id: 84, home: { type: "winner", group: "H" }, away: { type: "runnerUp", group: "J" } },
  { id: 85, home: { type: "winner", group: "B" }, away: { type: "third", groups: ["E", "F", "G", "I", "J"] } },
  { id: 86, home: { type: "winner", group: "J" }, away: { type: "runnerUp", group: "H" } },
  { id: 87, home: { type: "winner", group: "K" }, away: { type: "third", groups: ["D", "E", "I", "J", "L"] } },
  { id: 88, home: { type: "runnerUp", group: "D" }, away: { type: "runnerUp", group: "G" } },
];

const knockoutMatches = [
  ...roundOf32Matches,
  { id: 89, home: { type: "matchWinner", match: 74 }, away: { type: "matchWinner", match: 77 } },
  { id: 90, home: { type: "matchWinner", match: 73 }, away: { type: "matchWinner", match: 75 } },
  { id: 91, home: { type: "matchWinner", match: 76 }, away: { type: "matchWinner", match: 78 } },
  { id: 92, home: { type: "matchWinner", match: 79 }, away: { type: "matchWinner", match: 80 } },
  { id: 93, home: { type: "matchWinner", match: 83 }, away: { type: "matchWinner", match: 84 } },
  { id: 94, home: { type: "matchWinner", match: 81 }, away: { type: "matchWinner", match: 82 } },
  { id: 95, home: { type: "matchWinner", match: 86 }, away: { type: "matchWinner", match: 88 } },
  { id: 96, home: { type: "matchWinner", match: 85 }, away: { type: "matchWinner", match: 87 } },
  { id: 97, home: { type: "matchWinner", match: 89 }, away: { type: "matchWinner", match: 90 } },
  { id: 98, home: { type: "matchWinner", match: 93 }, away: { type: "matchWinner", match: 94 } },
  { id: 99, home: { type: "matchWinner", match: 91 }, away: { type: "matchWinner", match: 92 } },
  { id: 100, home: { type: "matchWinner", match: 95 }, away: { type: "matchWinner", match: 96 } },
  { id: 101, home: { type: "matchWinner", match: 97 }, away: { type: "matchWinner", match: 98 } },
  { id: 102, home: { type: "matchWinner", match: 99 }, away: { type: "matchWinner", match: 100 } },
  { id: 103, home: { type: "matchLoser", match: 101 }, away: { type: "matchLoser", match: 102 } },
  { id: 104, home: { type: "matchWinner", match: 101 }, away: { type: "matchWinner", match: 102 } },
];

const knockoutMatchById = new Map(knockoutMatches.map((match) => [match.id, match]));

const bracketLayout = {
  left: [
    { title: "R32", matches: [74, 77, 73, 75, 83, 84, 81, 82] },
    { title: "R16", matches: [89, 90, 93, 94] },
    { title: "QF", matches: [97, 98] },
    { title: "SF", matches: [101] },
  ],
  right: [
    { title: "SF", matches: [102] },
    { title: "QF", matches: [99, 100] },
    { title: "R16", matches: [91, 92, 95, 96] },
    { title: "R32", matches: [76, 78, 79, 80, 86, 88, 85, 87] },
  ],
};

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

let state = loadState();
let remoteResults = {
  matches: {},
  updatedAt: null,
};

const groupsEl = document.querySelector("#groups");
const groupFilterEl = document.querySelector("#groupFilter");
const teamSearchEl = document.querySelector("#teamSearch");
const showOnlyPlayedEl = document.querySelector("#showOnlyPlayed");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDefaultState();

  try {
    return migrateState(JSON.parse(saved));
  } catch {
    return createDefaultState();
  }
}

function migrateState(savedState) {
  const nextState = {
    ...createDefaultState(),
    ...savedState,
  };
  const officialTeams = new Map(
    initialGroups.flatMap((group) => group.teams.map((team) => [team.id, team.name])),
  );

  nextState.groups = nextState.groups.map((group) => ({
    ...group,
    teams: group.teams.map((team) => {
      const oldPlaceholder = /^Grupo [A-L] - Selecao [1-4]$/.test(team.name);
      return oldPlaceholder && officialTeams.has(team.id)
        ? { ...team, name: officialTeams.get(team.id) }
        : team;
    }),
  }));
  nextState.matches = nextState.matches.map((match) => ({
    ...match,
    scheduledAt: match.scheduledAt || kickoffTimes[match.id],
  }));

  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadRemoteResults() {
  try {
    const response = await fetch(`${RESULTS_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();
    remoteResults = data;
    applyRemoteResults(data.matches || {});
    render();
  } catch {
    // The local table keeps working even when the hosted results file is unavailable.
  }
}

function applyRemoteResults(matches) {
  state.matches.forEach((match) => {
    const result = matches[match.id];
    if (!result || !result.final) return;

    match.homeGoals = String(result.homeGoals);
    match.awayGoals = String(result.awayGoals);
    match.status = result.status || "FT";
    match.source = "api";
  });
}

function getTeam(teamId) {
  for (const group of state.groups) {
    const team = group.teams.find((item) => item.id === teamId);
    if (team) return team;
  }
  return { id: teamId, name: teamId };
}

function isPlayed(match) {
  return match.homeGoals !== "" && match.awayGoals !== "";
}

function toNumber(value) {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatKickoff(value) {
  if (!value) return "Data a definir";
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}, ${time} BRT`;
}

function formatKickoffTime(value) {
  if (!value) return "--:--";
  return value.split("T")[1];
}

function getTodayDateBrt() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDateLongBrt(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

function getStandings(groupId) {
  const group = state.groups.find((item) => item.id === groupId);
  const rows = group.teams.map((team) => ({
    ...team,
    groupId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }));

  const rowByTeam = new Map(rows.map((row) => [row.id, row]));

  state.matches
    .filter((match) => match.groupId === groupId && isPlayed(match))
    .forEach((match) => {
      const home = rowByTeam.get(match.homeId);
      const away = rowByTeam.get(match.awayId);
      const homeGoals = toNumber(match.homeGoals);
      const awayGoals = toNumber(match.awayGoals);

      home.played += 1;
      away.played += 1;
      home.goalsFor += homeGoals;
      home.goalsAgainst += awayGoals;
      away.goalsFor += awayGoals;
      away.goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
      } else if (homeGoals < awayGoals) {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  rows.forEach((row) => {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  });

  return rows.sort(compareRows);
}

function compareRows(a, b) {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.goalsAgainst - b.goalsAgainst ||
    a.name.localeCompare(b.name, "pt-BR")
  );
}

function getThirdPlaceRanking() {
  return state.groups
    .map((group) => getStandings(group.id)[2])
    .filter(Boolean)
    .sort(compareRows);
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

  return {
    groups,
    thirdRanking,
    qualifiedThirdIds,
  };
}

function getQualifiedTeams(snapshot = getQualificationSnapshot()) {
  const teams = [];

  state.groups.forEach((group) => {
    const groupSnapshot = snapshot.groups.get(group.id);
    if (!groupSnapshot) return;
    teams.push({ ...groupSnapshot.winner, qualificationLabel: `1º ${group.id}` });
    teams.push({ ...groupSnapshot.runnerUp, qualificationLabel: `2º ${group.id}` });
    if (groupSnapshot.thirdQualified) {
      teams.push({ ...groupSnapshot.third, qualificationLabel: `3º ${group.id}` });
    }
  });

  return teams;
}

function resolveSeed(seed, snapshot) {
  if (seed.type === "winner") {
    const team = snapshot.groups.get(seed.group)?.winner;
    return {
      label: team?.name || `1º Grupo ${seed.group}`,
      meta: `1º Grupo ${seed.group}`,
      resolved: Boolean(team),
    };
  }

  if (seed.type === "runnerUp") {
    const team = snapshot.groups.get(seed.group)?.runnerUp;
    return {
      label: team?.name || `2º Grupo ${seed.group}`,
      meta: `2º Grupo ${seed.group}`,
      resolved: Boolean(team),
    };
  }

  if (seed.type === "third") {
    const candidates = seed.groups
      .map((groupId) => snapshot.groups.get(groupId))
      .filter((group) => group?.thirdQualified)
      .map((group) => group.third);

    if (candidates.length === 1) {
      return {
        label: candidates[0].name,
        meta: `3º Grupo ${candidates[0].groupId}`,
        resolved: true,
      };
    }

    return {
      label: `3º de ${seed.groups.join("/")}`,
      meta: candidates.length ? `${candidates.length} opções qualificadas` : "melhor terceiro",
      resolved: false,
    };
  }

  if (seed.type === "matchWinner") {
    return {
      label: `Vencedor Jogo ${seed.match}`,
      meta: "mata-mata",
      resolved: false,
    };
  }

  if (seed.type === "matchLoser") {
    return {
      label: `Perdedor Jogo ${seed.match}`,
      meta: "disputa 3º lugar",
      resolved: false,
    };
  }

  return {
    label: "A definir",
    meta: "",
    resolved: false,
  };
}

function createStandingsTable(groupId) {
  const table = document.createElement("table");
  const standings = getStandings(groupId);
  const thirdRanking = getThirdPlaceRanking();
  const qualifiedThirdIds = new Set(thirdRanking.slice(0, 8).map((row) => row.id));

  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Selecao</th>
        <th>Pts</th>
        <th>J</th>
        <th>V</th>
        <th>E</th>
        <th>D</th>
        <th>GP</th>
        <th>GC</th>
        <th>SG</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  standings.forEach((row, index) => {
    const tr = document.createElement("tr");
    if (index < 2) tr.classList.add("qualified");
    if (index === 2 && qualifiedThirdIds.has(row.id)) tr.classList.add("third-qualified");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td></td>
      <td><strong>${row.points}</strong></td>
      <td>${row.played}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.losses}</td>
      <td>${row.goalsFor}</td>
      <td>${row.goalsAgainst}</td>
      <td>${row.goalDifference}</td>
    `;

    const input = document.createElement("input");
    input.className = "team-name";
    input.value = row.name;
    input.setAttribute("aria-label", `Nome da selecao ${row.id}`);
    input.addEventListener("input", () => {
      getTeam(row.id).name = input.value;
    });
    input.addEventListener("blur", () => {
      saveState();
      render();
    });
    tr.children[1].append(input);
    tbody.append(tr);
  });

  return table;
}

function createMatch(match) {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  const apiResult = remoteResults.matches?.[match.id];
  const statusLabel = apiResult?.final ? "Resultado oficial" : "Aguardando resultado";
  const div = document.createElement("div");
  div.className = "match";
  if (apiResult?.final) div.classList.add("match-final");
  div.dataset.group = match.groupId;

  div.innerHTML = `
    <div class="match-team">${home.name}</div>
    <input type="number" min="0" inputmode="numeric" value="${match.homeGoals}" aria-label="Gols ${home.name}">
    <div class="versus">x</div>
    <input type="number" min="0" inputmode="numeric" value="${match.awayGoals}" aria-label="Gols ${away.name}">
    <div class="match-team">${away.name}</div>
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
    const matches = state.matches
      .filter((match) => match.groupId === group.id && matchesFilter(match))
      .sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""));

    card.querySelector("h2").textContent = `Grupo ${group.id}`;
    card.querySelector(".group-heading span").textContent = `${matches.length} jogos visiveis`;
    card.querySelector(".standings-wrap").append(createStandingsTable(group.id));

    const matchesEl = card.querySelector(".matches");
    if (matches.length) {
      matches.forEach((match) => matchesEl.append(createMatch(match)));
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Nenhum jogo encontrado com os filtros atuais.";
      matchesEl.append(empty);
    }

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

function renderThirdPlaces() {
  const tbody = document.querySelector("#thirdPlaces");
  tbody.innerHTML = "";

  getThirdPlaceRanking().forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.className = index < 8 ? "third-qualified" : "";
    tr.innerHTML = `
      <td><span class="rank-badge ${index < 8 ? "" : "out"}">${index + 1}</span></td>
      <td>Grupo ${row.groupId}</td>
      <td>${row.name}</td>
      <td><strong>${row.points}</strong></td>
      <td>${row.played}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.losses}</td>
      <td>${row.goalsFor}</td>
      <td>${row.goalsAgainst}</td>
      <td>${row.goalDifference}</td>
    `;
    tbody.append(tr);
  });
}

function renderSummary() {
  const played = state.matches.filter(isPlayed);
  const goals = played.reduce(
    (total, match) => total + toNumber(match.homeGoals) + toNumber(match.awayGoals),
    0,
  );

  document.querySelector("#playedMatches").textContent = played.length;
  document.querySelector("#totalGoals").textContent = goals;
  document.querySelector("#averageGoals").textContent = played.length
    ? (goals / played.length).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0,00";
  document.querySelector("#qualifiedCount").textContent = 32;
}

function renderTodayMatches() {
  const container = document.querySelector("#todayMatches");
  const label = document.querySelector("#todayDateLabel");
  if (!container || !label) return;

  const today = getTodayDateBrt();
  const matches = state.matches
    .filter((match) => match.scheduledAt?.startsWith(today))
    .sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""));

  label.textContent = `${formatDateLongBrt(today)} - Horário de Brasília`;
  container.innerHTML = "";

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "today-empty";
    empty.textContent = "Nenhum jogo programado para hoje.";
    container.append(empty);
    return;
  }

  matches.forEach((match) => {
    const home = getTeam(match.homeId);
    const away = getTeam(match.awayId);
    const apiResult = remoteResults.matches?.[match.id];
    const played = isPlayed(match);
    const card = document.createElement("article");
    card.className = `today-match ${apiResult?.final ? "today-match-final" : ""}`.trim();

    card.innerHTML = `
      <div class="today-time">${formatKickoffTime(match.scheduledAt)}</div>
      <div class="today-game">
        <span>${home.name}</span>
        <strong>${played ? `${match.homeGoals} x ${match.awayGoals}` : "x"}</strong>
        <span>${away.name}</span>
      </div>
      <div class="today-meta">
        <span>Grupo ${match.groupId}</span>
        <em>${apiResult?.final ? "Resultado oficial" : "Programado"}</em>
      </div>
    `;

    container.append(card);
  });
}

function renderKnockout() {
  const strip = document.querySelector("#qualifiedStrip");
  const bracket = document.querySelector("#knockoutBracket");
  if (!strip || !bracket) return;

  const snapshot = getQualificationSnapshot();
  const qualifiedTeams = getQualifiedTeams(snapshot);

  strip.innerHTML = "";
  bracket.innerHTML = "";

  qualifiedTeams.forEach((team) => {
    const badge = document.createElement("span");
    badge.className = "qualified-team";
    badge.innerHTML = `<strong>${team.qualificationLabel}</strong>${team.name}`;
    strip.append(badge);
  });

  bracket.append(createBracketSide("left", snapshot));
  bracket.append(createBracketCenter(snapshot));
  bracket.append(createBracketSide("right", snapshot));
}

function createBracketSide(side, snapshot) {
  const wrapper = document.createElement("div");
  wrapper.className = `bracket-side bracket-side-${side}`;

  bracketLayout[side].forEach((round) => {
    const column = document.createElement("article");
    column.className = `bracket-round bracket-round-${round.title.toLowerCase()}`;
    column.innerHTML = `<h3>${round.title}</h3><div class="bracket-matches"></div>`;
    const matchesEl = column.querySelector(".bracket-matches");

    round.matches.forEach((matchId) => {
      matchesEl.append(createBracketMatch(matchId, snapshot));
    });

    wrapper.append(column);
  });

  return wrapper;
}

function createBracketCenter(snapshot) {
  const center = document.createElement("div");
  center.className = "bracket-center";
  center.innerHTML = `
    <div class="trophy-mark" aria-hidden="true">2026</div>
    <div class="center-stack"></div>
  `;

  const stack = center.querySelector(".center-stack");
  stack.append(createBracketMatch(104, snapshot, "final-match"));
  stack.append(createBracketMatch(103, snapshot, "bronze-match"));

  return center;
}

function createBracketMatch(matchId, snapshot, extraClass = "") {
  const match = knockoutMatchById.get(matchId);
  const home = resolveSeed(match.home, snapshot);
  const away = resolveSeed(match.away, snapshot);
  const card = document.createElement("div");
  card.className = `bracket-match ${extraClass}`.trim();
  card.innerHTML = `
    <div class="match-number">Jogo ${match.id}</div>
    ${createBracketTeam(home)}
    ${createBracketTeam(away)}
  `;
  return card;
}

function createBracketTeam(seed) {
  return `
    <div class="bracket-team ${seed.resolved ? "resolved" : ""}">
      <span>${seed.label}</span>
      <small>${seed.meta}</small>
    </div>
  `;
}

function populateGroupFilter() {
  state.groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = `Grupo ${group.id}`;
    groupFilterEl.append(option);
  });
}

document.querySelector("#saveButton").addEventListener("click", () => {
  saveState();
  alert("Tabela salva neste navegador.");
});

document.querySelector("#resetButton").addEventListener("click", () => {
  state.matches.forEach((match) => {
    match.homeGoals = "";
    match.awayGoals = "";
  });
  saveState();
  render();
});

[groupFilterEl, teamSearchEl, showOnlyPlayedEl].forEach((control) => {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
});

populateGroupFilter();
render();
loadRemoteResults();
