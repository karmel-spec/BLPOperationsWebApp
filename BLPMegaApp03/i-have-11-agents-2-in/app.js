const {
  avatarBase,
  activeNames,
  agents,
  orgDepartmentMeta,
  departmentDefaults,
  agentOverrides,
  tasks,
  approvalItems,
  training,
  integrations,
  marketingHermesConnection,
  neededFromTeam,
  launchPhases,
  permissionRows,
  vaultSources,
  vaultCollections,
  setupSteps,
  queueItems,
  healthSignals,
  logEvents,
  routeKeywords,
} = window.BLP_DATA;

const realData = window.BLP_REAL_DATA || {};
const openclawMapping = Array.isArray(window.BLP_OPENCLAW_MAPPING) ? window.BLP_OPENCLAW_MAPPING : [];
const agentBackupSources = Array.isArray(window.BLP_AGENT_BACKUP_SOURCES) ? window.BLP_AGENT_BACKUP_SOURCES : [];
const localApiBase = "http://127.0.0.1:8787";

async function persistToLocalApi(path, payload) {
  try {
    const response = await fetch(`${localApiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Local API ${response.status}`);
    return await response.json();
  } catch (error) {
    console.info("Local persistence unavailable; keeping this action in the current browser session.", error.message);
    return null;
  }
}

function normalizeNotionQueueStatus(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("review") || normalized.includes("approval")) return "Needs Approval";
  if (normalized.includes("block")) return "Blocked";
  if (normalized.includes("done") || normalized.includes("complete")) return "Done";
  if (normalized.includes("work") || normalized.includes("progress")) return "In Progress";
  if (normalized.includes("queue") || normalized.includes("backlog") || normalized.includes("todo") || normalized.includes("to do")) return "Queued";
  if (normalized.includes("intake") || normalized.includes("new")) return "Intake";
  return "Queued";
}

async function syncNotionWork() {
  try {
    const response = await fetch(`${localApiBase}/api/notion/work`);
    if (!response.ok) throw new Error(`Local API ${response.status}`);
    const payload = await response.json();
    if (!payload.ok || !Array.isArray(payload.items) || !payload.items.length) return;

    const existingIds = new Set(queueItems.map((item) => item.notionId || item.id));
    const notionItems = payload.items
      .filter((item) => !existingIds.has(item.id))
      .map((item) => ({
        id: `notion-${item.id}`,
        notionId: item.id,
        title: item.title,
        agent: item.agent,
        department: item.department,
        status: normalizeNotionQueueStatus(item.status),
        due: item.due || "No due date",
        approval: normalizeNotionQueueStatus(item.status) === "Needs Approval" ? "Human approval required" : "Notion tracked",
        source: "Notion",
        summary: item.summary,
        nextStep: item.nextStep,
        risk: item.risk || item.priority || "Normal",
        notionUrl: item.notionUrl,
      }));

    if (!notionItems.length) return;

    queueItems.unshift(...notionItems);
    tasks.unshift(
      ...notionItems.map((item) => ({
        id: `task-${item.id}`,
        label: item.title,
        agent: item.agent,
        type: "Notion",
        urgency: item.risk,
      })),
    );

    renderWorkQueue();
    renderTasks();
    renderDashboard(selectedAgent);
  } catch (error) {
    console.info("Notion work sync unavailable.", error.message);
  }
}

function enrichAgent(agent) {
  const defaults = departmentDefaults[agent.department] || departmentDefaults.Leadership;
  const overrides = agentOverrides[agent.name] || {};
  return {
    ...agent,
    supervisor: overrides.supervisor || defaults.supervisor,
    focus: overrides.focus || defaults.focus,
    files: overrides.files || defaults.files,
    permissions: overrides.permissions || defaults.permissions,
    guardrails: overrides.guardrails || defaults.guardrails,
    automations: overrides.automations || [
      `${agent.department} daily digest`,
      `${agent.name} task backlog review`,
      "Weekly training example capture",
    ],
    score: agent.status === "Active" ? { accuracy: 92, speed: 88, brand: 95, source: 86 } : { accuracy: 61, speed: 54, brand: 72, source: 58 },
  };
}

function formatDate(value) {
  if (!value) return "date unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

let selectedAgent = enrichAgent(agents[0]);
let selectedApproval = approvalItems[0];

const agentGrid = document.querySelector("#agentGrid");
const departmentGrid = document.querySelector("#departmentGrid");
const detailPane = document.querySelector("#detailPane");
const agentDashboard = document.querySelector("#agentDashboard");
const agentDrawer = document.querySelector("#agentDrawer");
const drawerScrim = document.querySelector("#drawerScrim");
const commandCenter = document.querySelector("#commandCenter");
const commandMenuButton = document.querySelector("#commandMenuButton");
const routerResult = document.querySelector("#routerResult");
const queueToolbar = document.querySelector("#queueToolbar");
const queueBoard = document.querySelector("#queueBoard");
const shopWorkQueueButton = document.querySelector("#shopWorkQueueButton");
const routeButton = document.querySelector("#routeButton");
const newRequestButton = document.querySelector("#newRequestButton");
const requestText = document.querySelector("#requestText");
const requestType = document.querySelector("#requestType");
const requestAudience = document.querySelector("#requestAudience");
const approvalMode = document.querySelector("#approvalMode");
const requestDue = document.querySelector("#requestDue");
const requestSource = document.querySelector("#requestSource");
const taskList = document.querySelector("#taskList");
const approvalList = document.querySelector("#approvalList");
const logControls = document.querySelector("#logControls");
const agentLogList = document.querySelector("#agentLogList");
const agentLogDetail = document.querySelector("#agentLogDetail");
const healthDashboard = document.querySelector("#healthDashboard");
const trainingBoard = document.querySelector("#trainingBoard");
const activationPipeline = document.querySelector("#activationPipeline");
const integrationBoard = document.querySelector("#integrationBoard");
const openclawIntake = document.querySelector("#openclawIntake");
const launchRoadmap = document.querySelector("#launchRoadmap");
const neededPanel = document.querySelector("#neededPanel");
const setupDetail = document.querySelector("#setupDetail");
const permissionsMatrix = document.querySelector("#permissionsMatrix");
const agentSearch = document.querySelector("#agentSearch");
const knowledgeVaultPanel = document.querySelector("#knowledgeVaultPanel");
const trainingVaultButton = document.querySelector("#trainingVaultButton");
const feedbackLauncher = document.querySelector("#feedbackLauncher");
const feedbackDialog = document.querySelector("#feedbackDialog");
const feedbackScreen = document.querySelector("#feedbackScreen");
const feedbackType = document.querySelector("#feedbackType");
const feedbackNotes = document.querySelector("#feedbackNotes");
const feedbackLog = document.querySelector("#feedbackLog");
const saveFeedback = document.querySelector("#saveFeedback");
const agentActionDialog = document.querySelector("#agentActionDialog");
const agentActionEyebrow = document.querySelector("#agentActionEyebrow");
const agentActionTitle = document.querySelector("#agentActionTitle");
const agentActionPrompt = document.querySelector("#agentActionPrompt");
const agentActionNotes = document.querySelector("#agentActionNotes");
const agentActionHelper = document.querySelector("#agentActionHelper");
const saveAgentAction = document.querySelector("#saveAgentAction");
const fileViewerDialog = document.querySelector("#fileViewerDialog");
const fileViewerEyebrow = document.querySelector("#fileViewerEyebrow");
const fileViewerTitle = document.querySelector("#fileViewerTitle");
const fileViewerFrame = document.querySelector("#fileViewerFrame");
const fileViewerOpenLink = document.querySelector("#fileViewerOpenLink");
let currentFilter = "all";
let feedbackItems = [];
let currentLogFilter = "All";
let currentQueueFilter = "All";
let selectedLogEvent = logEvents[0] || null;
let pendingAgentAction = { action: "Message", agent: selectedAgent };

const requestTemplates = {
  customer: {
    type: "Customer reply",
    approval: "Human approval required",
    audience: "Service / Fieldwork",
    due: "Today",
    text: "Draft a warm, customer-safe reply for this customer situation. Include source notes, next steps, and anything a human should confirm before sending.",
    source: "Customer email thread",
  },
  data: {
    type: "Data pull",
    approval: "Source required",
    audience: "Auto-route",
    due: "Tomorrow",
    text: "Pull together the current data, summarize what changed, flag anything missing, and include source links so the human team can trust the answer.",
    source: "Dashboard, sheet, Drive folder, or agent log",
  },
  website: {
    type: "Website copy",
    approval: "Human approval required",
    audience: "Marketing",
    due: "This week",
    text: "Draft website or inventory copy in BLP voice. Keep claims source-backed, avoid pricing promises, and prepare it for human publishing approval.",
    source: "Website / Shopify page or inventory notes",
  },
  training: {
    type: "Training update",
    approval: "Source required",
    audience: "Technical / Knowledge",
    due: "This week",
    text: "Create a training update from the approved example or correction. Explain what agents should do differently next time and where it belongs in the Knowledge Vault.",
    source: "Knowledge Vault note or corrected agent output",
  },
};

function agentImage(agent) {
  return encodeURI(agent.avatar);
}

function getAgent(name) {
  return enrichAgent(agents.find((agent) => agent.name === name) || agents[0]);
}

function setSelectedAgent(agent) {
  selectedAgent = enrichAgent(agent);
  renderDetail(selectedAgent);
  renderDashboard(selectedAgent);
}

function renderDetail(agent = selectedAgent) {
  detailPane.innerHTML = `
    <div class="agent-hero">
      <img src="${agentImage(agent)}" alt="${agent.name} avatar" />
      <div>
        <span class="pill">${agent.status}</span>
        <h4>${agent.name}</h4>
        <p>${agent.role}</p>
      </div>
    </div>
    <div class="detail-list">
      <div><span>System</span><strong>${agent.system}</strong></div>
      <div><span>Department</span><strong>${agent.department}</strong></div>
      <div><span>Email</span><strong>${agent.email}</strong></div>
      <div><span>Discord</span><strong>${agent.name} channel / handle</strong></div>
      <div><span>Telegram</span><strong>${agent.name} channel / handle</strong></div>
      <div><span>Approval rule</span><strong>Human review for customer-facing, pricing, finance, legal, and public website work.</strong></div>
    </div>
    <div class="detail-actions">
      <button class="primary-button" type="button" data-open-dashboard="${agent.name}">Open Dashboard</button>
      <button class="secondary-light-button" type="button" data-open-drawer="${agent.name}">Quick Drawer</button>
    </div>
  `;

  detailPane.querySelector("[data-open-dashboard]").addEventListener("click", () => {
    setSelectedAgent(agent);
    showSection("agentDesk");
  });
  detailPane.querySelector("[data-open-drawer]").addEventListener("click", () => openDrawer(agent));
}

function renderCommandCenter() {
  const activeCount = agents.filter((agent) => agent.status === "Active").length;
  const blockedCount = queueItems.filter((item) => item.status === "Blocked").length;
  const backupStatusCount = agentBackupSources.filter((source) => source.statusFileMeta?.exists).length;
  const recentEvents = logEvents.slice(0, 3);
  const activeAgentButtons = agents
    .filter((agent) => agent.status === "Active")
    .slice(0, 6)
    .map((agent) => `<button type="button" data-command-agent="${agent.name}"><img src="${agentImage(agent)}" alt="" /><span>${agent.name}</span></button>`)
    .join("");

  commandCenter.innerHTML = `
    <header class="command-header">
      <div>
        <p class="eyebrow">Command Center</p>
        <h3>Today at BLP</h3>
      </div>
      <button class="icon-button" type="button" id="closeCommandCenter" aria-label="Close command center">×</button>
    </header>

    <div class="today-grid">
      <article><span>Active agents</span><strong>${activeCount}</strong></article>
      <article><span>Live approvals</span><strong>${approvalItems.length}</strong></article>
      <article><span>Blocked work</span><strong>${blockedCount}</strong></article>
      <article><span>Status files</span><strong>${backupStatusCount}</strong></article>
    </div>

    <section class="command-section">
      <h4>Quick Actions</h4>
      <div class="command-action-grid">
        <button type="button" data-command-section="command">New Request</button>
        <button type="button" data-command-section="workQueue">Work Queue</button>
        <button type="button" data-command-section="approvals">Approvals</button>
        <button type="button" data-command-section="knowledgeVault">Knowledge Vault</button>
        <button type="button" data-command-section="agentHealth">Agent Health</button>
        <button type="button" data-command-section="agentLog">Agent Log</button>
        <button type="button" data-command-section="integrations">Live Integrations</button>
        <button type="button" data-command-section="integrations">Morning Handoff</button>
      </div>
    </section>

    <section class="command-section">
      <h4>Assign to Agent</h4>
      <div class="command-agent-grid">${activeAgentButtons}</div>
    </section>

    <section class="command-section">
      <h4>Alerts</h4>
      <div class="command-list">
        <article><strong>${approvalItems.length ? "Live approvals waiting" : "No live approvals waiting"}</strong><span>${approvalItems.length ? "Open Approvals to review live packets." : "Approval queue is empty until agent feeds add real drafts."}</span></article>
        <article><strong>Nightly backup folders</strong><span>${backupStatusCount} active agent status file${backupStatusCount === 1 ? "" : "s"} detected from synced backups.</span></article>
        <article><strong>Live connector coverage</strong><span>Connect each active agent's backup folder or live API before enabling task dispatch.</span></article>
      </div>
    </section>

    <section class="command-section">
      <h4>Recent Activity</h4>
      <div class="command-list">
        ${
          recentEvents.length
            ? recentEvents.map((event) => `<article><strong>${event.agent}</strong><span>${event.title}</span></article>`).join("")
            : "<article><strong>No live activity yet</strong><span>Agent actions will appear here after real connectors or local API events write to the audit log.</span></article>"
        }
      </div>
    </section>
  `;

  commandCenter.querySelector("#closeCommandCenter").addEventListener("click", closeCommandCenter);
  commandCenter.querySelectorAll("[data-command-section]").forEach((button) => {
    button.addEventListener("click", () => {
      closeCommandCenter();
      showSection(button.dataset.commandSection);
    });
  });
  commandCenter.querySelectorAll("[data-command-agent]").forEach((button) => {
    button.addEventListener("click", () => {
      closeCommandCenter();
      setSelectedAgent(getAgent(button.dataset.commandAgent));
      showSection("agentDesk");
    });
  });
}

function openCommandCenter() {
  renderCommandCenter();
  commandCenter.classList.remove("is-hidden");
  drawerScrim.classList.remove("is-hidden");
}

function closeCommandCenter() {
  commandCenter.classList.add("is-hidden");
  drawerScrim.classList.add("is-hidden");
}

function renderDrawer(agent = selectedAgent) {
  agentDrawer.innerHTML = `
    <header class="drawer-header">
      <button class="icon-button" type="button" id="closeDrawer" aria-label="Close drawer">×</button>
      <span class="pill">${agent.status} · ${agent.system}</span>
    </header>
    <div class="agent-hero drawer-profile">
      <img src="${agentImage(agent)}" alt="${agent.name} avatar" />
      <div>
        <h4>${agent.name}</h4>
        <p>${agent.role}</p>
      </div>
    </div>
    <div class="drawer-focus">
      <span>Quick read</span>
      <p>${agent.focus}</p>
    </div>
    <div class="drawer-action-grid">
      <button class="primary-button" type="button" data-agent-action="Message">Message</button>
      <button class="secondary-light-button" type="button" data-agent-action="Assign Task">Assign Task</button>
      <button
        class="secondary-light-button tooltip-button"
        type="button"
        title="Correct one specific answer, task, tone issue, or mistake so the agent can fix this instance."
        data-tooltip="Use Correct when one output is wrong: point to the answer, explain what should change, and send it back for revision."
        data-agent-action="Correct"
      >Correct</button>
      <button
        class="secondary-light-button tooltip-button"
        type="button"
        title="Train the agent with a reusable lesson, approved example, SOP, or rule that should improve future work."
        data-tooltip="Use Train when this should become future guidance: add the approved example, rule, or SOP to help the agent improve over time."
        data-agent-action="Train"
      >Train</button>
    </div>
    <div class="detail-list">
      <div><span>Current work</span><strong>${getAgentWork(agent)[0]}</strong></div>
      <div><span>Supervisor</span><strong>${agent.supervisor}</strong></div>
      <div><span>Email</span><strong>${agent.email}</strong></div>
      <div><span>Next cron</span><strong>${agent.automations[0]} · tomorrow 8:00 AM</strong></div>
      <div><span>Approval boundary</span><strong>${agent.guardrails[0]}</strong></div>
    </div>
    <button class="primary-button drawer-dashboard-button" type="button" id="drawerDashboard">Open Full Agent Dashboard</button>
  `;
  agentDrawer.querySelector("#closeDrawer").addEventListener("click", closeDrawer);
  agentDrawer.querySelectorAll("[data-agent-action]").forEach((button) => {
    button.addEventListener("click", () => openAgentAction(button.dataset.agentAction, agent));
  });
  agentDrawer.querySelector("#drawerDashboard").addEventListener("click", () => {
    closeDrawer();
    showSection("agentDesk");
  });
}

function openDrawer(agent) {
  setSelectedAgent(agent);
  renderDrawer(selectedAgent);
  agentDrawer.classList.remove("is-hidden");
  drawerScrim.classList.remove("is-hidden");
}

function closeDrawer() {
  agentDrawer.classList.add("is-hidden");
  if (commandCenter.classList.contains("is-hidden")) {
    drawerScrim.classList.add("is-hidden");
  }
}

const agentActionCopy = {
  Message: {
    eyebrow: "Message agent",
    prompt: "What should this agent know?",
    helper: "Use this for a quick note, question, or context update. It records a message draft in the Agent Log.",
    placeholder: "Example: Please review the new restoration notes and summarize anything that needs human approval.",
  },
  "Assign Task": {
    eyebrow: "Assign task",
    prompt: "What work should this agent take on?",
    helper: "Use this for a concrete work item. It creates a new Intake card in the Work Queue and logs the assignment.",
    placeholder: "Example: Prepare a source-backed brief for open tuning requests due this week.",
  },
  Correct: {
    eyebrow: "Correct output",
    prompt: "What specific output or behavior needs correction?",
    helper: "Use Correct for one specific mistake. Include what was wrong, what good looks like, and whether a human must review the revision.",
    placeholder: "Example: The draft was too generic. Add BLP warmth, mention inspection first, and remove any timeline promise.",
  },
  Train: {
    eyebrow: "Train agent",
    prompt: "What reusable lesson should this agent learn?",
    helper: "Use Train for guidance that should improve future work. Add the approved example, rule, or Knowledge Vault source.",
    placeholder: "Example: When discussing restoration timelines, say inspection comes before estimates and avoid promising completion dates.",
  },
};

function openAgentAction(action, agent = selectedAgent) {
  pendingAgentAction = { action, agent };
  const copy = agentActionCopy[action] || agentActionCopy.Message;
  agentActionEyebrow.textContent = copy.eyebrow;
  agentActionTitle.textContent = `${action} ${agent.name}`;
  agentActionPrompt.textContent = copy.prompt;
  agentActionNotes.value = "";
  agentActionNotes.placeholder = copy.placeholder;
  agentActionHelper.textContent = copy.helper;
  agentActionDialog.showModal();
  agentActionNotes.focus();
}

function saveCurrentAgentAction(event) {
  event.preventDefault();
  const notes = agentActionNotes.value.trim();
  if (!notes) return;
  const { action, agent } = pendingAgentAction;
  const title = `${action}: ${notes.split(/[.?!]/)[0].slice(0, 72)}`;
  const risk = action === "Train" || action === "Correct" ? "Medium" : "Low";
  const logRecord = {
    time: "Just now",
    agent: agent.name,
    human: "BLP team",
    system: "Agent Drawer",
    type: action,
    status: action === "Assign Task" ? "Queued" : "Recorded",
    risk,
    title,
    summary: notes,
    source: `${agent.name} drawer`,
    receipt: action === "Train"
      ? "Training note captured for Knowledge Vault review."
      : action === "Correct"
        ? "Correction recorded so the agent can revise this instance."
        : action === "Assign Task"
          ? "Task created from agent drawer."
          : "Message draft recorded.",
  };
  logEvents.unshift(logRecord);
  selectedLogEvent = logEvents[0];

  let queueRecord = null;
  if (action === "Assign Task") {
    queueRecord = {
      title: notes.split(/[.?!]/)[0].slice(0, 72) || `${agent.name} task`,
      status: "Intake",
      agent: agent.name,
      department: agent.department,
      type: "Assignment",
      approval: "Internal only",
      risk,
      due: "New",
      source: "Agent Drawer",
      summary: notes,
      nextStep: `${agent.name} accepts scope and prepares the first draft or status update.`,
    };
    tasks.unshift({
      title: queueRecord.title,
      owner: agent.name,
      type: "Drawer assignment",
      status: "Queued",
      summary: notes,
    });
    queueItems.unshift(queueRecord);
    renderTasks();
    renderWorkQueue();
  }

  renderAgentLog();
  agentActionDialog.close();
  persistToLocalApi("/api/agent-action", {
    action,
    agent: agent.name,
    department: agent.department,
    title,
    summary: notes,
    risk,
    approval: queueRecord?.approval || "Internal only",
    due: queueRecord?.due || "New",
    nextStep: queueRecord?.nextStep || logRecord.receipt,
    logRecord,
    queueRecord,
  });
}

function getAgentWork(agent) {
  const byDepartment = {
    Leadership: ["Resolve owner-priority routing", "Review next agent activation plan", "Prepare leadership brief"],
    Technical: ["Map dashboard data model", "Review integration credentials checklist", "Clean knowledge source tags"],
    Shop: ["Summarize restoration blockers", "Prepare shop status notes", "Flag capacity conflicts"],
    Sales: ["Draft showroom prep notes", "Match leads to inventory", "Review sales follow-up quality"],
    "Admin & Customer Service": ["Triage customer-service drafts", "Prepare scheduling notes", "Queue approval-ready replies"],
    Fieldwork: ["Group tuning requests by area", "Flag warranty follow-ups", "Draft post-service messages"],
    Operations: ["Review fleet and facilities tasks", "Summarize risk items", "Queue vendor questions"],
    Marketing: ["Prepare SEO content updates", "Draft campaign assets", "Review competitor notes"],
    "Accounting & Finance": ["Prepare internal finance summary", "Flag AR exceptions", "Review monthly close notes"],
  };
  return byDepartment[agent.department] || byDepartment.Leadership;
}

function getBackupSource(agent) {
  return agentBackupSources.find((source) => source.name === agent.name);
}

function renderBackupFiles(agent) {
  const source = getBackupSource(agent);
  const documents = source?.backupDocuments || [];
  const folderUrl = source?.backupFolderUrl || (source?.localSyncPath ? `file://${encodeURI(source.localSyncPath)}` : null);
  const folderState = source?.connectionStatus === "needs-backup-folder" || !source ? "Waiting for folder" : "Folder connected";
  const fallbackFiles = ["Agent", "Identity", "Soul", "Skill", "Safety Rules", "Status"];

  return `
    <section class="dash-panel span-2">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Nightly backup</p>
          <h3>Backup Files</h3>
        </div>
        ${folderUrl ? `<a class="text-button" href="${folderUrl}" target="_blank" rel="noreferrer">Open Drive folder</a>` : `<span class="pill">${folderState}</span>`}
      </div>
      <p class="backup-note">Daily Google Drive backup files for ${agent.name}. Available files open inside the console preview.</p>
      <div class="backup-file-grid">
        ${
          documents.length
            ? documents
                .map(
                  (doc) => `
                    <button class="backup-file-link ${doc.exists ? "is-available" : ""}" type="button" data-backup-agent="${agent.name}" data-backup-file="${doc.key}" ${doc.exists ? "" : "disabled"}>
                      <strong>${doc.label}</strong>
                      <span>${doc.exists ? `Updated ${formatDate(doc.modifiedAt)}` : `Waiting for ${doc.expectedFile}`}</span>
                    </button>
                  `,
                )
                .join("")
            : fallbackFiles
                .map(
                  (label) => `
                    <button class="backup-file-link" type="button" disabled>
                      <strong>${label}</strong>
                      <span>Add backup folder first</span>
                    </button>
                  `,
                )
                .join("")
        }
      </div>
    </section>
  `;
}

function renderAgentHealthSnapshot(agent) {
  const signal = healthSignals.find((item) => item.name === agent.name) || {
    name: agent.name,
    status: agent.status === "Active" ? "Ready" : "Watch",
    trend: "Stable",
    load: getAgentWork(agent)[0],
    blocker: "None",
    lastAction: "Awaiting live status feed",
    lastCorrection: "None recorded",
    checkIn: "Not checked",
    score: agent.score?.accuracy || 80,
  };

  return `
    <section class="dash-panel span-3 agent-health-snapshot">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Operational health</p>
          <h3>${agent.name}'s live management row</h3>
        </div>
        <button class="text-button" type="button" data-dashboard-health="${agent.name}">Open Health Board</button>
      </div>
      <div class="health-table dashboard-health-table">
        <div class="health-head">
          <span>Status</span>
          <span>Trend</span>
          <span>Current load</span>
          <span>Blocker</span>
          <span>Last action</span>
          <span>Last correction</span>
          <span>Check-in</span>
          <span>Score</span>
        </div>
        <div class="health-row static">
          <span><em class="health-status ${signal.status.toLowerCase()}">${signal.status}</em></span>
          <span><em class="trend ${signal.trend.toLowerCase()}">${signal.trend}</em></span>
          <span>${signal.load}</span>
          <span>${signal.blocker}</span>
          <span>${signal.lastAction}</span>
          <span>${signal.lastCorrection}</span>
          <span>${signal.checkIn}</span>
          <span><strong>${signal.score}%</strong><meter min="0" max="100" value="${signal.score}"></meter></span>
        </div>
      </div>
    </section>
  `;
}

function openBackupFile(agentName, fileKey) {
  const source = agentBackupSources.find((item) => item.name === agentName);
  const document = source?.backupDocuments?.find((item) => item.key === fileKey);
  if (!document?.url) return;

  fileViewerEyebrow.textContent = `${agentName} backup file`;
  fileViewerTitle.textContent = document.label;
  fileViewerFrame.src = document.url;
  fileViewerOpenLink.href = document.url;
  fileViewerDialog.showModal();
}

function renderDashboard(agent = selectedAgent) {
  const activeSwitcher = agents
    .filter((item) => item.status === "Active")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => `<button class="${item.name === agent.name ? "is-active" : ""}" type="button" data-switch-agent="${item.name}"><img src="${agentImage(item)}" alt="" />${item.name}</button>`)
    .join("");
  const work = getAgentWork(agent);
  const scoreRows = Object.entries(agent.score)
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}%</strong><meter min="0" max="100" value="${value}"></meter></div>`)
    .join("");
  agentDashboard.innerHTML = `
    <div class="agent-switcher" aria-label="Active agent switcher">${activeSwitcher}</div>
    <div class="dashboard-hero">
      <div class="agent-hero">
        <img src="${agentImage(agent)}" alt="${agent.name} avatar" />
        <div>
          <p class="eyebrow">Agent dashboard</p>
          <h3>${agent.name}</h3>
          <p>${agent.role}</p>
        </div>
      </div>
      <div class="dashboard-hero-actions">
        <button class="primary-button" type="button" data-open-drawer="${agent.name}">Open Drawer</button>
        <button class="secondary-light-button" type="button" data-dashboard-action="Message">Message Agent</button>
        <button class="secondary-light-button" type="button" data-dashboard-action="Assign Project">Assign Project</button>
      </div>
    </div>

    <div class="dashboard-grid">
      <section class="dash-panel span-2">
        <div class="section-heading compact"><h3>Operating Brief</h3><span class="pill">${agent.status} · ${agent.system}</span></div>
        <p class="brief">${agent.focus}</p>
        <div class="brief-grid">
          <div><span>Department</span><strong>${agent.department}</strong></div>
          <div><span>Supervisor</span><strong>${agent.supervisor}</strong></div>
          <div><span>Email</span><strong>${agent.email}</strong></div>
          <div><span>Channels</span><strong>Email · Discord · Telegram</strong></div>
        </div>
      </section>

      ${renderAgentHealthSnapshot(agent)}

      <section class="dash-panel">
        <div class="section-heading compact"><h3>Work Queue</h3><button class="text-button" type="button" data-dashboard-action="Assign Project">Add task</button></div>
        ${work.map((item, index) => `<article class="queue-item"><span>${index === 0 ? "Now" : index === 1 ? "Next" : "Later"}</span><strong>${item}</strong><small>${index === 0 ? "Needs human review" : "Agent can draft"}</small></article>`).join("")}
      </section>

      <section class="dash-panel">
        <div class="section-heading compact"><h3>Cron Jobs</h3><button class="text-button">Manage</button></div>
        ${agent.automations.map((job, index) => `<article class="cron-item"><strong>${job}</strong><span>${index === 0 ? "Next: tomorrow 8:00 AM" : index === 1 ? "Weekly Monday" : "On completion"}</span><small>${index === 0 ? "Last run successful" : "Monitoring"}</small></article>`).join("")}
      </section>

      <section class="dash-panel">
        <div class="section-heading compact"><h3>Files & Knowledge</h3><button class="text-button">Open vault</button></div>
        ${agent.files.map((file) => `<div class="file-row"><span>□</span><strong>${file}</strong><small>Assigned source</small></div>`).join("")}
      </section>

      ${renderBackupFiles(agent)}

      <section class="dash-panel">
        <div class="section-heading compact"><h3>Permissions</h3><span class="pill">Guarded</span></div>
        <h4>Can do</h4>
        <ul>${agent.permissions.map((item) => `<li>${item}</li>`).join("")}</ul>
        <h4>Needs approval</h4>
        <ul>${agent.guardrails.map((item) => `<li>${item}</li>`).join("")}</ul>
      </section>

      <section class="dash-panel">
        <div class="section-heading compact"><h3>Training</h3><button class="text-button" type="button" data-dashboard-action="Train">Add example</button></div>
        <article class="training-card"><small>Current lesson</small><p>Use approved BLP wording for family heirloom restoration and avoid unsupported timelines.</p></article>
        <article class="training-card"><small>Known weakness</small><p>${agent.status === "Active" ? "Needs stronger source links on factual claims." : "Role and tool access still need human approval."}</p></article>
      </section>

      <section class="dash-panel">
        <div class="section-heading compact"><h3>Quality</h3><span class="pill">Last 30 days</span></div>
        <div class="score-list">${scoreRows}</div>
      </section>

      <section class="dash-panel span-2">
        <div class="section-heading compact"><h3>Communication Center</h3><button class="text-button">Broadcast</button></div>
        <div class="message-composer">
          <textarea aria-label="Message ${agent.name}" placeholder="Send a note, correction, assignment, or training example to ${agent.name}."></textarea>
          <div class="request-controls">
            <select aria-label="Channel"><option>Email</option><option>Discord</option><option>Telegram</option></select>
            <select aria-label="Message purpose"><option>Assignment</option><option>Correction</option><option>Training</option><option>Question</option></select>
            <button class="primary-button" type="button" data-dashboard-action="Message">Send Draft</button>
          </div>
        </div>
      </section>
    </div>
  `;
  agentDashboard.querySelector("[data-open-drawer]").addEventListener("click", () => openDrawer(agent));
  agentDashboard.querySelectorAll("[data-dashboard-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.dashboardAction === "Assign Project" ? "Assign Task" : button.dataset.dashboardAction;
      openAgentAction(action, agent);
    });
  });
  agentDashboard.querySelectorAll("[data-switch-agent]").forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedAgent(getAgent(button.dataset.switchAgent));
      showSection("agentDesk");
    });
  });
  agentDashboard.querySelectorAll("[data-backup-file]").forEach((button) => {
    button.addEventListener("click", () => openBackupFile(button.dataset.backupAgent, button.dataset.backupFile));
  });
  agentDashboard.querySelectorAll("[data-dashboard-health]").forEach((button) => {
    button.addEventListener("click", () => showSection("agentHealth"));
  });
}

function renderAgents() {
  const query = agentSearch.value.trim().toLowerCase();
  const filtered = agents.slice().sort((a, b) => a.name.localeCompare(b.name)).filter((agent) => {
    const haystack = `${agent.name} ${agent.role} ${agent.department} ${agent.system}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const matchesFilter =
      currentFilter === "all" ||
      agent.status.toLowerCase() === currentFilter ||
      agent.system === currentFilter;
    return matchesSearch && matchesFilter;
  });

  agentGrid.innerHTML = filtered
    .map(
      (agent) => `
      <article class="agent-card">
        <button type="button" data-agent="${agent.name}">
          <img src="${agentImage(agent)}" alt="${agent.name} avatar" />
          <small>${agent.department}</small>
          <h4>${agent.name}</h4>
          <p>${agent.role}</p>
          <span class="status ${agent.status === "On Deck" ? "on-deck" : ""}">${agent.status} · ${agent.system}</span>
          <span class="card-actions">Quick drawer · Dashboard</span>
        </button>
      </article>
    `,
    )
    .join("");

  agentGrid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = getAgent(button.dataset.agent);
      openDrawer(selected);
    });
  });
}

function renderWorkQueue() {
  const statuses = ["Intake", "Queued", "In Progress", "Needs Approval", "Blocked", "Done"];
  const departments = ["All", ...new Set(queueItems.map((item) => item.department))];
  const attentionCount = queueItems.filter((item) => ["Needs Approval", "Blocked"].includes(item.status)).length;
  const todayCount = queueItems.filter((item) => item.due === "Today" || item.due === "New").length;
  const draftCount = queueItems.filter((item) => (item.approval || "").toLowerCase().includes("approval") || item.status === "Needs Approval").length;
  const notionCount = queueItems.filter((item) => item.source === "Notion").length;
  queueToolbar.innerHTML = `
    <div class="queue-summary-strip" aria-label="Work queue summary">
      <article><span>Needs eyes</span><strong>${attentionCount}</strong><small>Approval or blocked</small></article>
      <article><span>Due now</span><strong>${todayCount}</strong><small>Today or newly routed</small></article>
      <article><span>Draft gates</span><strong>${draftCount}</strong><small>Human-safe review</small></article>
      <article><span>Notion live</span><strong>${notionCount}</strong><small>${notionCount ? "Synced from BLP Agent Console" : "Waiting for Notion feed"}</small></article>
    </div>
    <div class="filter-row" role="group" aria-label="Work queue filters">
      ${departments.map((department) => `<button class="filter ${department === currentQueueFilter ? "is-active" : ""}" type="button" data-queue-filter="${department}">${department}</button>`).join("")}
    </div>
  `;
  queueToolbar.querySelectorAll("[data-queue-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentQueueFilter = button.dataset.queueFilter;
      renderWorkQueue();
    });
  });

  const filtered = queueItems.filter((item) => currentQueueFilter === "All" || item.department === currentQueueFilter);
  queueBoard.innerHTML = statuses
    .map((status) => {
      const cards = filtered.filter((item) => item.status === status);
      return `
        <section class="queue-lane">
          <header>
            <h4>${status}</h4>
            <span>${cards.length}</span>
          </header>
          <div class="queue-card-list">
            ${cards
              .map((item) => {
                const agent = getAgent(item.agent);
                return `
                  <article class="queue-card ${item.source === "Notion" ? "is-notion" : ""}">
                    <div class="queue-card-agent">
                      <img src="${agentImage(agent)}" alt="" />
                      <div>
                        <strong>${item.agent}</strong>
                        <small>${item.department}</small>
                      </div>
                    </div>
                    <div class="queue-card-kicker">
                      <span>${item.type || "Agent task"}</span>
                      <span>${item.approval || (item.status === "Needs Approval" ? "Human approval required" : "Internal workflow")}</span>
                    </div>
                    <h5>${item.title}</h5>
                    <p>${item.summary}</p>
                    <div class="queue-next-step"><strong>Next:</strong> ${item.nextStep || nextStepForQueueItem(item)}</div>
                    <div class="queue-card-meta">
                      <span class="risk ${item.risk.toLowerCase()}">${item.risk}</span>
                      <span>${item.due}</span>
                    </div>
                    <div class="queue-source-row">
                      <small>${item.source}</small>
                      ${item.notionUrl ? `<a href="${item.notionUrl}" target="_blank" rel="noreferrer">Open in Notion</a>` : ""}
                    </div>
                  </article>
                `;
              })
              .join("") || `<article class="queue-empty">No work here.</article>`}
          </div>
        </section>
      `;
    })
    .join("");
}

function nextStepForQueueItem(item) {
  if (item.status === "Needs Approval") return "Human reviews, requests revision, or approves for the next action.";
  if (item.status === "Blocked") return "Resolve the missing source, permission, or owner decision.";
  if (item.status === "In Progress") return `${item.agent} prepares draft output with source notes.`;
  if (item.status === "Done") return "Receipt stays in Agent Log for later review.";
  return "Agent accepts the request and confirms scope before drafting.";
}

function renderTasks() {
  taskList.innerHTML = tasks
    .map(
      (task) => `
      <article class="task-card">
        <header>
          <small>${task.type}</small>
          <span class="pill">${task.status}</span>
        </header>
        <strong>${task.title}</strong>
        <p>${task.summary}</p>
        <small>Owner: ${task.owner}</small>
      </article>
    `,
    )
    .join("");
}

function renderDepartments() {
  const departments = [...new Set(agents.map((agent) => agent.department))].filter((department) => department !== "Leadership");
  const leadership = agents.filter((agent) => agent.department === "Leadership");

  departmentGrid.innerHTML = `
    <section class="simple-org-hero">
      <div>
        <p class="eyebrow">Agent org</p>
        <h3>Leadership</h3>
      </div>
      <div class="simple-leadership-row">
        ${leadership.map((agent) => simpleOrgAgent(agent, true)).join("")}
      </div>
    </section>

    <div class="simple-org-list">
      ${departments
        .map((department) => {
          const members = agents.filter((agent) => agent.department === department);
          const active = members.filter((agent) => agent.status === "Active").length;
          return `
            <section class="simple-org-section">
              <header>
                <div>
                  <h4>${department}</h4>
                  <span>${active} active · ${members.length - active} on deck</span>
                </div>
              </header>
              <div class="simple-agent-row">
                ${members.map((agent) => simpleOrgAgent(agent)).join("")}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;

  departmentGrid.querySelectorAll("[data-org-agent]").forEach((button) => {
    button.addEventListener("click", () => openDrawer(getAgent(button.dataset.orgAgent)));
  });
}

function simpleOrgAgent(agent, large = false) {
  return `
    <button class="simple-org-agent ${large ? "large" : ""}" type="button" data-org-agent="${agent.name}">
      <img src="${agentImage(agent)}" alt="${agent.name} avatar" />
      <span>
        <strong>${agent.name}</strong>
        <small>${agent.role}</small>
        <em class="${agent.status === "On Deck" ? "on-deck" : ""}">${agent.status} · ${agent.system}</em>
      </span>
    </button>
  `;
}

function renderAgentHealth() {
  const statusCounts = healthSignals.reduce((counts, signal) => {
    counts[signal.status] = (counts[signal.status] || 0) + 1;
    return counts;
  }, {});
  const staleCount = healthSignals.filter((signal) => signal.checkIn.includes("hr")).length;
  const decliningCount = healthSignals.filter((signal) => signal.trend === "Declining").length;

  healthDashboard.innerHTML = `
    <div class="health-summary-grid">
      <article><span>Ready</span><strong>${statusCounts.Ready || 0}</strong><small>Clear to assign</small></article>
      <article><span>Busy</span><strong>${statusCounts.Busy || 0}</strong><small>Watch workload</small></article>
      <article><span>Needs attention</span><strong>${(statusCounts.Watch || 0) + staleCount}</strong><small>Watch or stale</small></article>
      <article><span>Declining</span><strong>${decliningCount}</strong><small>Needs correction</small></article>
    </div>

    <section class="health-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Active agents</p>
          <h3>Operational health board</h3>
        </div>
        <button class="text-button" type="button">Run health check</button>
      </div>
      <div class="health-table enhanced">
        <div class="health-head">
          <span>Agent</span>
          <span>Status</span>
          <span>Trend</span>
          <span>Current load</span>
          <span>Blocker</span>
          <span>Last action</span>
          <span>Last correction</span>
          <span>Check-in</span>
          <span>Score</span>
        </div>
        ${healthSignals
          .map((signal) => {
            const agent = getAgent(signal.name);
            return `
              <button class="health-row" type="button" data-health-agent="${signal.name}">
                <span class="health-agent"><img src="${agentImage(agent)}" alt="" />${signal.name}</span>
                <span><em class="health-status ${signal.status.toLowerCase()}">${signal.status}</em></span>
                <span><em class="trend ${signal.trend.toLowerCase()}">${signal.trend}</em></span>
                <span>${signal.load}</span>
                <span>${signal.blocker}</span>
                <span>${signal.lastAction}</span>
                <span>${signal.lastCorrection}</span>
                <span>${signal.checkIn}</span>
                <span><strong>${signal.score}%</strong><meter min="0" max="100" value="${signal.score}"></meter></span>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>

    <div class="health-insights">
      <article>
        <p class="eyebrow">Recommended next action</p>
        <h4>${approvalItems.length ? "Clear live approval packets before adding more customer-facing work." : "No live approval packets are waiting."}</h4>
        <p>${approvalItems.length ? "Open Approvals to approve, request revision, or send packets to training before enabling more outward-facing work." : "The old sample review queue has been removed. New approval packets will appear only when live agent feeds or the local API create them."}</p>
        <div class="health-insight-actions">
          <button class="primary-button" type="button" data-health-target="approvals">Open Approvals</button>
          <button class="secondary-light-button" type="button" data-health-target="workQueue">Open Work Queue</button>
        </div>
      </article>
      <article>
        <p class="eyebrow">Health alerts</p>
        <h4>Connect missing agent feeds before judging performance.</h4>
        <p>Health rows now reflect live connector coverage. Agents without backup folders, status files, or live APIs are marked guarded until their data feed is connected.</p>
      </article>
      <article>
        <p class="eyebrow">Private beta readiness</p>
        <h4>Start live connections in read-only mode.</h4>
        <p>Nightly Google Drive backups, status files, cron inventories, and audit logs are the safest first live signals. Website, finance, and outbound messaging stay approval-gated.</p>
      </article>
    </div>
  `;

  healthDashboard.querySelectorAll("[data-health-agent]").forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedAgent(getAgent(button.dataset.healthAgent));
      showSection("agentDesk");
    });
  });
  healthDashboard.querySelectorAll("[data-health-target]").forEach((button) => {
    button.addEventListener("click", () => showSection(button.dataset.healthTarget));
  });
}

function renderAgentLog() {
  const systems = ["All", ...new Set(logEvents.map((event) => event.system))];
  logControls.innerHTML = `
    <div class="filter-row" role="group" aria-label="Agent log filters">
      ${systems.map((system) => `<button class="filter ${system === currentLogFilter ? "is-active" : ""}" type="button" data-log-filter="${system}">${system}</button>`).join("")}
    </div>
    <label class="search-wrap">
      <span>Search log</span>
      <input id="logSearch" type="search" placeholder="Agent, action, customer, system, approval state" />
    </label>
  `;

  const renderList = () => {
    const query = document.querySelector("#logSearch").value.trim().toLowerCase();
    const filtered = logEvents.filter((event) => {
      const matchesFilter = currentLogFilter === "All" || event.system === currentLogFilter;
      const haystack = `${event.time} ${event.agent} ${event.human} ${event.system} ${event.type} ${event.status} ${event.risk} ${event.title} ${event.summary}`.toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });
    agentLogList.innerHTML = filtered
      .map(
        (event) => `
        <button class="log-event ${event === selectedLogEvent ? "is-active" : ""}" type="button" data-log-index="${logEvents.indexOf(event)}">
          <span>${event.time}</span>
          <strong>${event.title}</strong>
          <small>${event.agent} · ${event.system} · ${event.status}</small>
          <em class="risk ${event.risk.toLowerCase()}">${event.risk}</em>
        </button>
      `,
      )
      .join("") || `<article class="queue-empty">No live audit events yet.</article>`;
    agentLogList.querySelectorAll("[data-log-index]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedLogEvent = logEvents[Number(button.dataset.logIndex)];
        renderList();
        renderLogDetail();
      });
    });
  };

  logControls.querySelectorAll("[data-log-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentLogFilter = button.dataset.logFilter;
      renderAgentLog();
    });
  });
  logControls.querySelector("#logSearch").addEventListener("input", renderList);
  renderList();
  renderLogDetail();
}

function renderLogDetail() {
  const event = selectedLogEvent;
  if (!event) {
    agentLogDetail.innerHTML = `
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Audit receipt</p>
          <h3>No live events yet</h3>
        </div>
      </div>
      <p>When the console records real agent actions, approval decisions, or connector updates, receipts will appear here.</p>
    `;
    return;
  }
  agentLogDetail.innerHTML = `
    <div class="section-heading compact">
      <div>
        <p class="eyebrow">Audit receipt</p>
        <h3>${event.agent}</h3>
      </div>
      <span class="risk ${event.risk.toLowerCase()}">${event.risk}</span>
    </div>
    <h4>${event.title}</h4>
    <p>${event.summary}</p>
    <div class="detail-list">
      <div><span>Time</span><strong>${event.time}</strong></div>
      <div><span>Human owner</span><strong>${event.human}</strong></div>
      <div><span>System</span><strong>${event.system}</strong></div>
      <div><span>Action type</span><strong>${event.type}</strong></div>
      <div><span>Status</span><strong>${event.status}</strong></div>
      <div><span>Source</span><strong>${event.source}</strong></div>
      <div><span>Receipt</span><strong>${event.receipt}</strong></div>
    </div>
    <div class="approval-actions">
      <button class="primary-button" type="button">Open related task</button>
      <button class="secondary-light-button" type="button">Send to training</button>
      <button class="secondary-light-button" type="button">Export receipt</button>
    </div>
  `;
}

function renderApprovals() {
  if (!approvalItems.length) {
    approvalList.innerHTML = `
      <section class="approval-workbench">
        <div class="approval-empty">
          <p class="eyebrow">Review queue</p>
          <h3>All clear</h3>
          <p>No approval packets are waiting right now. New customer-facing drafts, public copy, finance summaries, and training changes will land here for review.</p>
          <button class="primary-button" type="button" data-empty-target="workQueue">Check Work Queue</button>
        </div>
      </section>
    `;
    approvalList.querySelector("[data-empty-target]")?.addEventListener("click", () => showSection("workQueue"));
    return;
  }

  if (!approvalItems.includes(selectedApproval)) selectedApproval = approvalItems[0];

  const counts = approvalItems.reduce((acc, item) => {
    acc[item.risk] = (acc[item.risk] || 0) + 1;
    return acc;
  }, {});

  approvalList.innerHTML = `
    <div class="approval-workbench">
      <section class="approval-summary">
        <article><span>Total waiting</span><strong>${approvalItems.length}</strong><small>Across agents</small></article>
        <article><span>High risk</span><strong>${counts.High || 0}</strong><small>Needs careful review</small></article>
        <article><span>Medium risk</span><strong>${counts.Medium || 0}</strong><small>Customer-safe gate</small></article>
        <article><span>Low risk</span><strong>${counts.Low || 0}</strong><small>Training/source review</small></article>
      </section>
      <div class="approval-workbench-grid">
        <section class="approval-queue">
          ${approvalItems
            .map(
              (item, index) => `
              <button class="approval-ticket ${item === selectedApproval ? "is-active" : ""}" type="button" data-approval-index="${index}">
                <span>${item.type}</span>
                <strong>${item.title}</strong>
                <small>${item.owner} · ${item.status}</small>
                <em class="risk ${item.risk.toLowerCase()}">${item.risk}</em>
              </button>
            `,
            )
            .join("")}
        </section>
        <aside class="approval-detail" id="approvalDetail"></aside>
      </div>
    </div>
  `;

  approvalList.querySelectorAll("[data-approval-index]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedApproval = approvalItems[Number(button.dataset.approvalIndex)];
      renderApprovals();
    });
  });

  renderApprovalDetail();
}

function renderApprovalDetail() {
  const detail = document.querySelector("#approvalDetail");
  const item = selectedApproval;
  detail.innerHTML = `
    <div class="section-heading compact">
      <div>
        <p class="eyebrow">Review packet</p>
        <h3>${item.owner}</h3>
      </div>
      <span class="risk ${item.risk.toLowerCase()}">${item.risk}</span>
    </div>
    <h4>${item.title}</h4>
    <p>${item.summary}</p>
    <div class="review-compare">
      <article>
        <span>Before</span>
        <p>${item.before}</p>
      </article>
      <article>
        <span>After</span>
        <p>${item.after}</p>
      </article>
    </div>
    <div class="detail-list">
      <div><span>Source</span><strong>${item.source}</strong></div>
      <div><span>Approval rule</span><strong>${item.approvalRule}</strong></div>
      <div><span>Status</span><strong>${item.status}</strong></div>
    </div>
    <div class="approval-actions">
      <button class="primary-button" type="button" data-approval-action="Approved">Approve</button>
      <button class="secondary-light-button" type="button" data-approval-action="Revision requested">Request revision</button>
      <button class="secondary-light-button" type="button" data-approval-action="Sent to training">Send to training</button>
      <button class="secondary-light-button" type="button" data-approval-log="${item.owner}">View audit log</button>
    </div>
  `;

  detail.querySelectorAll("[data-approval-action]").forEach((button) => {
    button.addEventListener("click", () => resolveApproval(item, button.dataset.approvalAction));
  });
  detail.querySelector("[data-approval-log]")?.addEventListener("click", () => {
    currentLogFilter = item.source || "All";
    showSection("agentLog");
  });
}

function resolveApproval(item, decision) {
  const index = approvalItems.indexOf(item);
  if (index === -1) return;

  const auditRecord = {
    time: "Just now",
    agent: item.owner,
    human: "Karmel",
    system: "Approvals",
    type: item.type,
    status: decision,
    risk: item.risk,
    title: item.title,
    summary: `${decision}: ${item.summary}`,
    source: item.source,
    receipt: decision === "Approved" ? "Review packet cleared for next approved action." : "Review packet cleared and routed for follow-up.",
  };
  logEvents.unshift(auditRecord);
  persistToLocalApi("/api/audit-log", {
    type: "approval_decision",
    agent: item.owner,
    title: item.title,
    decision,
    source: "Approvals",
    payload: item,
  });

  approvalItems.splice(index, 1);
  selectedApproval = approvalItems[0];
  renderApprovals();
  renderAgentLog();
  renderAgentHealth();
}

function renderTraining() {
  trainingBoard.innerHTML = Object.entries(training)
    .map(
      ([stage, cards]) => `
      <section class="training-column">
        <h4>${stage}</h4>
        ${cards
          .map(
            (card) => `
          <article class="training-card">
            <small>${stage}</small>
            <p>${card}</p>
          </article>
        `,
          )
          .join("")}
      </section>
    `,
    )
    .join("");
}

function realDataSummary() {
  const generated = realData.generatedAt ? new Date(realData.generatedAt).toLocaleString() : "Not generated yet";
  const avatarCount = realData.avatarInventory?.count ?? "Unknown";
  const vaultStatus = realData.knowledgeVault?.status || "Drive URL linked";
  const vaultCount = realData.knowledgeVault?.count ?? 0;
  const orgCount = realData.orgCharts?.count ?? "Unknown";
  return `
    <section class="real-data-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Real data layer</p>
          <h3>Read-only source status</h3>
        </div>
        <span class="pill">${vaultStatus}</span>
      </div>
      <div class="real-data-grid">
        <article><span>Generated</span><strong>${generated}</strong></article>
        <article><span>Avatar files</span><strong>${avatarCount}</strong></article>
        <article><span>Vault files indexed</span><strong>${vaultCount}</strong></article>
        <article><span>Org chart files</span><strong>${orgCount}</strong></article>
      </div>
      <p class="real-data-note">The console is connected to the local synced Obsidian/Google Drive vault in read-only mode. Run <code>node scripts/build-real-data.mjs</code> whenever you want to refresh indexed Knowledge Vault files.</p>
    </section>
  `;
}

function renderKnowledgeVault() {
  knowledgeVaultPanel.innerHTML = `
    <div class="vault-hero-panel">
      <div>
        <p class="eyebrow">Training Vault</p>
        <h3>Connect Obsidian for humans and Google Drive for agent-readable knowledge.</h3>
        <p>The ideal setup is one knowledge system with two doors: Obsidian for editing and thinking, Google Drive sync for indexing, permissions, and source-backed agent training.</p>
      </div>
      <div class="vault-owner">
        <span class="pill">Owner: Libby</span>
        <strong>Knowledge Vault Steward</strong>
        <small>Sources, SOPs, training examples, correction loops</small>
      </div>
    </div>

    ${realDataSummary()}

    <div class="vault-source-grid">
      ${vaultSources
        .map(
          (source) => `
          <article class="vault-source-card">
            <p class="eyebrow">${source.type}</p>
            <h4>${source.name}</h4>
            <span class="pill">${source.status}</span>
            <p>${source.detail}</p>
            <code>${source.link}</code>
            <div class="approval-actions">
              <button class="primary-button" type="button" data-vault-link="${source.link}">Open</button>
              <button class="secondary-light-button" type="button">Edit path</button>
            </div>
          </article>
        `,
        )
        .join("")}
    </div>

    <section class="vault-map-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Vault map</p>
          <h3>What agents should learn from</h3>
        </div>
        <button class="text-button" type="button">Sync changed notes</button>
      </div>
      <div class="vault-collection-grid">
        ${vaultCollections
          .map(
            ([title, detail]) => `
            <article>
              <strong>${title}</strong>
              <p>${detail}</p>
              <small>Read-only until approved</small>
            </article>
          `,
          )
          .join("")}
      </div>
    </section>

    <section class="vault-map-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Recommended architecture</p>
          <h3>Human edits → Libby reviews → agents learn</h3>
        </div>
      </div>
      <div class="vault-flow">
        <article><span>1</span><strong>Write in Obsidian</strong><p>Humans create or edit Markdown notes in the BLP vault.</p></article>
        <article><span>2</span><strong>Sync through Drive</strong><p>The synced folder gives the console stable files and source links.</p></article>
        <article><span>3</span><strong>Review with Libby</strong><p>New notes enter a review queue before agent training.</p></article>
        <article><span>4</span><strong>Train agents</strong><p>Approved notes become source-backed guidance in each agent dashboard.</p></article>
      </div>
    </section>
  `;
  knowledgeVaultPanel.querySelectorAll("[data-vault-link]").forEach((button) => {
    button.addEventListener("click", () => {
      window.open(button.dataset.vaultLink, "_blank", "noopener,noreferrer");
    });
  });
}

function renderActivationPipeline() {
  const stages = [
    ["Role", "Define job, supervisor, approval boundaries"],
    ["Channels", "Create email, Discord, Telegram"],
    ["Knowledge", "Assign SOPs, files, examples, and sources"],
    ["Test", "Run sample tasks and correction loop"],
    ["Launch", "Human approval, cron setup, dashboard live"],
  ];
  const onDeck = agents.filter((agent) => agent.status === "On Deck").slice(0, 10);
  activationPipeline.innerHTML = `
    <section class="pipeline-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">On-deck activation</p>
          <h3>From avatar to working agent</h3>
        </div>
        <button class="text-button" type="button">Create activation task</button>
      </div>
      <div class="pipeline-steps">
        ${stages.map(([title, detail], index) => `<article><span>${index + 1}</span><strong>${title}</strong><small>${detail}</small></article>`).join("")}
      </div>
      <div class="activation-strip">
        ${onDeck.map((agent, index) => `<button type="button" data-activate-agent="${agent.name}"><img src="${agentImage(agent)}" alt="${agent.name} avatar" /><strong>${agent.name}</strong><small>${stages[index % stages.length][0]}</small></button>`).join("")}
      </div>
    </section>
  `;
  activationPipeline.querySelectorAll("[data-activate-agent]").forEach((button) => {
    button.addEventListener("click", () => openDrawer(getAgent(button.dataset.activateAgent)));
  });
}

function routeRequest() {
  const text = requestText.value.trim();
  const context = getRequestContext();
  const lowered = `${text} ${context.type} ${context.audience}`.toLowerCase();
  const audienceRoute = routeForAudience(context.audience);
  const match = audienceRoute || routeKeywords.find((route) => route.terms.some((term) => lowered.includes(term))) || routeKeywords[0];
  const lead = getAgent(match.agent);
  const team = match.team.map(getAgent);
  const title = text ? text.split(/[.?!]/)[0].slice(0, 72) : `${context.type} request`;
  const risk = riskForRequest(context);
  const nextStep = nextStepForRequest(context, lead);
  routerResult.classList.remove("is-hidden");
  routerResult.innerHTML = `
    <div>
      <p class="eyebrow">Recommended routing</p>
      <h3>${lead.name} should lead this.</h3>
      <p>${lead.focus}</p>
    </div>
    <div class="routing-team">
      ${team.map((agent) => `<button type="button" data-route-agent="${agent.name}"><img src="${agentImage(agent)}" alt="${agent.name} avatar" /><strong>${agent.name}</strong><small>${agent.role}</small></button>`).join("")}
    </div>
    <article class="draft-task">
      <span class="pill">${context.type} · ${context.approval} · ${risk} risk</span>
      <h4>${title}</h4>
      <p>${text || "Add request details, then route to create a reviewable task card."}</p>
      <div class="request-preview-grid">
        <div><span>Needed by</span><strong>${context.due}</strong></div>
        <div><span>Source</span><strong>${context.source || "Not supplied yet"}</strong></div>
        <div><span>Next step</span><strong>${nextStep}</strong></div>
      </div>
      <div class="approval-actions">
        <button type="button" class="primary-button" id="createDemoTask">Add to Work Queue</button>
        <button type="button" class="secondary-light-button" data-open-dashboard="${lead.name}">Open ${lead.name}'s Dashboard</button>
      </div>
    </article>
  `;
  routerResult.querySelectorAll("[data-route-agent]").forEach((button) => {
    button.addEventListener("click", () => openDrawer(getAgent(button.dataset.routeAgent)));
  });
  routerResult.querySelector("[data-open-dashboard]").addEventListener("click", () => {
    setSelectedAgent(lead);
    showSection("agentDesk");
  });
  routerResult.querySelector("#createDemoTask").addEventListener("click", () => {
    const taskRecord = {
      title,
      owner: lead.name,
      type: context.type,
      status: context.approval.includes("approval") ? "Needs approval" : "Queued",
      summary: text || "Demo task created from the request router.",
    };
    const queueRecord = {
      title,
      status: context.approval.includes("approval") ? "Needs Approval" : "Intake",
      agent: lead.name,
      department: lead.department,
      type: context.type,
      approval: context.approval,
      risk,
      due: context.due === "Today" ? "New" : context.due,
      source: context.source || "Request Router",
      summary: text || "Demo task created from the request router.",
      nextStep,
    };
    const logRecord = {
      time: "Just now",
      agent: lead.name,
      human: "BLP team",
      system: "Agent Console",
      type: "Work request",
      status: context.approval.includes("approval") ? "Needs approval" : "Queued",
      risk,
      title,
      summary: text || "New request created from the guided router.",
      source: context.source || "Request Router",
      receipt: `Routed to ${lead.name}. ${nextStep}`,
    };
    tasks.unshift({
      ...taskRecord,
    });
    queueItems.unshift({
      ...queueRecord,
    });
    logEvents.unshift({
      ...logRecord,
    });
    selectedLogEvent = logEvents[0];
    renderTasks();
    renderWorkQueue();
    renderAgentLog();
    showSection("workQueue");
    persistToLocalApi("/api/work-queue", queueRecord);
    persistToLocalApi("/api/audit-log", logRecord);
  });
}

function getRequestContext() {
  return {
    type: requestType.value,
    audience: requestAudience.value,
    approval: approvalMode.value,
    due: requestDue.value,
    source: requestSource.value.trim(),
  };
}

function routeForAudience(audience) {
  const routes = {
    Leadership: { agent: "Lindsay", team: ["Lindsay", "Walter", "Cody"] },
    Sales: { agent: "Sally", team: ["Sally", "Walter", "Melody"] },
    "Service / Fieldwork": { agent: "Ivory", team: ["Ivory", "Melody", "Chris"] },
    Shop: { agent: "Chris", team: ["Chris", "Ivory", "Walter"] },
    Marketing: { agent: "Marcus", team: ["Marcus", "Libby", "Cody"] },
    "Finance / Admin": { agent: "Monte", team: ["Monte", "Lindsay", "Dawn"] },
    "Technical / Knowledge": { agent: "Libby", team: ["Libby", "Cody", "Lindsay"] },
  };
  return routes[audience] || null;
}

function riskForRequest(context) {
  const text = `${context.type} ${context.approval} ${requestText.value}`.toLowerCase();
  if (text.includes("finance") || text.includes("refund") || text.includes("price") || text.includes("website") || text.includes("publish")) return "High";
  if (text.includes("customer") || text.includes("approval") || text.includes("send") || text.includes("source required")) return "Medium";
  return "Low";
}

function nextStepForRequest(context, lead) {
  if (context.approval.includes("approval")) return `${lead.name} drafts; a human reviews before anything leaves the console.`;
  if (context.approval.includes("Source")) return `${lead.name} gathers source links before giving the answer.`;
  if (context.approval.includes("Draft")) return `${lead.name} prepares a draft only; no external action.`;
  return `${lead.name} can prepare internal output and log a receipt.`;
}

function applyRequestTemplate(key) {
  const template = requestTemplates[key];
  if (!template) return;
  requestType.value = template.type;
  approvalMode.value = template.approval;
  requestAudience.value = template.audience;
  requestDue.value = template.due;
  requestText.value = template.text;
  requestSource.value = template.source;
  routerResult.classList.add("is-hidden");
  requestText.focus();
}

function openNewRequest() {
  closeCommandCenter();
  closeDrawer();
  showSection("command");
  requestText.focus();
  document.querySelector(".request-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderFeedbackLog() {
  feedbackLog.innerHTML = feedbackItems.length
    ? feedbackItems
        .map((item) => `<article><strong>${item.type}</strong><span>${item.screen}</span><p>${item.notes}</p></article>`)
        .join("")
    : "<p>No notes captured yet.</p>";
}

function openFeedback() {
  const active = document.querySelector(".workspace:not(.is-hidden)")?.id || "command";
  const label = { command: "Command", workQueue: "Work Queue", roster: "Roster", agentDesk: "Agent Desk", agentHealth: "Agent Health", integrations: "Integrations", agentLog: "Agent Log", org: "Org", approvals: "Approvals", training: "Training", knowledgeVault: "Knowledge Vault" }[active];
  feedbackScreen.value = label || "Command";
  renderFeedbackLog();
  feedbackDialog.showModal();
}

function renderIntegrations() {
  integrationBoard.innerHTML = integrations
    .map(
      (item) => `
      <article class="integration-card">
        <header>
          <div>
            <p class="eyebrow">${item.name}</p>
            <h4>${item.status}</h4>
          </div>
          <span class="risk ${item.risk.toLowerCase()}">${item.risk}</span>
        </header>
        <p>${item.purpose}</p>
        <div class="integration-meta">
          <div><span>Owner</span><strong>${item.owner}</strong></div>
          <div><span>First live step</span><strong>${item.firstStep}</strong></div>
        </div>
        <button class="secondary-light-button" type="button" data-setup="${item.name}">Open setup checklist</button>
      </article>
    `,
    )
    .join("");

  integrationBoard.querySelectorAll("[data-setup]").forEach((button) => {
    button.addEventListener("click", () => renderSetupDetail(button.dataset.setup));
  });

  renderSetupDetail("Agent Email");
  renderMarketingHermesIntake();
  renderOpenClawIntake();
  renderAgentBackupSources();
  renderPermissionsMatrix();
  renderNeededPanel();

  launchRoadmap.innerHTML = `
    <section class="roadmap-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Private beta roadmap</p>
          <h3>How this becomes the live console</h3>
        </div>
      </div>
      <div class="roadmap-track">
        ${launchPhases
          .map(
            ([title, detail, timing], index) => `
            <article>
              <span>${index + 1}</span>
              <strong>${title}</strong>
              <p>${detail}</p>
              <small>${timing}</small>
            </article>
          `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function getMarketingHermesMissingFields(agent) {
  const missing = [];
  if (!marketingHermesConnection?.gatewayMissing?.length) return missing;
  if (!agent.webhookRoute) missing.push("webhook route");
  if (!agent.secretEnvVar) missing.push("secret env var name");
  if (!agent.responseDestination) missing.push("response destination");
  return missing;
}

function renderMarketingHermesIntake() {
  if (!openclawIntake || !marketingHermesConnection) return;

  const rows = [...(marketingHermesConnection.agents || [])].sort((a, b) => a.name.localeCompare(b.name));
  const readyCount = rows.filter((agent) => getMarketingHermesMissingFields(agent).length === 0).length;
  const waitingCount = rows.length - readyCount;

  openclawIntake.innerHTML = `
    <section class="openclaw-panel marketing-hermes-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Marketing Hermes bridge</p>
          <h3>Remote Hermes routes needed for the marketing agent team</h3>
        </div>
        <div class="intake-summary">
          <span><strong>${readyCount}</strong> ready</span>
          <span><strong>${waitingCount}</strong> waiting</span>
        </div>
      </div>
      <p class="intake-note">These agents run on one Hermes installation on another laptop. To connect them live, the app needs a secure HTTPS bridge to that laptop's Hermes webhook gateway, plus a signed webhook route for each agent. Start with Marcus, Desie, and Ed, then add the rest of the marketing team in batches.</p>
      <div class="gateway-checklist">
        ${(marketingHermesConnection.gatewayMissing || []).map((field) => `<span>${field}</span>`).join("")}
      </div>
      <div class="openclaw-table" role="table" aria-label="Marketing Hermes connection intake">
        <div class="openclaw-head" role="row">
          <span>Agent</span>
          <span>Module target</span>
          <span>Missing before live test</span>
          <span>Contact</span>
        </div>
        ${rows
          .map((agent) => {
            const missing = getMarketingHermesMissingFields(agent);
            return `
              <article class="openclaw-row ${missing.length ? "" : "is-ready"}" role="row">
                <div>
                  <strong>${agent.name}</strong>
                  <span>${agent.role}</span>
                </div>
                <div>
                  <span class="connection-pill ${missing.length ? "waiting" : "ready"}">${agent.moduleTargets}</span>
                  <small>${agent.secretEnvVar}</small>
                </div>
                <div class="missing-list">
                  ${
                    missing.length
                      ? missing.map((field) => `<span>${field}</span>`).join("")
                      : "<span>Ready for signed internal test task</span>"
                  }
                </div>
                <div>
                  <a href="mailto:${agent.email}">${agent.email}</a>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function getOpenClawMissingFields(agent) {
  const needsFollowUp = (value) => {
    if (!value) return true;
    const normalized = String(value).trim().toLowerCase();
    return normalized === "pending" || normalized === "not available yet" || normalized.startsWith("not available yet");
  };
  const missing = [];
  if (!agent.openclaw_id || agent.openclaw_id.startsWith("pending-")) missing.push("OpenClaw agent ID");
  if (needsFollowUp(agent.task_endpoint)) missing.push("task endpoint or CLI command");
  if (needsFollowUp(agent.status_endpoint)) missing.push("status endpoint");
  if (needsFollowUp(agent.cron_source)) missing.push("cron job source");
  if (needsFollowUp(agent.activity_source)) missing.push("activity/log source");
  if (needsFollowUp(agent.auth_method)) missing.push("auth method");
  return missing;
}

function renderOpenClawIntake() {
  if (!openclawIntake) return;

  const rows = [...openclawMapping].sort((a, b) => a.name.localeCompare(b.name));
  const readyCount = rows.filter((agent) => getOpenClawMissingFields(agent).length === 0).length;
  const waitingCount = rows.length - readyCount;

  openclawIntake.insertAdjacentHTML("beforeend", `
    <section class="openclaw-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">OpenClaw intake tracker</p>
          <h3>Agent replies Lindsay is collecting now</h3>
        </div>
        <div class="intake-summary">
          <span><strong>${readyCount}</strong> ready</span>
          <span><strong>${waitingCount}</strong> waiting</span>
        </div>
      </div>
      <p class="intake-note">Source of truth: Lindsay's <a href="https://docs.google.com/spreadsheets/d/1uB5vYpNwld1HbuGuhG_qNRdjS2Czg0mwOeut1eSIlAI/edit" target="_blank" rel="noreferrer">OpenClaw connection sheet</a>. When an agent replies with endpoint, CLI, cron, activity, and auth details, update <strong>data/openclaw-mapping.json</strong>, regenerate the mapping file, then run the adapter.</p>
      <div class="openclaw-table" role="table" aria-label="OpenClaw connection intake">
        <div class="openclaw-head" role="row">
          <span>Agent</span>
          <span>Status</span>
          <span>Missing before live test</span>
          <span>Contact</span>
        </div>
        ${rows
          .map((agent) => {
            const missing = getOpenClawMissingFields(agent);
            const status = missing.length ? "Waiting for reply" : "Ready to test";
            return `
              <article class="openclaw-row ${missing.length ? "" : "is-ready"}" role="row">
                <div>
                  <strong>${agent.name}</strong>
                  <span>${agent.role}</span>
                </div>
                <div>
                  <span class="connection-pill ${missing.length ? "waiting" : "ready"}">${status}</span>
                  <small>${agent.connection_status}</small>
                </div>
                <div class="missing-list">
                  ${
                    missing.length
                      ? missing.map((field) => `<span>${field}</span>`).join("")
                      : "<span>All required connection details captured</span>"
                  }
                </div>
                <div>
                  <a href="mailto:${agent.email}">${agent.email}</a>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `);
}

function renderAgentBackupSources() {
  if (!openclawIntake || !agentBackupSources.length) return;

  const existingPanel = openclawIntake.querySelector(".backup-source-panel");
  if (existingPanel) existingPanel.remove();

  const rows = [...agentBackupSources].sort((a, b) => a.name.localeCompare(b.name));
  const connectedCount = rows.filter((source) => source.connectionStatus !== "needs-backup-folder").length;
  const statusFoundCount = rows.filter((source) => source.statusFileMeta?.exists).length;

  openclawIntake.insertAdjacentHTML(
    "beforeend",
    `
      <section class="openclaw-panel backup-source-panel">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Nightly backup feed</p>
            <h3>Google Drive folders feeding agent data</h3>
          </div>
          <div class="intake-summary">
            <span><strong>${connectedCount}</strong> folders known</span>
            <span><strong>${statusFoundCount}</strong> status files found</span>
          </div>
        </div>
        <p class="intake-note">Lindsay can add each agent's shared Google Drive backup folder to the connection spreadsheet. Once synced locally, this page can read STATUS.md, cron inventory, activity summaries, and file lists without live OpenClaw access.</p>
        <div class="openclaw-table backup-table" role="table" aria-label="Agent backup source tracker">
          <div class="openclaw-head" role="row">
            <span>Agent</span>
            <span>Backup folder</span>
            <span>Status source</span>
            <span>Next setup step</span>
          </div>
          ${rows
            .map((source) => {
              const statusFound = source.statusFileMeta?.exists;
              const folderKnown = Boolean(source.localSyncPath || source.backupFolderUrl);
              const folderLabel = folderKnown ? "Folder connected" : "Need Drive folder";
              const statusLabel = statusFound ? `STATUS.md found ${formatDate(source.statusFileMeta.modifiedAt)}` : "Waiting for STATUS.md";
              const nextStep = folderKnown
                ? statusFound
                  ? "Parse status into Agent Health"
                  : "Confirm backup includes STATUS.md"
                : "Add backup folder URL or local sync path";
              return `
                <article class="openclaw-row ${folderKnown ? "is-ready" : ""}" role="row">
                  <div>
                    <strong>${source.name}</strong>
                    <span>${source.system}</span>
                  </div>
                  <div>
                    <span class="connection-pill ${folderKnown ? "ready" : "waiting"}">${folderLabel}</span>
                    <small>${source.syncCadence}</small>
                  </div>
                  <div>
                    <strong>${statusLabel}</strong>
                    <span>${source.statusPath || "STATUS.md path needed"}</span>
                  </div>
                  <div>
                    <span>${nextStep}</span>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `,
  );
}

function renderSetupDetail(name) {
  const integration = integrations.find((item) => item.name === name) || integrations[0];
  const steps = setupSteps[name] || [];
  setupDetail.classList.remove("is-hidden");
  setupDetail.innerHTML = `
    <section class="setup-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Setup checklist</p>
          <h3>${integration.name}</h3>
        </div>
        <span class="risk ${integration.risk.toLowerCase()}">${integration.risk} risk</span>
      </div>
      <p>${integration.purpose}</p>
      <div class="setup-steps">
        ${steps
          .map(
            (step, index) => `
            <label>
              <input type="checkbox" ${index === 0 ? "checked" : ""} />
              <span>${step}</span>
            </label>
          `,
          )
          .join("")}
      </div>
      <div class="approval-actions">
        <button class="primary-button" type="button">Create beta task</button>
        <button class="secondary-light-button" type="button">Send to Cody</button>
        <button class="secondary-light-button" type="button">Ask Brigham to approve</button>
      </div>
    </section>
  `;
}

function renderNeededPanel() {
  neededPanel.innerHTML = `
    <section class="needed-card">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Morning handoff</p>
          <h3>What I need from the team to finish the private beta</h3>
        </div>
      </div>
      <div class="needed-grid">
        ${neededFromTeam
          .map(
            ([title, detail]) => `
            <article>
              <strong>${title}</strong>
              <p>${detail}</p>
            </article>
          `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPermissionsMatrix() {
  permissionsMatrix.innerHTML = `
    <section class="matrix-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Permission design</p>
          <h3>Default connector boundaries</h3>
        </div>
      </div>
      <div class="matrix-table" role="table" aria-label="Connector permissions matrix">
        <div class="matrix-head" role="row">
          <span>Connector</span>
          <span>Read</span>
          <span>Draft</span>
          <span>Send / Act</span>
          <span>Never without approval</span>
        </div>
        ${permissionRows
          .map(
            (row) => `
            <div class="matrix-row" role="row">
              ${row.map((cell) => `<span>${cell}</span>`).join("")}
            </div>
          `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function showSection(sectionId) {
  document.querySelectorAll(".workspace").forEach((section) => {
    section.classList.toggle("is-hidden", section.id !== sectionId);
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === sectionId);
  });
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

drawerScrim.addEventListener("click", () => {
  closeDrawer();
  closeCommandCenter();
});
commandMenuButton.addEventListener("click", openCommandCenter);
routeButton.addEventListener("click", routeRequest);
newRequestButton.addEventListener("click", openNewRequest);
document.querySelectorAll("[data-template]").forEach((button) => {
  button.addEventListener("click", () => applyRequestTemplate(button.dataset.template));
});
trainingVaultButton.addEventListener("click", () => showSection("knowledgeVault"));
shopWorkQueueButton.addEventListener("click", () => showSection("workQueue"));
feedbackLauncher.addEventListener("click", openFeedback);
saveAgentAction.addEventListener("click", saveCurrentAgentAction);
saveFeedback.addEventListener("click", (event) => {
  event.preventDefault();
  const notes = feedbackNotes.value.trim();
  if (!notes) return;
  feedbackItems.unshift({
    screen: feedbackScreen.value,
    type: feedbackType.value,
    notes,
  });
  feedbackNotes.value = "";
  renderFeedbackLog();
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((filter) => filter.classList.remove("is-active"));
    button.classList.add("is-active");
    renderAgents();
  });
});

agentSearch.addEventListener("input", renderAgents);

renderDetail(selectedAgent);
renderDashboard(selectedAgent);
renderTasks();
renderWorkQueue();
renderAgents();
renderDepartments();
renderAgentHealth();
renderAgentLog();
renderApprovals();
renderActivationPipeline();
renderKnowledgeVault();
renderIntegrations();
renderTraining();
syncNotionWork();
