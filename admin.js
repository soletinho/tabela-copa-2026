const OWNER = "soletinho";
const REPO = "tabela-copa-2026";
const BRANCH = "master";
const TOKEN_KEY = "tabela-copa-2026-admin-token";

const paths = {
  schedule: "data/schedule.json",
  manual: "data/manual-results.json",
  results: "data/results.json",
};

let schedule = { matches: [] };
let manualResults = { source: "manual", updatedAt: null, matches: {} };
let results = { source: "api-football", updatedAt: null, matches: {} };

const tokenInput = document.querySelector("#tokenInput");
const saveTokenButton = document.querySelector("#saveTokenButton");
const clearTokenButton = document.querySelector("#clearTokenButton");
const reloadButton = document.querySelector("#reloadButton");
const groupSelect = document.querySelector("#groupSelect");
const matchSelect = document.querySelector("#matchSelect");
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
  groupSelect.addEventListener("change", () => {
    populateMatches();
    loadSelectedResultIntoForm();
  });
  matchSelect.addEventListener("change", loadSelectedResultIntoForm);
  [homeGoalsInput, awayGoalsInput, statusSelect, finalCheckbox].forEach((el) => {
    el.addEventListener("input", updatePreview);
    el.addEventListener("change", updatePreview);
  });
  saveResultButton.addEventListener("click", saveSelectedResult);
  removeResultButton.addEventListener("click", removeSelectedResult);
}

async function loadAllData() {
  setBusy(true);
  showStatus("Carregando dados...", "info");
  try {
    const [scheduleData, manualData, resultsData] = await Promise.all([
      fetchJson(paths.schedule),
      fetchJson(paths.manual),
      fetchJson(paths.results),
    ]);
    schedule = scheduleData;
    manualResults = normalizeResultsFile(manualData, "manual");
    results = normalizeResultsFile(resultsData, "api-football");
    populateGroups();
    populateMatches();
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

function getSelectedMatch() {
  return schedule.matches.find((match) => match.id === matchSelect.value);
}

function loadSelectedResultIntoForm() {
  const match = getSelectedMatch();
  if (!match) return;

  const saved = manualResults.matches[match.id] || results.matches[match.id] || {};
  homeGoalsInput.value = saved.homeGoals ?? "";
  awayGoalsInput.value = saved.awayGoals ?? "";
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
  const homeGoals = homeGoalsInput.value === "" ? "—" : homeGoalsInput.value;
  const awayGoals = awayGoalsInput.value === "" ? "—" : awayGoalsInput.value;
  const saved = manualResults.matches[match.id];
  matchPreview.innerHTML = `
    <strong>${escapeHtml(match.id)} — ${escapeHtml(match.home)} ${homeGoals} x ${awayGoals} ${escapeHtml(match.away)}</strong>
    <span>${formatDateTime(match.scheduledAtBrt)} • ${finalCheckbox.checked ? "resultado final" : "não final"} • ${escapeHtml(statusSelect.value)}</span>
    <small>${saved ? "Já existe resultado manual salvo para esta partida." : "Sem resultado manual salvo para esta partida."}</small>
  `;
}

async function saveSelectedResult() {
  const match = getSelectedMatch();
  if (!match) return showStatus("Nenhuma partida selecionada.", "error");

  const homeGoals = parseScore(homeGoalsInput.value, "gols do mandante");
  const awayGoals = parseScore(awayGoalsInput.value, "gols do visitante");
  if (homeGoals === null || awayGoals === null) return;

  const now = new Date().toISOString();
  const result = {
    status: statusSelect.value || "FT",
    final: finalCheckbox.checked,
    homeGoals,
    awayGoals,
    checkedAt: now,
  };

  manualResults.matches[match.id] = result;
  manualResults.source = "manual";
  manualResults.updatedAt = now;

  results.matches[match.id] = {
    ...result,
    source: "manual",
  };
  results.source = "api-football";
  results.updatedAt = now;

  await persistFiles(`Resultado manual: ${match.id} ${match.home} ${homeGoals} x ${awayGoals} ${match.away}`);
}

async function removeSelectedResult() {
  const match = getSelectedMatch();
  if (!match) return showStatus("Nenhuma partida selecionada.", "error");
  if (!manualResults.matches[match.id]) return showStatus("Esta partida não possui resultado manual salvo.", "info");
  if (!confirm(`Remover o resultado manual de ${match.id}: ${match.home} x ${match.away}?`)) return;

  const now = new Date().toISOString();
  delete manualResults.matches[match.id];
  manualResults.updatedAt = now;

  const currentResult = results.matches[match.id];
  if (currentResult?.source === "manual") delete results.matches[match.id];
  results.updatedAt = now;

  await persistFiles(`Remove resultado manual: ${match.id} ${match.home} x ${match.away}`);
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

async function persistFiles(message) {
  const token = tokenInput.value.trim();
  if (!token) return showStatus("Informe o token GitHub antes de salvar.", "error");

  setBusy(true);
  showStatus("Gravando no GitHub...", "info");
  try {
    await putGithubFile(paths.manual, manualResults, message, token);
    await putGithubFile(paths.results, results, message, token);
    renderManualResultsList();
    updatePreview();
    showStatus("Resultado salvo no GitHub. O GitHub Pages pode levar alguns instantes para refletir a mudança.", "ok");
  } catch (error) {
    showStatus(`Erro ao salvar: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function putGithubFile(path, data, message, token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const current = await githubRequest(`${url}?ref=${BRANCH}`, { token });
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
    const match = schedule.matches.find((item) => item.id === matchId);
    const label = match ? `${match.home} ${result.homeGoals} x ${result.awayGoals} ${match.away}` : `${result.homeGoals} x ${result.awayGoals}`;
    return `
      <article class="result-item">
        <div>
          <strong>${escapeHtml(matchId)} — ${escapeHtml(label)}</strong><br />
          <small>${escapeHtml(result.status || "FT")} • ${result.final === false ? "não final" : "final"}</small>
        </div>
        <small>${formatIso(result.checkedAt)}</small>
      </article>
    `;
  }).join("");
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
