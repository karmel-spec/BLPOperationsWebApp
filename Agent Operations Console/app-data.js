// BLP Agent Console data
// Edit this file to update agents, org structure, work queue, approvals, health, logs, integrations, and Knowledge Vault metadata.
(() => {
const avatarBase = "assets/avatars/";

const externalAgents = Array.isArray(window.BLP_AGENTS_DATA) ? window.BLP_AGENTS_DATA : null;
const liveOperational = window.BLP_LIVE_OPERATIONAL_DATA || {};
const liveArray = (key, fallback) => (Array.isArray(liveOperational[key]) ? liveOperational[key] : fallback);

const activeNames = new Set([
  "Lindsay",
  "Cody",
  "Walter",
  "Dawn",
  "Marcus",
  "Monte",
  "Sally",
  "Libby",
  "Ivory",
  "Melody",
  "Chris",
]);

const defaultAgents = [
  ["Lindsay", "Chief Strategy Officer", "Leadership", "Hermes", "lindsay (1).png"],
  ["Walter", "Chief of Staff", "Leadership", "OpenClaw", "walter (1).png"],
  ["Ila", "Chief Technical Agent", "Technical", "On Deck", "ila (2).png"],
  ["Cody", "Coder / Developer", "Technical", "Hermes", "cody (1).png"],
  ["Libby", "Librarian / Knowledge Vault", "Technical", "OpenClaw", "libby (1).png"],
  ["Chris", "Shop Manager / Operations Lead", "Shop", "OpenClaw", "chris (1).png"],
  ["Howie", "Shop Technical", "Shop", "On Deck", "howie (1).png"],
  ["Tray", "Shop Technical", "Shop", "On Deck", "tray (2).png"],
  ["Arnold", "Chief Sales Agent", "Sales", "On Deck", "arnold (2).png"],
  ["Sally", "Sales Assistant", "Sales", "OpenClaw", "sally.png"],
  ["Reese", "Recitals & Teacher Relations", "Sales", "On Deck", "reese (1).png"],
  ["Tori", "Acquisitions & Valuation", "Sales", "On Deck", "avatar.png"],
  ["Melody", "Head of Admin & Customer Service", "Admin & Customer Service", "OpenClaw", "melody (1).png"],
  ["Clara", "Asst. to Brigham", "Admin & Customer Service", "On Deck", "clara (2).png"],
  ["Dawn", "Press Secretary / Lindsay's Asst.", "Admin & Customer Service", "OpenClaw", "dawn (1).png"],
  ["Eunice", "Uniforms", "Admin & Customer Service", "On Deck", "eunice.png"],
  ["Warren", "Fieldwork Lead / Warranties", "Fieldwork", "On Deck", "warren (1).png"],
  ["Moe", "Piano Moving", "Fieldwork", "On Deck", "moe (1).png"],
  ["Ivory", "Piano Tuning", "Fieldwork", "OpenClaw", "ivory (1).png"],
  ["Carla", "Chief Operations Agent / Fleet", "Operations", "On Deck", "carla.png"],
  ["Shirley", "Insurance", "Operations", "On Deck", "shirley (1).png"],
  ["Ricardo", "Facilities", "Operations", "On Deck", "ricardo.png"],
  ["Hugh", "Human Resources", "Operations", "On Deck", "hugh (1).png"],
  ["Marcus", "Head of Marketing", "Marketing", "OpenClaw", "marcus (1).png"],
  ["Desie", "Design", "Marketing", "On Deck", "desie (3).png"],
  ["Brandy", "Branding", "Marketing", "On Deck", "brandy.png"],
  ["Addie", "Advertising", "Marketing", "On Deck", "addie.png"],
  ["Lee", "Lead Gen", "Marketing", "On Deck", "lee (2).png"],
  ["Sharie", "Social Media", "Marketing", "On Deck", "sharie (2).png"],
  ["Rajeesh", "Website", "Marketing", "On Deck", "rajeesh (1).png"],
  ["Yolanda", "YouTube", "Marketing", "On Deck", "yolanda (2).png"],
  ["Ed", "Video Editor", "Marketing", "On Deck", "ed (1).png"],
  ["Collin", "Competitor Research", "Marketing", "On Deck", "collin (1).png"],
  ["Monte", "CFO", "Accounting & Finance", "OpenClaw", "monte (1).png"],
  ["Connie", "Controller", "Accounting & Finance", "On Deck", "connie (1).png"],
  ["Regis", "Bookkeeper", "Accounting & Finance", "On Deck", "regis.png"],
  ["Penny", "Payroll", "Accounting & Finance", "On Deck", "penny (1).png"],
  ["Anne", "Financial Analyst", "Accounting & Finance", "On Deck", "anne (1).png"],
  ["Sam", "Tax", "Accounting & Finance", "On Deck", "sam (1).png"],
  ["Collette", "Collections", "Accounting & Finance", "On Deck", "collette (1).png"],
  ["Morgan", "Legal Counsel", "Accounting & Finance", "On Deck", "avatar.png"],
].map(([name, role, department, system, avatar]) => ({
  name,
  role,
  department,
  system,
  avatar: avatarBase + avatar,
  status: activeNames.has(name) ? "Active" : "On Deck",
  email: `${name.toLowerCase()}@brighamlarsonpianos.com`,
}));

const agents = (externalAgents || defaultAgents).map((agent) => ({
  ...agent,
  avatar: agent.avatar?.startsWith("assets/") ? agent.avatar : `${avatarBase}${agent.avatar || "avatar.png"}`,
  status: agent.status || (activeNames.has(agent.name) ? "Active" : "On Deck"),
  email: agent.email || `${agent.name.toLowerCase()}@brighamlarsonpianos.com`,
}));

const orgDepartmentMeta = {
  Technical: ["Code, knowledge systems, integrations, and agent tooling.", "Ila", "Cody", "Hermes / Drive / Cron"],
  Shop: ["Restoration operations, shop capacity, repair status, and technician coordination.", "Chris", "Howie", "OpenClaw / shop work orders"],
  Sales: ["Lead follow-up, showroom readiness, inventory support, recitals, and teacher relationships.", "Arnold", "Sally", "Email / inventory"],
  "Admin & Customer Service": ["Customer communication, scheduling, support, and founder-office assistance.", "Melody", "Clara", "Email / Discord"],
  Fieldwork: ["Tuning, moving, warranties, routes, and service visits.", "Warren", "Ivory", "Routes / Telegram"],
  Operations: ["Fleet, facilities, HR, insurance, uniforms, and operational readiness.", "Carla", "Carla", "Drive / ops boards"],
  Marketing: ["Website, SEO, advertising, social, video, lead gen, and brand voice.", "Marcus", "Rajeesh", "Shopify / YouTube / social"],
  "Accounting & Finance": ["Books, payroll, tax, collections, reporting, and finance-safe summaries.", "Monte", "Connie", "Finance dashboard"],
};

const departmentDefaults = {
  Leadership: {
    supervisor: "Brigham / Leadership Team",
    focus: "Prioritization, routing, executive summaries, and cross-team follow-through.",
    files: ["Agent operating charter", "Leadership weekly brief", "Decision log"],
    permissions: ["Read leadership briefs", "Draft internal plans", "Route agent tasks"],
    guardrails: ["No public commitments", "No policy changes", "No spending approvals"],
  },
  Technical: {
    supervisor: "Technical Lead",
    focus: "Code, knowledge systems, data structure, integrations, and agent tooling.",
    files: ["Console backlog", "Knowledge vault map", "Integration notes"],
    permissions: ["Read technical docs", "Draft code tasks", "Maintain knowledge records"],
    guardrails: ["No production deploy without approval", "No credential changes"],
  },
  Shop: {
    supervisor: "Shop Manager",
    focus: "Restoration operations, shop capacity, repair status, and technician coordination.",
    files: ["Restoration SOP", "Shop capacity board", "Before-after story notes"],
    permissions: ["Read shop work orders", "Draft status updates", "Summarize blockers"],
    guardrails: ["No final estimates", "No customer promises on completion dates"],
  },
  Sales: {
    supervisor: "Sales Manager",
    focus: "Lead follow-up, showroom readiness, inventory support, and teacher relationships.",
    files: ["Inventory descriptions", "Lead follow-up scripts", "Financing FAQ"],
    permissions: ["Read lead notes", "Draft sales replies", "Prepare inventory comparisons"],
    guardrails: ["No discount approvals", "No final customer send without review"],
  },
  "Admin & Customer Service": {
    supervisor: "Office Lead",
    focus: "Customer communication, scheduling support, service requests, and founder-office support.",
    files: ["Customer reply examples", "Scheduling SOP", "Service FAQ"],
    permissions: ["Read service requests", "Draft customer replies", "Prepare call notes"],
    guardrails: ["No appointment cancellation", "No sensitive customer updates without review"],
  },
  Fieldwork: {
    supervisor: "Fieldwork Lead",
    focus: "Tuning, moving, warranties, routes, and customer service visits.",
    files: ["Tuning policy", "Moving quote intake", "Warranty checklist"],
    permissions: ["Read route requests", "Draft trip summaries", "Flag overdue tunings"],
    guardrails: ["No route commitment without dispatcher approval"],
  },
  Operations: {
    supervisor: "Operations Lead",
    focus: "Fleet, facilities, HR, uniforms, and operational readiness.",
    files: ["Fleet checklist", "Facility punch list", "HR intake guide"],
    permissions: ["Read operations boards", "Draft internal tasks", "Flag risks"],
    guardrails: ["No HR decisions", "No vendor commitments"],
  },
  Marketing: {
    supervisor: "Marketing Lead",
    focus: "Website, SEO, advertising, social, video, lead gen, and brand voice.",
    files: ["Brand voice guide", "Website SEO queue", "YouTube production list"],
    permissions: ["Draft public content", "Research competitors", "Prepare campaign briefs"],
    guardrails: ["No publish without approval", "No claims without sources"],
  },
  "Accounting & Finance": {
    supervisor: "Finance Lead",
    focus: "Books, payroll, tax, collections, reporting, and finance-safe summaries.",
    files: ["Monthly close checklist", "AR watchlist", "Finance report template"],
    permissions: ["Read assigned finance reports", "Draft internal summaries", "Flag exceptions"],
    guardrails: ["No payments", "No payroll edits", "No external finance messages"],
  },
};

const agentOverrides = {
  Lindsay: {
    supervisor: "Brigham Larson",
    focus: "Chief strategy, executive routing, agent buildout priorities, and owner-level briefings.",
    files: ["Agent org chart v5", "Strategic priorities", "BLP brand transformation map"],
    automations: ["Daily owner brief", "Weekly agent team pulse", "Blocked-work escalation"],
  },
  Walter: {
    focus: "Chief of staff triage, task routing, reminders, and cross-department accountability.",
    automations: ["8 AM command center digest", "Approval queue sweep", "Stale task nudge"],
  },
  Cody: {
    focus: "Dashboard development, integration scaffolding, cron job visibility, and internal tooling.",
    files: ["Agent console repo", "Hermes integration notes", "Dashboard feature backlog"],
    automations: ["Nightly prototype health check", "Open issue summary"],
  },
  Libby: {
    focus: "Knowledge vault stewardship, source hygiene, training material organization, and retrieval quality.",
    files: ["Knowledge vault index", "Approved piano terminology", "Source-required answer examples"],
    automations: ["Knowledge gaps report", "Weekly SOP freshness check"],
  },
  Marcus: {
    focus: "Marketing leadership, website content, SEO, campaigns, competitive research, and public voice.",
    automations: ["Monday SEO queue brief", "Campaign draft review", "Competitor movement digest"],
  },
  Monte: {
    focus: "CFO-level finance summaries, anomaly flags, cash visibility, and leadership-ready financial notes.",
    automations: ["Monthly cash summary", "Weekly AR watchlist", "Finance exception alert"],
  },
  Melody: {
    focus: "Admin and customer-service drafts, service routing, polite follow-ups, and customer-safe summaries.",
    automations: ["Morning service inbox triage", "Unanswered customer follow-up", "Daily scheduling summary"],
  },
  Ivory: {
    focus: "Tuning requests, field visit notes, maintenance education, and route intelligence.",
    automations: ["Overdue tuning list", "Route grouping draft", "Post-service follow-up reminder"],
  },
  Sally: {
    focus: "Sales support, lead replies, showroom visit prep, and inventory match recommendations.",
    automations: ["New lead triage", "Showroom appointment prep", "Inventory match draft"],
  },
  Chris: {
    focus: "Shop operations, restoration queue visibility, technician blockers, and work-order summaries.",
    automations: ["Shop status rollup", "Blocked restoration alert", "Parts-needed summary"],
  },
};

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

let selectedAgent = enrichAgent(agents[0]);

const demoTasks = [
  {
    title: "Restoration lead follow-up brief",
    owner: "Melody",
    type: "Customer service",
    status: "Needs approval",
    summary: "Draft responses for new family heirloom restoration inquiries with source notes and next steps.",
  },
  {
    title: "Inventory SEO update",
    owner: "Marcus",
    type: "Marketing",
    status: "In progress",
    summary: "Refresh piano inventory page copy with current brand language and showroom search intent.",
  },
  {
    title: "Tuning route review",
    owner: "Ivory",
    type: "Fieldwork",
    status: "Queued",
    summary: "Group upcoming tuning requests by area and flag customers who are overdue by 12+ months.",
  },
];

const tasks = liveArray("tasks", demoTasks);

const demoApprovalItems = [
  {
    type: "Customer email",
    owner: "Melody",
    risk: "Medium",
    status: "Needs approval",
    title: "Restoration inquiry response",
    summary: "Follow-up for a Steinway family heirloom customer.",
    before: "Generic reply with incomplete restoration expectations.",
    after: "Warm BLP reply explaining intake, inspection, restoration scope, and next-step scheduling.",
    source: "Agent Email / customer service inbox",
    approvalRule: "Human must approve before customer send.",
  },
  {
    type: "Website copy",
    owner: "Marcus",
    risk: "High",
    status: "Approval required",
    title: "Inventory SEO update",
    summary: "New service page edits need brand and accuracy review before publishing.",
    before: "Short product copy with weak search intent and unsupported claims.",
    after: "Source-backed inventory copy with BLP tone, piano details, and no unsupported promises.",
    source: "Website / Shopify draft queue",
    approvalRule: "Human publish approval required.",
  },
  {
    type: "Finance note",
    owner: "Monte",
    risk: "High",
    status: "Internal only",
    title: "Monthly cash summary",
    summary: "Prepared for leadership review with finance-safe boundaries.",
    before: "Raw finance notes without owner-ready summary.",
    after: "Leadership summary with exceptions, questions, and no external-send action.",
    source: "Accounting & Finance dashboard",
    approvalRule: "No external sharing or payment action.",
  },
  {
    type: "Knowledge update",
    owner: "Libby",
    risk: "Low",
    status: "Review pending",
    title: "Approved restoration language",
    summary: "Knowledge Vault note waiting for review before agent training.",
    before: "New note not yet approved for agent use.",
    after: "Reviewed language can become source-backed guidance for restoration replies.",
    source: "Google Drive Knowledge Vault",
    approvalRule: "Libby/human review before training sync.",
  },
];

const approvalItems = liveArray("approvalItems", demoApprovalItems);

let selectedApproval = approvalItems[0];

const training = {
  Intake: ["Upload Brigham-approved restoration explanations", "Add examples of great tuning follow-ups"],
  Review: ["Mark weak agent replies by issue type", "Confirm customer-safe wording"],
  Training: ["Teach pricing boundaries", "Add piano brand terminology"],
  Ready: ["Libby knowledge vault sync", "Cody dashboard implementation tasks"],
};

const integrations = [
  {
    name: "Hermes",
    status: "Ready to scope",
    owner: "Lindsay + Cody",
    purpose: "Connect Lindsay and Cody as managed agents with task intake, status, and dashboard reporting.",
    firstStep: "Define Hermes API or mailbox handoff contract.",
    risk: "Medium",
  },
  {
    name: "Marketing Hermes",
    status: "Needs remote bridge",
    owner: "Marcus + Lindsay",
    purpose: "Connect the marketing Hermes agents on the other laptop to Agent Console, Marketing Dashboard, Design Center, and VideoFlow.",
    firstStep: "Collect the remote Hermes bridge URL, per-agent webhook routes, HMAC signature details, and callback/status destination.",
    risk: "Medium",
  },
  {
    name: "OpenClaw",
    status: "Mapping created",
    owner: "Walter",
    purpose: "Connect the 9 OpenClaw agents, route requests, and report current work, cron jobs, and activity back to the console.",
    firstStep: "Collect endpoint/CLI/status/cron details from each OpenClaw agent, then update data/openclaw-mapping.json.",
    risk: "Medium",
  },
  {
    name: "Agent Email",
    status: "Best first live connector",
    owner: "Melody + Dawn",
    purpose: "Send assignments and receive responses through name@brighamlarsonpianos.com.",
    firstStep: "Start read-only inbox summaries, then draft-only outbound messages.",
    risk: "Low",
  },
  {
    name: "Discord",
    status: "Best team chat connector",
    owner: "Walter",
    purpose: "Notify channels, post task updates, and let humans assign work from chat.",
    firstStep: "Create private agent-ops channels and webhook-only posting.",
    risk: "Low",
  },
  {
    name: "Telegram",
    status: "Mobile command path",
    owner: "Lindsay",
    purpose: "Let leadership send quick requests and receive urgent agent alerts on mobile.",
    firstStep: "Start with alerts only; add commands after permissions are clear.",
    risk: "Medium",
  },
  {
    name: "Google Drive",
    status: "Knowledge foundation",
    owner: "Libby",
    purpose: "Attach SOPs, examples, org charts, avatars, and training files to the agent knowledge vault.",
    firstStep: "Index selected folders read-only before any write permissions.",
    risk: "Low",
  },
  {
    name: "Cron Jobs",
    status: "Needs audit trail",
    owner: "Cody",
    purpose: "Show recurring jobs, last run, next run, output, failures, and owner approvals.",
    firstStep: "Inventory every existing cron/automation by agent.",
    risk: "Medium",
  },
  {
    name: "Website / Shopify",
    status: "Approval-gated only",
    owner: "Marcus",
    purpose: "Draft website updates, SEO changes, product copy, and landing-page recommendations.",
    firstStep: "Draft-only workflow with human publish approval.",
    risk: "High",
  },
];

const marketingHermesConnection = {
  status: "needs-remote-hermes-gateway",
  recommendedBridge: "Secure HTTPS bridge to the other laptop's Hermes webhook gateway",
  intakeDoc: "../docs/marketing-hermes-connection-intake.md",
  gatewayMissing: [
    "public HTTPS bridge URL",
    "Hermes binary path and profile on the other laptop",
    "webhook host/port and gateway status",
    "HMAC signature header and secret env var names",
    "callback or status-return destination",
  ],
  agents: [
    ["Marcus", "Head of Marketing", "Marketing Command Center + Agent Console", "marcus@brighamlarsonpianos.com", "HERMES_AGENT_MARCUS_SECRET", "needs-route"],
    ["Desie", "Design", "Design Center + Agent Console", "desie@brighamlarsonpianos.com", "HERMES_AGENT_DESIE_SECRET", "needs-route"],
    ["Ed", "Video Editor", "VideoFlow + Agent Console", "ed@brighamlarsonpianos.com", "HERMES_AGENT_ED_SECRET", "needs-route"],
    ["Yolanda", "YouTube", "VideoFlow + Marketing Command Center", "yolanda@brighamlarsonpianos.com", "HERMES_AGENT_YOLANDA_SECRET", "needs-route"],
    ["Sharie", "Social Media", "VideoFlow + Marketing Command Center", "sharie@brighamlarsonpianos.com", "HERMES_AGENT_SHARIE_SECRET", "needs-route"],
    ["Brandy", "Branding", "Marketing Command Center + Agent Console", "brandy@brighamlarsonpianos.com", "HERMES_AGENT_BRANDY_SECRET", "needs-route"],
    ["Addie", "Advertising", "Marketing Command Center + Agent Console", "addie@brighamlarsonpianos.com", "HERMES_AGENT_ADDIE_SECRET", "needs-route"],
    ["Lee", "Lead Gen", "Marketing Command Center + Agent Console", "lee@brighamlarsonpianos.com", "HERMES_AGENT_LEE_SECRET", "needs-route"],
    ["Rajeesh", "Website", "Marketing Command Center + Agent Console", "rajeesh@brighamlarsonpianos.com", "HERMES_AGENT_RAJEESH_SECRET", "needs-route"],
    ["Collin", "Competitor Research", "Marketing Command Center + Agent Console", "collin@brighamlarsonpianos.com", "HERMES_AGENT_COLLIN_SECRET", "needs-route"],
  ].map(([name, role, moduleTargets, email, secretEnvVar, status]) => ({
    name,
    role,
    moduleTargets,
    email,
    secretEnvVar,
    status,
    webhookRoute: "",
    responseDestination: "",
  })),
};

const neededFromTeam = [
  ["Obsidian vault name", "Exact vault name for the obsidian:// link so Knowledge Vault opens locally."],
  ["Google Drive local sync path", "Exact local folder path for the Drive-synced vault if different from the shared URL."],
  ["Hermes connection method", "API, webhook, email handoff, database, or other way Lindsay/Cody expose status and receive tasks."],
  ["Marketing Hermes bridge", "Secure public/private bridge URL for the other laptop, plus per-agent webhook routes for Marcus, Desie, Ed, and the marketing team."],
  ["OpenClaw connection method", "How Walter and the 8 other OpenClaw agents should receive tasks and return status."],
  ["Email rules", "Which agent mailboxes can be read, which can draft, and who approves outbound messages."],
  ["Discord and Telegram map", "Channel names, handles, webhook/bot plan, and which humans should receive alerts."],
  ["Human user roles", "Who on the BLP team can approve, assign, train, publish, view finance, or edit permissions."],
  ["Real cron inventory", "List of current recurring jobs by agent, schedule, owner, output, and failure behavior."],
  ["Brand feedback", "Screens Brigham loves, screens to simplify, and any wording that should sound more BLP."],
  ["Deployment preference", "Netlify/Vercel/GitHub Pages now, and eventual subdomain such as agents.brighamlarsonpianos.com."],
];

const launchPhases = [
  ["Demo polish", "Clickable workflows, feedback, and Brigham-approved product direction.", "Now"],
  ["Read-only beta", "Connect Drive, email summaries, agent registry, and cron visibility without actions.", "Next"],
  ["Draft-only operations", "Agents draft replies, tasks, website updates, and summaries for human approval.", "After beta"],
  ["Controlled actions", "Approved agents can trigger limited actions with audit logs and rollback paths.", "Later"],
  ["Full command center", "Human team manages live agents, permissions, training, files, and automations from one console.", "Goal"],
];

const permissionRows = [
  ["Hermes", "Read agent status", "Draft tasks", "No direct send", "No system changes"],
  ["OpenClaw", "Read agent status", "Draft tasks", "No direct send", "No system changes"],
  ["Agent Email", "Read selected inboxes", "Draft replies", "Human-approved send", "No delete/archive"],
  ["Discord", "Read private ops channels", "Post status updates", "Human-approved announcements", "No channel/admin changes"],
  ["Telegram", "Read command bot messages", "Draft urgent alerts", "Leadership-approved send", "No group permission changes"],
  ["Google Drive", "Read approved folders", "Suggest training files", "No external sharing", "No delete/move"],
  ["Cron Jobs", "Read schedule/run logs", "Draft new automation", "Human-approved enable", "No silent failures"],
  ["Website / Shopify", "Read products/pages", "Draft copy changes", "Human publish only", "No price/inventory edits"],
];

const vaultSources = [
  {
    name: "Obsidian BLP Knowledge Vault",
    type: "Human editing workspace",
    status: "Local vault path connected",
    link: "obsidian://open?path=%2FUsers%2Fblpadmin%2FLibrary%2FCloudStorage%2FGoogleDrive-lindsay%40brighamlarsonpianos.com%2FShared%20drives%2FBLP%20Knowledge%20Vault%2FVault",
    detail: "Best for humans writing SOPs, agent notes, training examples, and Brigham-approved language.",
  },
  {
    name: "Google Drive synced vault",
    type: "Agent-readable source folder",
    status: "Drive folder linked",
    link: "https://drive.google.com/drive/folders/1GoxHwnWqhhl50HvudeDnwuYBTvpXf1v-",
    detail: "Best for indexing, source links, file permissions, and training sync into agent dashboards.",
  },
];

const vaultCollections = [
  ["SOPs", "Shop, sales, fieldwork, admin, finance, and marketing procedures."],
  ["Approved Language", "Restoration explanations, tuning policy, customer-safe phrases, and brand voice."],
  ["Training Examples", "Great replies, corrected replies, bad examples, and why they matter."],
  ["Agent Notes", "Role boundaries, known weaknesses, permissions, and supervisor guidance."],
  ["Source Library", "Org charts, service docs, pricing boundaries, inventory reference, and website notes."],
  ["Review Queue", "New or changed notes waiting for Libby/human approval before agent use."],
];

const setupSteps = {
  "Hermes": ["Document Lindsay/Cody endpoints or mailbox workflow", "Create agent status payload shape", "Map Hermes task states into console states", "Test with 3 internal-only tasks"],
  "Marketing Hermes": ["Choose bridge method for the other laptop", "Collect public HTTPS base URL and HMAC signature rules", "Create webhook subscriptions for Marcus, Desie, Ed, Yolanda, Sharie, Brandy, Addie, Lee, Rajeesh, and Collin", "Map each route to Agent Console plus its module", "Send safe internal-only test task to Marcus, Desie, and Ed first"],
  "OpenClaw": ["Created data/openclaw-mapping.json for 9 active agents", "Collect endpoint, CLI, auth, task, status, cron, and activity details", "Update mapping rows from needs-details to connected", "Run node scripts/openclaw-adapter.mjs to refresh status and cron snapshots", "Test multi-agent routing from command box"],
  "Agent Email": ["Confirm mailboxes for active agents", "Start read-only summaries", "Enable draft-only replies", "Require human approval before outbound send"],
  "Discord": ["Create private agent-ops channels", "Add webhook-only status posts", "Map channel messages to tasks", "Add human approval for announcements"],
  "Telegram": ["Create leadership alert bot", "Start alert-only mode", "Add command templates", "Require confirmation for customer or finance data"],
  "Google Drive": ["Select approved knowledge folders", "Index files read-only", "Tag SOPs and training examples", "Show source links in agent dashboards"],
  "Cron Jobs": ["Inventory recurring jobs by agent", "Capture last run and next run", "Show failure/blocked states", "Add pause/edit controls with audit log"],
  "Website / Shopify": ["Start read-only product/page access", "Generate draft copy only", "Route public changes to approval queue", "Log every publish decision"],
};


const demoQueueItems = [
  {
    title: "Restoration lead follow-up brief",
    status: "Needs Approval",
    agent: "Melody",
    department: "Admin & Customer Service",
    risk: "Medium",
    due: "Today",
    source: "Request Router",
    summary: "Draft customer-safe follow-ups for new family heirloom restoration inquiries.",
  },
  {
    title: "Inventory SEO update",
    status: "In Progress",
    agent: "Marcus",
    department: "Marketing",
    risk: "High",
    due: "Tomorrow",
    source: "Website / Shopify",
    summary: "Refresh piano inventory copy with BLP tone, source-backed claims, and review gate.",
  },
  {
    title: "Tuning route review",
    status: "Intake",
    agent: "Ivory",
    department: "Fieldwork",
    risk: "Low",
    due: "This week",
    source: "Fieldwork queue",
    summary: "Group upcoming tuning requests by service area and flag overdue customers.",
  },
  {
    title: "Knowledge Vault sync plan",
    status: "Blocked",
    agent: "Libby",
    department: "Technical",
    risk: "Low",
    due: "Waiting",
    source: "Google Drive",
    summary: "Needs exact Obsidian vault name before the sync checklist can be finalized.",
  },
  {
    title: "Daily owner brief",
    status: "Done",
    agent: "Cody",
    department: "Technical",
    risk: "Low",
    due: "Completed",
    source: "Cron Jobs",
    summary: "Compiled current work, blocked tasks, approvals, and knowledge updates.",
  },
  {
    title: "AR watchlist summary",
    status: "Needs Approval",
    agent: "Monte",
    department: "Accounting & Finance",
    risk: "High",
    due: "Today",
    source: "Finance dashboard",
    summary: "Leadership-only summary ready for review. No external finance action allowed.",
  },
];

const queueItems = liveArray("queueItems", demoQueueItems);

const demoHealthSignals = [
  { name: "Lindsay", status: "Ready", load: "2 strategic reviews", blocker: "None", cron: "Daily owner brief", score: 95, trend: "Stable", lastAction: "Reviewed owner-priority routing", lastCorrection: "None this week", checkIn: "4 min ago" },
  { name: "Cody", status: "Watch", load: "4 build tasks", blocker: "Needs integration specs", cron: "Prototype health check", score: 88, trend: "Improving", lastAction: "Added Work Queue board", lastCorrection: "Tighten mobile overflow", checkIn: "9 min ago" },
  { name: "Walter", status: "Ready", load: "3 routing tasks", blocker: "None", cron: "Approval sweep", score: 92, trend: "Stable", lastAction: "Routed SEO request", lastCorrection: "None this week", checkIn: "12 min ago" },
  { name: "Dawn", status: "Ready", load: "1 press/support item", blocker: "None", cron: "Assistant digest", score: 90, trend: "Stable", lastAction: "Prepared support brief", lastCorrection: "Tone softened", checkIn: "18 min ago" },
  { name: "Marcus", status: "Busy", load: "5 marketing drafts", blocker: "SEO source review", cron: "Campaign draft review", score: 84, trend: "Declining", lastAction: "Drafted inventory SEO copy", lastCorrection: "Needs stronger source links", checkIn: "36 min ago" },
  { name: "Monte", status: "Guarded", load: "2 finance summaries", blocker: "Human-only finance review", cron: "AR watchlist", score: 91, trend: "Stable", lastAction: "Prepared AR summary", lastCorrection: "Internal-only label added", checkIn: "41 min ago" },
  { name: "Sally", status: "Ready", load: "3 sales drafts", blocker: "Needs inventory freshness", cron: "New lead triage", score: 86, trend: "Improving", lastAction: "Prepared showroom visit notes", lastCorrection: "Added inventory caveat", checkIn: "1 hr ago" },
  { name: "Libby", status: "Busy", load: "6 vault updates", blocker: "Knowledge review queue", cron: "SOP freshness check", score: 93, trend: "Improving", lastAction: "Linked Drive Knowledge Vault", lastCorrection: "Awaiting vault name confirmation", checkIn: "7 min ago" },
  { name: "Ivory", status: "Ready", load: "2 tuning routes", blocker: "None", cron: "Overdue tuning list", score: 89, trend: "Stable", lastAction: "Grouped tuning requests", lastCorrection: "None this week", checkIn: "24 min ago" },
  { name: "Melody", status: "Busy", load: "4 customer drafts", blocker: "Approval queue waiting", cron: "Service inbox triage", score: 87, trend: "Stable", lastAction: "Drafted restoration reply", lastCorrection: "Human approval required", checkIn: "15 min ago" },
  { name: "Chris", status: "Watch", load: "3 shop summaries", blocker: "Parts-needed source", cron: "Shop status rollup", score: 82, trend: "Declining", lastAction: "Summarized restoration blockers", lastCorrection: "Needs parts source", checkIn: "2 hr ago" },
];

const healthSignals = liveArray("healthSignals", demoHealthSignals);

const demoLogEvents = [
  {
    time: "Today 9:12 AM",
    agent: "Melody",
    human: "Lindsay",
    system: "Agent Email",
    type: "Customer draft",
    status: "Needs approval",
    risk: "Medium",
    title: "Drafted restoration inquiry follow-up",
    summary: "Prepared a customer-safe reply for a Steinway family heirloom restoration lead.",
    source: "Customer service inbox",
    receipt: "Draft only. No message sent.",
  },
  {
    time: "Today 9:36 AM",
    agent: "Libby",
    human: "Brigham",
    system: "Google Drive",
    type: "Knowledge update",
    status: "Review pending",
    risk: "Low",
    title: "Knowledge Vault note added",
    summary: "New approved-language note queued for review before agent training.",
    source: "BLP Knowledge Vault",
    receipt: "Read-only index updated. Training not applied yet.",
  },
  {
    time: "Today 10:05 AM",
    agent: "Marcus",
    human: "Marketing",
    system: "Website / Shopify",
    type: "Website draft",
    status: "Approval required",
    risk: "High",
    title: "Inventory SEO copy drafted",
    summary: "Drafted revised Yamaha C3 inventory language with source-required claims.",
    source: "Website content queue",
    receipt: "No publish action allowed without approval.",
  },
  {
    time: "Today 11:40 AM",
    agent: "Cody",
    human: "Lindsay",
    system: "Cron Jobs",
    type: "Automation run",
    status: "Successful",
    risk: "Low",
    title: "Daily owner brief generated",
    summary: "Compiled active work, blocked tasks, approvals, and vault changes.",
    source: "Scheduled daily brief",
    receipt: "Output posted to Lindsay dashboard.",
  },
  {
    time: "Yesterday 4:18 PM",
    agent: "Ivory",
    human: "Fieldwork",
    system: "OpenClaw",
    type: "Data pull",
    status: "Completed",
    risk: "Low",
    title: "Overdue tuning list grouped by route",
    summary: "Flagged overdue tuning requests and grouped them by service area.",
    source: "Fieldwork task queue",
    receipt: "Internal summary only.",
  },
  {
    time: "Yesterday 2:04 PM",
    agent: "Monte",
    human: "Finance",
    system: "OpenClaw",
    type: "Finance summary",
    status: "Internal only",
    risk: "High",
    title: "AR watchlist summary prepared",
    summary: "Prepared leadership-only collections summary with no external messages.",
    source: "Accounting & Finance dashboard",
    receipt: "No payment, payroll, or customer action taken.",
  },
  {
    time: "Yesterday 10:22 AM",
    agent: "Walter",
    human: "Lindsay",
    system: "Hermes",
    type: "Routing",
    status: "Completed",
    risk: "Low",
    title: "Assigned marketing request to Marcus",
    summary: "Routed SEO campaign request to Marcus with Libby and Cody as support.",
    source: "Request router",
    receipt: "Task created and visible in Live Work.",
  },
  {
    time: "May 20 5:42 PM",
    agent: "Sally",
    human: "Sales",
    system: "Agent Email",
    type: "Sales draft",
    status: "Corrected",
    risk: "Medium",
    title: "Showroom visit prep corrected",
    summary: "Human corrected tone and added inventory caveat before customer use.",
    source: "Sales lead queue",
    receipt: "Correction sent to training examples.",
  },
];

const logEvents = liveArray("logEvents", demoLogEvents);

const routeKeywords = [
  { terms: ["website", "seo", "campaign", "youtube", "social", "ad", "brand"], agent: "Marcus", team: ["Marcus", "Libby", "Cody"] },
  { terms: ["money", "finance", "cash", "payroll", "invoice", "collections", "tax"], agent: "Monte", team: ["Monte", "Libby", "Walter"] },
  { terms: ["customer", "email", "reply", "scheduling", "service", "admin"], agent: "Melody", team: ["Melody", "Dawn", "Walter"] },
  { terms: ["tuning", "route", "field", "warranty"], agent: "Ivory", team: ["Ivory", "Chris", "Walter"] },
  { terms: ["shop", "restoration", "refinishing", "repair", "parts"], agent: "Chris", team: ["Chris", "Libby", "Melody"] },
  { terms: ["sales", "lead", "inventory", "showroom", "piano match"], agent: "Sally", team: ["Sally", "Marcus", "Melody"] },
  { terms: ["code", "dashboard", "integration", "api", "cron"], agent: "Cody", team: ["Cody", "Libby", "Walter"] },
  { terms: ["knowledge", "source", "training", "sop", "vault"], agent: "Libby", team: ["Libby", "Lindsay", "Cody"] },
];



  window.BLP_DATA = {
    avatarBase, activeNames, agents, orgDepartmentMeta, departmentDefaults, agentOverrides, tasks, approvalItems, training, integrations, marketingHermesConnection, neededFromTeam, launchPhases, permissionRows, vaultSources, vaultCollections, setupSteps, queueItems, healthSignals, logEvents, routeKeywords
  };
})();
