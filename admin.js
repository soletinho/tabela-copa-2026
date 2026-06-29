const OWNER = "soletinho";
const REPO = "tabela-copa-2026";
const BRANCH = "master";
const TOKEN_KEY = "tabela-copa-2026-admin-token";

const paths = {
  schedule: "data/schedule.json",
  knockoutSchedule: "data/knockout-schedule.json",
  manual: "data/manual-results.json",
  results: "data/results.json",
};

let schedule = { matches: [] };
let knockoutSchedule = { rounds: {} };
let manualResults = { source: "manual", updatedAt: null, matches: {} };
let results = { source: "api-football", updatedAt: null, matches: {} };
let currentKnockoutTeamNames = {};

const tokenInput = document.querySelector("#tokenInput");
const saveTokenButton = document.querySelector("#saveTokenButton");
const clearTokenButton = document.querySelector("#clearTokenButton");
const reloadButton = document.querySelector("#reloadButton");
const phaseSelect = document.querySelector("#phaseSelect");
const groupLabel = document.querySelector("#groupLabel");
const groupSelect = document.querySelector("#groupSelect");
const matchSelect = document.querySelector("#matchSelect");
const knockoutHomeLabel = document.querySelector("#knockoutHomeLabel");
const knockoutAwayLabel = document.querySelector("#knockoutAwayLabel");
const penaltyHomeLabel = document.querySelector("#penaltyHomeLabel");
const penaltyAwayLabel = document.querySelector("#penaltyAwayLabel");
const penaltyHomeInput = document.querySelector("#penaltyHomeInput");
const penaltyAwayInput = document.querySelector("#penaltyAwayInput");
const knockoutHomeInput = document.querySelector("#knockoutHomeInput");
const knockoutAwayInput = document.querySelector("#knockoutAwayInput");
const homeGoalsInput = document.querySelector("#homeGoalsInput");
const awayGoalsInput = document.querySelector("#awayGoalsInput");
const statusSelect = document.querySelector("#statusSelect");
const finalCheckbox = document.querySelector("#finalCheckbox");
const matchPreview = document.querySelector("#matchPreview");
const saveResultButton = document.querySelector("#saveResultButton");
const removeResultButton = document.querySelector("#removeResultButton");
const manualResultsList = document.querySelector("#manualResultsList");
const statusBox = document.querySelector("#statusBox");

init();

async function init() {
  tokenInput.value = localStorage.getItem(TOKEN_KEY) || "";
  bindEvents();
  await loadAllData();
}

function bindEvents() {
  saveTokenButton.addEventListener("click", () => {
    const token = tokenInput.value.trim();
    if (!token) return showStatus("Informe um token antes de salvar.", "error");
    localStorage.setItem(TOKEN_KEY, token);
    showStatus("Token salvo apenas neste navegador.", "ok");
  });

  clearTokenButton.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    tokenInput.value = "";
    showStatus("Token removido deste navegador.", "ok");
  });

  reloadButton.addEventListener("click", loadAllData);

  phaseSelect.addEventListener("change", () => {
    onPhaseChange();
  });

  groupSelect.addEventListener("change", () => {
    populateMatches();
    loadSelectedResultIntoForm();
  });

  matchSelect.addEventListener("change", loadSelectedResultIntoForm);

  knockoutHomeInput.addEventListener("input", () => { saveKnockoutTeamNames(); updatePreview(); });
  knockoutAwayInput.addEventListener("input", () => { saveKnockoutTeamNames(); updatePreview(); });

  [homeGoalsInput, awayGoalsInput, penaltyHomeInput, penaltyAwayInput, statusSelect, finalCheckbox].forEach((el) => {
    el.addEventListener("input", updatePreview);
    el.addEventListener("change", updatePreview);
  });
  saveResultButton.addEventListener("click", saveSelectedResult);
  removeResultButton.addEventListener("click", removeSelectedResult);
}

function isKnockoutPhase() {
  return phaseSelect.value !== "groups";
}

function onPhaseChange() {
  const knockout = isKnockoutPhase();
  groupLabel.hidden = knockout;
  groupSelect.hidden = knockout;
  knockoutHomeLabel.hidden = !knockout;
  knockoutAwayLabel.hidden = !knockout;
  penaltyHomeLabel.hidden = !knockout;
  penaltyAwayLabel.hidden = !knockout;

  if (knockout) {
    populateKnockoutMatches();
  } else {
    populateGroups();
    populateMatches();
  }
  loadSelectedResultIntoForm();
}

async function loadAllData() {
  setBusy(true);
  showStatus("Carregando dados...", "info");
  try {
    const [scheduleData, knockoutData, manualData, resultsData] = await Promise.all([
      fetchJson(paths.schedule),
      fetchJson(paths.knockoutSchedule),
      fetchJson(paths.manual),
      fetchJson(paths.results),
    ]);
    schedule = scheduleData;
    knockoutSchedule = knockoutData;
    manualResults = normalizeResultsFile(manualData, "manual");
    results = normalizeResultsFile(resultsData, "api-football");

    // Restore saved knockout team names
    const savedNames = localStorage.getItem("tabela-copa-knockout-teams");
    currentKnockoutTeamNames = savedNames ? JSON.parse(savedNames) : {};

    populateGroups();
    if (isKnockoutPhase()) {
      populateKnockoutMatches();
    } else {
      populateMatches();
    }
    loadSelectedResultIntoForm();
    renderManualResultsList();
    showStatus("Dados carregados.", "ok");
  } catch (error) {
    showStatus(`Erro ao carregar dados: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function fetchJson(path) {
  const response = await fetch(`${path}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} retornou HTTP ${response.status}`);
  return response.json();
}

function normalizeResultsFile(file, source) {
  return {
    source: file?.source || source,
    updatedAt: file?.updatedAt || null,
    matches: file?.matches || {},
  };
}

function populateGroups() {
  const current = groupSelect.value;
  const groups = [...new Set(schedule.matches.map((match) => match.id.split("-")[0]))];
  groupSelect.innerHTML = groups.map((group) => `<option value="${group}">Grupo ${group}</option>`).join("");
  if (groups.includes(current)) groupSelect.value = current;
}

function populateMatches() {
  const group = groupSelect.value;
  const selected = matchSelect.value;
  const matches = schedule.matches.filter((match) => match.id.startsWith(`${group}-`));
  matchSelect.innerHTML = matches
    .map((match) => `<option value="${match.id}">${match.id}: ${escapeHtml(match.home)} x ${escapeHtml(match.away)} — ${formatDateTime(match.scheduledAtBrt)}</option>`)
    .join("");
  if (matches.some((match) => match.id === selected)) matchSelect.value = selected;
}

function populateKnockoutMatches() {
  const roundKey = phaseSelect.value;
  const round = knockoutSchedule.rounds[roundKey];
  if (!round) {
    matchSelect.innerHTML = "<option value=\"\">Nenhuma partida encontrada</option>";
    return;
  }

  const selected = matchSelect.value;
  matchSelect.innerHTML = round.matches.map((match) => {
    const home = getKnockoutTeamName(match, "home");
    const away = getKnockoutTeamName(match, "away");
    const label = home || away ? `${escapeHtml(home || "?")} x ${escapeHtml(away || "?")}` : "Times a definir";
    return `<option value="${match.id}">${match.id}: ${label} — ${formatDateTime(match.scheduledAtBrt)}</option>`;
  }).join("");

  if (round.matches.some((match) => match.id === selected)) {
    matchSelect.value = selected;
  }
}

function getKnockoutTeamName(match, side) {
  // First check locally saved names, then schedule
  if (currentKnockoutTeamNames[match.id]?.[side]) {
    return currentKnockoutTeamNames[match.id][side];
  }
  return match[side] || "";
}

function saveKnockoutTeamNames() {
  const match = getSelectedKnockoutMatch();
  if (!match) return;
  if (!currentKnockoutTeamNames[match.id]) {
    currentKnockoutTeamNames[match.id] = {};
  }
  currentKnockoutTeamNames[match.id].home = knockoutHomeInput.value.trim();
  currentKnockoutTeamNames[match.id].away = knockoutAwayInput.value.trim();
  localStorage.setItem("tabela-copa-knockout-teams", JSON.stringify(currentKnockoutTeamNames));
}

function getSelectedMatch() {
  if (isKnockoutPhase()) {
    return getSelectedKnockoutMatch();
  }
  return schedule.matches.find((match) => match.id === matchSelect.value);
}

function getSelectedKnockoutMatch() {
  const roundKey = phaseSelect.value;
  const round = knockoutSchedule.rounds[roundKey];
  if (!round) return null;
  return round.matches.find((match) => match.id === matchSelect.value);
}

function loadSelectedResultIntoForm() {
  const knockout = isKnockoutPhase();

  if (knockout) {
    const match = getSelectedKnockoutMatch();
    if (!match) {
      knockoutHomeInput.value = "";
      knockoutAwayInput.value = "";
      homeGoalsInput.value = "";
      awayGoalsInput.value = "";
      updatePreview();
      return;
    }
    knockoutHomeInput.value = getKnockoutTeamName(match, "home");
    knockoutAwayInput.value = getKnockoutTeamName(match, "away");
  }

  const match = getSelectedMatch();
  if (!match) return;

  const saved = manualResults.matches[match.id] || results.matches[match.id] || {};
  homeGoalsInput.value = saved.homeGoals ?? "";
  awayGoalsInput.value = saved.awayGoals ?? "";
  penaltyHomeInput.value = saved.homePenGoals ?? "";
  penaltyAwayInput.value = saved.awayPenGoals ?? "";
  statusSelect.value = saved.status || "FT";
  finalCheckbox.checked = saved.final !== false;
  updatePreview();
}

function updatePreview() {
  const match = getSelectedMatch();
  if (!match) {
    matchPreview.innerHTML = "";
    return;
  }
  const knockout = isKnockoutPhase();
  const homeName = knockout ? (getKnockoutTeamName(match, "home") || "?") : match.home;
  const awayName = knockout ? (getKnockoutTeamName(match, "away") || "?") : match.away;
  const homeGoals = homeGoalsInput.value === "" ? "—" : homeGoalsInput.value;
  const awayGoals = awayGoalsInput.value === "" ? "—" : awayGoalsInput.value;
  const homePen = penaltyHomeInput.value === "" ? null : penaltyHomeInput.value;
  const awayPen = penaltyAwayInput.value === "" ? null : penaltyAwayInput.value;
  const penStr = (homePen !== null || awayPen !== null)
    ? ` <small>(pên ${homePen ?? "—"} x ${awayPen ?? "—"})</small>`
    : "";
  const saved = manualResults.matches[match.id];
  matchPreview.innerHTML = `
    <strong>${escapeHtml(match.id)} — ${escapeHtml(homeName)} ${homeGoals} x ${awayGoals} ${escapeHtml(awayName)}${penStr}</strong>
    <span>${formatDateTime(match.scheduledAtBrt)} • ${finalCheckbox.checked ? "resultado final" : "não final"} • ${escapeHtml(statusSelect.value)}</span>
    <small>${saved ? "Já existe resultado manual salvo para esta partida." : "Sem resultado manual salvo para esta partida."}</small>
  `;
}

async function saveSelectedResult() {
  const match = getSelectedMatch();
  if (!match) return showStatus("Nenhuma partida selecionada.", "error");

  const knockout = isKnockoutPhase();
  const homeName = knockout ? knockoutHomeInput.value.trim() : match.home;
  const awayName = knockout ? knockoutAwayInput.value.trim() : match.away;

  if (knockout && (!homeName || !awayName)) {
    return showStatus("Informe os nomes dos times para partidas do mata-mata.", "error");
  }

  const homeGoals = parseScore(homeGoalsInput.value, "gols do mandante");
  const awayGoals = parseScore(awayGoalsInput.value, "gols do visitante");
  if (homeGoals === null || awayGoals === null) return;

  const homePenGoals = parseOptionalScore(penaltyHomeInput.value);
  const awayPenGoals = parseOptionalScore(penaltyAwayInput.value);

  const now = new Date().toISOString();
  const result = {
    status: statusSelect.value || "FT",
    final: finalCheckbox.checked,
    homeGoals,
    awayGoals,
    checkedAt: now,
    homeName: knockout ? homeName : undefined,
    awayName: knockout ? awayName : undefined,
  };

  if (homePenGoals !== null) result.homePenGoals = homePenGoals;
  if (awayPenGoals !== null) result.awayPenGoals = awayPenGoals;

  // Clean undefined keys
  if (result.homeName === undefined) delete result.homeName;
  if (result.awayName === undefined) delete result.awayName;

  manualResults.matches[match.id] = result;
  manualResults.source = "manual";
  manualResults.updatedAt = now;

  results.matches[match.id] = {
    ...result,
    source: "manual",
  };
  results.source = "api-football";
  results.updatedAt = now;

  if (knockout) saveKnockoutTeamNames();

  await persistFiles(`Resultado manual: ${match.id} ${homeName} ${homeGoals} x ${awayGoals} ${awayName}`);
}

async function removeSelectedResult() {
  const match = getSelectedMatch();
  if (!match) return showStatus("Nenhuma partida selecionada.", "error");
  if (!manualResults.matches[match.id]) return showStatus("Esta partida não possui resultado manual salvo.", "info");

  const knockout = isKnockoutPhase();
  const homeName = knockout ? (getKnockoutTeamName(match, "home") || match.id) : match.home;
  const awayName = knockout ? (getKnockoutTeamName(match, "away") || match.id) : match.away;

  if (!confirm(`Remover o resultado manual de ${match.id}: ${homeName} x ${awayName}?`)) return;

  const now = new Date().toISOString();
  delete manualResults.matches[match.id];
  manualResults.updatedAt = now;

  const currentResult = results.matches[match.id];
  if (currentResult?.source === "manual") delete results.matches[match.id];
  results.updatedAt = now;

  await persistFiles(`Remove resultado manual: ${match.id} ${homeName} x ${awayName}`);
}

function parseScore(value, label) {
  if (value === "") {
    showStatus(`Informe ${label}.`, "error");
    return null;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    showStatus(`O campo ${label} precisa ser um inteiro maior ou igual a zero.`, "error");
    return null;
  }
  return number;
}

function parseOptionalScore(value) {
  if (value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    showStatus("Os gols de pênaltis precisam ser um inteiro maior ou igual a zero.", "error");
    return null;
  }
  return number;
}

async function persistFiles(message) {
  const token = tokenInput.value.trim();
  if (!token) return showStatus("Informe o token GitHub antes de salvar.", "error");

  setBusy(true);
  showStatus("Gravando no GitHub...", "info");
  try {
    await refreshRemoteResultFiles(token);
    await putGithubFileWithRetry(paths.manual, manualResults, message, token);
    await putGithubFileWithRetry(paths.results, results, message, token);
    renderManualResultsList();
    updatePreview();
    if (isKnockoutPhase()) populateKnockoutMatches();
    showStatus("Resultado salvo no GitHub. O GitHub Pages pode levar alguns instantes para refletir a mudança.", "ok");
  } catch (error) {
    showStatus(`Erro ao salvar: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function refreshRemoteResultFiles(token) {
  const [remoteManual, remoteResults] = await Promise.all([
    getGithubJsonFile(paths.manual, token),
    getGithubJsonFile(paths.results, token),
  ]);

  manualResults = mergeResultFiles(normalizeResultsFile(remoteManual.content, "manual"), manualResults);
  results = mergeResultFiles(normalizeResultsFile(remoteResults.content, "api-football"), results);
}

function mergeResultFiles(remoteFile, localFile) {
  return {
    ...remoteFile,
    ...localFile,
    matches: {
      ...(remoteFile.matches || {}),
      ...(localFile.matches || {}),
    },
  };
}

async function getGithubJsonFile(path, token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const current = await githubRequest(`${url}?ref=${BRANCH}&v=${Date.now()}`, { token });
  return {
    sha: current.sha,
    content: JSON.parse(fromBase64Utf8(current.content || "")),
  };
}

async function putGithubFileWithRetry(path, data, message, token) {
  try {
    await putGithubFile(path, data, message, token);
  } catch (error) {
    if (!String(error.message).includes("HTTP 409")) throw error;
    await putGithubFile(path, data, message, token);
  }
}

async function putGithubFile(path, data, message, token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const current = await githubRequest(`${url}?ref=${BRANCH}&v=${Date.now()}`, { token });
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await githubRequest(url, {
    token,
    method: "PUT",
    body: {
      message,
      content: toBase64Utf8(content),
      sha: current.sha,
      branch: BRANCH,
    },
  });
}

async function githubRequest(url, { token, method = "GET", body = undefined } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = data?.message || response.statusText;
    throw new Error(`GitHub HTTP ${response.status}: ${detail}`);
  }
  return data;
}

function renderManualResultsList() {
  const entries = Object.entries(manualResults.matches || {}).sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) {
    manualResultsList.innerHTML = "<p class=\"hint\">Nenhum resultado manual salvo.</p>";
    return;
  }

  manualResultsList.innerHTML = entries.map(([matchId, result]) => {
    const match = findMatchById(matchId);
    const homeName = result.homeName || (match ? match.home : "?");
    const awayName = result.awayName || (match ? match.away : "?");
    const penInfo = (result.homePenGoals !== undefined || result.awayPenGoals !== undefined)
      ? ` <small>(pên ${result.homePenGoals ?? "—"} x ${result.awayPenGoals ?? "—"})</small>`
      : "";
    const label = `${homeName} ${result.homeGoals} x ${result.awayGoals} ${awayName}`;
    return `
      <article class="result-item">
        <div>
          <strong>${escapeHtml(matchId)} — ${escapeHtml(label)}${penInfo}</strong><br />
          <small>${escapeHtml(result.status || "FT")} • ${result.final === false ? "não final" : "final"}</small>
        </div>
        <small>${formatIso(result.checkedAt)}</small>
      </article>
    `;
  }).join("");
}

function findMatchById(matchId) {
  // Check group phase
  const groupMatch = schedule.matches.find((m) => m.id === matchId);
  if (groupMatch) return groupMatch;

  // Check knockout
  for (const round of Object.values(knockoutSchedule.rounds)) {
    const koMatch = round.matches.find((m) => m.id === matchId);
    if (koMatch) return koMatch;
  }
  return null;
}

function formatDateTime(value) {
  if (!value) return "sem horário";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(`${value}:00-03:00`));
}

function formatIso(value) {
  if (!value) return "sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function toBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64Utf8(value) {
  const cleanValue = String(value || "").replace(/\s/g, "");
  const binary = atob(cleanValue);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setBusy(busy) {
  [saveResultButton, removeResultButton, reloadButton].forEach((button) => { button.disabled = busy; });
}

function showStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.className = `status-box show ${type}`;
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => {
    statusBox.className = "status-box";
  }, type === "error" ? 9000 : 4500);
}
