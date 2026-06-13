const STORAGE_KEY = "copa-2026-tabela";

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
        homeGoals: "",
        awayGoals: "",
      })),
    ),
  };
}

let state = loadState();

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

  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const div = document.createElement("div");
  div.className = "match";
  div.dataset.group = match.groupId;

  div.innerHTML = `
    <div class="match-team">${home.name}</div>
    <input type="number" min="0" inputmode="numeric" value="${match.homeGoals}" aria-label="Gols ${home.name}">
    <div class="versus">x</div>
    <input type="number" min="0" inputmode="numeric" value="${match.awayGoals}" aria-label="Gols ${away.name}">
    <div class="match-team">${away.name}</div>
    <div class="match-meta">Grupo ${match.groupId} - rodada ${match.round}</div>
  `;

  const [homeInput, awayInput] = div.querySelectorAll("input");
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
    const matches = state.matches.filter((match) => match.groupId === group.id && matchesFilter(match));

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
