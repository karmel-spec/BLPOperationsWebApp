const liveModules = [
  {
    title: "Sales Console",
    status: "Live app",
    href: "https://blpsalesapp.netlify.app/",
    summary: "Live sales command center (blpsalesapp.netlify.app) with the Leads Log queue, heat scoring, Arnold draft recommendations, and the lead map.",
    owner: "Sales and showroom",
    access: "Owner, sales, admins, managers",
    tone: "gold",
  },
  {
    title: "Piano Log & Inventory",
    status: "Live app",
    href: "https://pianologapp.netlify.app/",
    summary: "Live piano inventory and restoration tracking app (pianologapp.netlify.app) with Piano Log, restoration contracts, storage requests, Shopify export, image uploads, and product records.",
    owner: "Inventory, restoration, and showroom",
    access: "Owner, Chris, shop admin, inventory, marketing",
    tone: "gold",
  },
  {
    title: "Shop Manager / Restoration Console",
    status: "Live site",
    href: "https://brighamlarsonpianos.tech/",
    summary: "Live restoration shop site (brighamlarsonpianos.tech) for Chris's Piano Log pipeline, technician dashboards, floor-plan map, weekly planning, and shopping lists.",
    owner: "Restoration shop and technicians",
    access: "Owner, Chris, shop admin, technicians",
    tone: "gold",
  },
  {
    title: "BLP CRM",
    status: "Live app",
    href: "https://blpcrm.netlify.app/",
    summary: "Live unified customer database (blpcrm.netlify.app) for sales, tuning, teachers, moving, restoration, leads, accounting, marketing, and client portals, with imports from Gazelle, QBO, Agile, Google Sheets, and more.",
    owner: "Customer data backbone",
    access: "Owner, Cody, admins, managers, department leads",
    tone: "blue",
  },
  {
    title: "BrigGPT Console",
    status: "Priority draft",
    href: "./modules/briggpt-console/index.html",
    summary: "Founder-knowledge console for Brigham's expert piano judgment, brand voice, customer explanations, training guidance, HeyGen/avatar video workflows, and cross-dashboard support.",
    owner: "Founder intelligence",
    access: "Owner, Clara, managers, trainers, approved staff",
    tone: "green",
  },
  {
    title: "Store Map",
    status: "Live app",
    href: "https://blpstoremap.netlify.app/",
    summary: "Live showroom floor map (blpstoremap.netlify.app) with piano slots, live inventory, and the moving calendar.",
    owner: "Inventory and showroom floor",
    access: "Owner, inventory, sales, marketing, shop admin",
    tone: "blue",
  },
  {
    title: "Piano Technology Library",
    status: "Live site",
    href: "https://pianotechnologylibrary.com/",
    summary: "Free piano technology resource library (pianotechnologylibrary.com) for technician training and reference.",
    owner: "Technician training and reference",
    access: "Owner, technicians, managers, approved staff, public",
    tone: "green",
  },
  {
    title: "Knowledge Vault",
    status: "Priority draft",
    href: "./modules/knowledge-vault/index.html",
    summary: "Training and source-truth dashboard for Obsidian and Drive knowledge, training records, policies, SOPs, approved answers, and agent source libraries.",
    owner: "Training and source truth",
    access: "Owner, Lindsay, managers, trainers, approved agents",
    tone: "blue",
  },
];

// Parked for future development (2026-07-29): shown on the Expansion Map, not in daily navigation.
const plannedModules = [
  {
    title: "Team Culture",
    status: "Priority draft",
    href: "./modules/team-culture/index.html",
    summary: "People dashboard for values, recognition, team rituals, celebrations, feedback loops, internal stories, culture notes, and team-building initiatives.",
    owner: "People and culture",
    access: "Owner, Karmel, managers, admins, team leads",
    tone: "green",
  },
  {
    title: "Agent Operations Console",
    status: "Live prototype",
    href: "./i-have-11-agents-2-in/index.html",
    summary: "Human-to-agent command center with roster, dashboards, health, Notion work sync, approvals, training, logs, and integrations.",
    owner: "Agent team operations",
    access: "Owner, managers, agent operators",
    tone: "green",
  },
  {
    title: "Marketing Command Center",
    status: "Imported module",
    href: "./modules/marketing/index.html",
    summary: "Marketing intelligence dashboard for growth metrics, attribution readiness, AI marketing agents, channels, funnel, and integrations.",
    owner: "Marketing and growth",
    access: "Owner, marketing, leadership",
    tone: "blue",
  },
  {
    title: "VideoFlow Automation Studio",
    status: "Source handoff ready",
    href: "./modules/videoflow/index.html",
    summary: "Video workflow system for raw Drive uploads, Ed/Yolanda/Sharie queues, YouTube optimization, social packages, approval gates, scheduling, and publishing readiness.",
    owner: "Marketing video operations",
    access: "Owner, marketing, media agents, leadership",
    tone: "blue",
  },
  {
    title: "Tuning CRM / Online Scheduling",
    status: "Imported, needs live data bridge",
    href: "./modules/tuning-crm/index.html",
    summary: "Tuning CRM with dashboard metrics, clients, service-due queue, duplicate detection, tuner workload, geography, and online booking.",
    owner: "Tuning, scheduling, and client service",
    access: "Owner, front desk, tuning admin, tuners",
    tone: "green",
  },
  {
    title: "Onboarding & Training Portal",
    status: "Imported prototype",
    href: "./modules/onboarding/index.html",
    summary: "Internal onboarding portal with sample new-hire dashboards, universal BLP onboarding, role pathways, safety videos, mentor sign-offs, resource library, and print/export tools.",
    owner: "HR, training, managers",
    access: "Owner, managers, mentors, new hires",
    tone: "blue",
  },
  {
    title: "Admin Task Board",
    status: "Live prototype",
    href: "./modules/admin-task-board/index.html",
    summary: "Trello-style task and priority board for owners, admins, and managers to track requests, blockers, assignments, and follow-ups.",
    owner: "Admin and manager operations",
    access: "Owner, admins, managers",
    tone: "green",
  },
  {
    title: "Technician Dashboards",
    status: "Priority draft",
    href: "./modules/technician-dashboards/index.html",
    summary: "Daily field assignments, calendar embeds, service notes, parts needs, skill and training records, pianos worked on, personal bests, milestone dates, and Google Photos history.",
    owner: "Technicians and shop operations",
    access: "Owner, Chris, technicians, managers",
    tone: "gold",
  },
  {
    title: "Warranty Tracking",
    status: "Priority draft",
    href: "./modules/warranty-tracking/index.html",
    summary: "Warranty command center for purchased pianos, service-backed promises, expiring coverage, claim follow-up, customer communication, and future live contacts spreadsheet sync.",
    owner: "Warranty operations",
    access: "Owner, Warren, customer service, sales, service managers",
    tone: "gold",
  },
  {
    title: "Client Dashboard",
    status: "Priority draft",
    href: "./modules/client-dashboard/index.html",
    summary: "Customer-facing portal for client profiles, piano details, purchase and service history, restoration progress, contracts, QBO estimates, selections, photos, and approved team messages.",
    owner: "Client experience",
    access: "Clients, owner, Melody, admins, service and restoration managers",
    tone: "blue",
  },
  {
    title: "Customer Service",
    status: "Priority draft",
    href: "./modules/customer-service/index.html",
    summary: "SalesCaptain replacement concept for incoming calls, texts, emails, website requests, searchable tickets, follow-up ownership, transcripts, summaries, and resolution history.",
    owner: "Client communication",
    access: "Owner, Melody, admins, sales, service, restoration, managers",
    tone: "green",
  },
  {
    title: "Accounting Department",
    status: "Priority draft",
    href: "./modules/accounting-department/index.html",
    summary: "Restricted finance command center for QuickBooks, bill pay, payroll coordination, taxes, reconciliations, documents, deadlines, exception queues, reports, and Monte's accounting support.",
    owner: "Finance operations",
    access: "Owner, accounting, Monte, approved managers",
    tone: "gold",
  },
  {
    title: "Restoration Pipeline",
    status: "Priority draft",
    href: "./modules/restoration-pipeline/index.html",
    summary: "Production pipeline for restoration estimates, approvals, rebuild stages, parts, photos, technician handoffs, customer-safe updates, and completion signals.",
    owner: "Restoration shop",
    access: "Owner, Chris, Howie, Tray, shop admin, technicians, client service",
    tone: "gold",
  },
  {
    title: "Piano Restoration Training",
    status: "Priority draft",
    href: "./modules/restoration-training/index.html",
    summary: "Training dashboard for restoration skill modules, safety standards, practice assignments, mentor sign-offs, photo evidence, quality checks, and technician progression.",
    owner: "Restoration training",
    access: "Owner, Chris, Howie, Tray, technicians, mentors, training managers",
    tone: "gold",
  },
  {
    title: "Payroll",
    status: "Priority draft",
    href: "./modules/payroll/index.html",
    summary: "People-finance dashboard for time approvals, technician hours, commissions, pay period review, overtime alerts, bonuses, mileage reimbursements, exceptions, and payroll-ready reports.",
    owner: "Payroll operations",
    access: "Owner, Penny, accounting, managers, approved payroll admins",
    tone: "green",
  },
  {
    title: "Team Meetings",
    status: "Priority draft",
    href: "./modules/team-meetings/index.html",
    summary: "Leadership rhythm console for agendas, recurring meetings, decisions, action items, attendance, follow-ups, morning standup notes, and Professional Standards alignment.",
    owner: "Leadership rhythm",
    access: "Owner, Walter, managers, admins, team leads",
    tone: "blue",
  },
  {
    title: "Recitals",
    status: "Priority draft",
    href: "./modules/recitals/index.html",
    summary: "Recital operations dashboard for teacher CRM, student and family scheduling, venue planning, programs, reminders, approvals, payments, media, and host checklists.",
    owner: "Events and teacher relationships",
    access: "Owner, Reese, admins, teachers, event hosts",
    tone: "gold",
  },
  {
    title: "Newsletters",
    status: "Priority draft",
    href: "./modules/newsletters/index.html",
    summary: "Campaign command center for customer and teacher newsletters, campaign calendars, story ideas, approvals, segments, send dates, performance, and follow-up routing.",
    owner: "Marketing communication",
    access: "Owner, Marcus, marketing, managers, approved editors",
    tone: "blue",
  },
  {
    title: "Research",
    status: "Priority draft",
    href: "./modules/research/index.html",
    summary: "Research desk for market research, competitor tracking, product notes, opportunity briefs, pricing intelligence, source evidence, and decision handoffs.",
    owner: "Research and strategy",
    access: "Owner, Walter, managers, marketing, sales, inventory",
    tone: "green",
  },
  {
    title: "Social Sites",
    status: "Priority draft",
    href: "./modules/social-sites/index.html",
    summary: "Social channel command center for platform planning, post queues, content approvals, comment follow-up, platform health, growth signals, and cross-module handoffs.",
    owner: "Marketing channels",
    access: "Owner, Marcus, marketing, customer service, sales, approved posters",
    tone: "blue",
  },
  {
    title: "Design Center",
    status: "Priority draft",
    href: "./modules/design-center/index.html",
    summary: "Creative operations dashboard for brand assets, signs, web graphics, print pieces, templates, design requests, approvals, vendor handoffs, and production files.",
    owner: "Creative operations",
    access: "Owner, Marcus, marketing, managers, approved designers",
    tone: "gold",
  },
  {
    title: "Holidays & Parties",
    status: "Priority draft",
    href: "./modules/holidays-parties/index.html",
    summary: "Events planning console for holidays, company parties, dates, budgets, vendors, invitations, assignments, approvals, and event follow-through.",
    owner: "Events and celebrations",
    access: "Owner, Karmel, admins, managers, event owners",
    tone: "gold",
  },
  {
    title: "Uniforms",
    status: "Priority draft",
    href: "./modules/uniforms/index.html",
    summary: "People operations tracker for team apparel inventory, sizing, ordering, assignments, replacement requests, vendor notes, and role-based policy details.",
    owner: "People operations",
    access: "Owner, Karmel, admins, managers",
    tone: "green",
  },
  {
    title: "Building",
    status: "Priority draft",
    href: "./modules/building/index.html",
    summary: "Facilities command center for building projects, maintenance, inspections, room readiness, repairs, vendors, budgets, and owner approvals.",
    owner: "Facilities",
    access: "Owner, Karmel, managers, facility owners, approved vendors",
    tone: "blue",
  },
  {
    title: "Fleet",
    status: "Priority draft",
    href: "./modules/fleet/index.html",
    summary: "Operations dashboard for vehicle records, maintenance, mileage, assignments, insurance, inspections, issues, incidents, and replacement planning.",
    owner: "Fleet operations",
    access: "Owner, Karmel, managers, moving, service, approved drivers",
    tone: "blue",
  },
  {
    title: "Profit First",
    status: "Priority draft",
    href: "./modules/profit-first/index.html",
    summary: "Restricted finance-health dashboard for Profit First accounts, allocations, transfer rhythms, review dates, owner dashboards, exceptions, and financial checkpoints.",
    owner: "Finance health",
    access: "Owner, accounting, Monte, approved finance users",
    tone: "green",
  },
  {
    title: "Executive Vision Board",
    status: "Priority draft",
    href: "./modules/executive-vision-board/index.html",
    summary: "Leadership dashboard for north-star goals, quarterly priorities, strategic projects, health metrics, decision logs, owner approvals, and vision review.",
    owner: "Executive leadership",
    access: "Owner, leadership, approved managers",
    tone: "gold",
  },
  {
    title: "Daily Command Center",
    status: "Future development",
    href: "",
    summary: "Home dashboard concept for open priorities, waiting approvals, agent requests, customer follow-ups, and urgent blockers at a glance.",
    owner: "Owner dashboard concept",
    access: "Owner, admins, managers",
    tone: "green",
  },
  {
    title: "Team Operating Boards",
    status: "Future development",
    href: "",
    summary: "Per-person operating boards for Brigham, Karmel, Melissa, Susie, Alisa, Ezzy, and Doris with intake, priority, in-progress, waiting, and done columns.",
    owner: "Admin and manager operations",
    access: "Owner, admins, managers",
    tone: "blue",
  },
];

const accessModel = [
  ["Owner", "Full executive visibility, financial views, final approvals, and permission authority."],
  ["Admin", "System settings, user setup, module configuration, and operational permissions management."],
  ["Managers", "Division dashboards, team queues, approvals, and reporting."],
  ["Sales", "CRM, piano inventory, client follow-up, marketing leads, and approved agent help."],
  ["Service/Tuning", "Tuning schedules, client service history, routes, and technician handoffs."],
  ["Technicians", "Assigned work, service notes, checklists, and field updates."],
  ["Finance", "Accounting dashboards, payment status, exceptions, and restricted financial data."],
  ["Marketing", "Campaigns, attribution, content plans, lead sources, and agent work."],
  ["Agent Team", "Scoped task intake, assigned work, approved sources, and status reporting."],
  ["Clients", "Client-facing piano status, appointment details, approved documents, and limited support requests."],
];

const loginRoles = [
  ["Owner", "Passwordless email plus optional MFA", "All modules, all approvals, user permissions, finance-safe dashboards."],
  ["Admin", "Passwordless email plus MFA", "User setup, module settings, queues, reports, and non-owner system settings."],
  ["Manager", "Passwordless email", "Assigned division dashboards, team approvals, work queues, and reports."],
  ["Staff", "Passwordless email", "Assigned operating modules, customer work, internal notes, and task updates."],
  ["Agent", "API key or webhook identity", "Scoped task intake, approved files, status callbacks, and audit logging."],
  ["Client", "Magic link or portal invite", "Only their own piano/job/appointment records and approved messages."],
];

const roleProfiles = [
  {
    key: "owner",
    label: "Owner",
    login: "Passwordless email + MFA",
    description: "Full BLP visibility, final approvals, finance-safe views, and permission authority.",
    modules: "all",
  },
  {
    key: "admin",
    label: "Admin",
    login: "Passwordless email + MFA",
    description: "User setup, module settings, work queues, training, CRM, and operational dashboards.",
    tokens: ["admin", "admins", "managers", "training", "hr", "customer service", "front desk", "team leads", "approved staff", "approved managers"],
    modules: ["Admin Task Board", "Agent Operations Console", "BLP CRM", "Client Dashboard", "Customer Service", "Knowledge Vault", "Onboarding & Training Portal", "Team Meetings"],
  },
  {
    key: "manager",
    label: "Manager",
    login: "Passwordless email",
    description: "Division dashboards, approval queues, team priorities, reports, and assigned work.",
    tokens: ["manager", "managers", "team leads", "service managers", "restoration managers", "approved managers"],
    modules: ["Admin Task Board", "Agent Operations Console", "BLP CRM", "Customer Service", "Executive Vision Board", "Team Meetings"],
  },
  {
    key: "marketing",
    label: "Marketing",
    login: "Passwordless email",
    description: "Growth, campaigns, content, brand, design, video, social, newsletters, research, and marketing agents.",
    tokens: ["marketing", "marcus", "media agents", "approved designers", "approved editors", "approved posters"],
    modules: ["Agent Operations Console", "Design Center", "Marketing Command Center", "Newsletters", "Research", "Social Sites", "VideoFlow Automation Studio", "Sales Console", "Piano Log & Inventory", "Store Map"],
  },
  {
    key: "agent-team",
    label: "Agent Team",
    login: "Webhook/API identity",
    description: "Scoped task intake, assigned work, approved source files, health reporting, and audit callbacks.",
    modules: ["Agent Operations Console", "Knowledge Vault", "Marketing Command Center", "Design Center", "VideoFlow Automation Studio", "Admin Task Board"],
  },
  {
    key: "sales-service",
    label: "Sales & Service",
    login: "Passwordless email",
    description: "Leads, customer communication, piano records, service history, tuning schedules, and handoffs.",
    tokens: ["sales", "service", "tuning", "front desk", "customer service", "client service", "tuners", "warranty"],
    modules: ["Sales Console", "Customer Service", "Client Dashboard", "Piano Log & Inventory", "Tuning CRM / Online Scheduling", "Warranty Tracking", "BLP CRM"],
  },
  {
    key: "shop-tech",
    label: "Shop & Technicians",
    login: "Passwordless email",
    description: "Restoration pipeline, shop work, technician dashboards, parts, training, and field/service records.",
    tokens: ["chris", "shop", "shop admin", "technicians", "howie", "tray", "service", "restoration", "warren"],
    modules: ["Shop Manager / Restoration Console", "Restoration Pipeline", "Piano Restoration Training", "Technician Dashboards", "Piano Log & Inventory", "Store Map", "Piano Technology Library", "Warranty Tracking"],
  },
  {
    key: "finance",
    label: "Finance",
    login: "Passwordless email + MFA",
    description: "Restricted accounting, QuickBooks, bill pay, payroll, Profit First, taxes, and financial controls.",
    tokens: ["accounting", "finance", "payroll", "monte", "penny", "approved finance users", "approved payroll admins"],
    modules: ["Accounting Department", "Payroll", "Profit First", "BLP CRM"],
  },
  {
    key: "client",
    label: "Client",
    login: "Magic link",
    description: "Client-safe portal for their piano, approved documents, appointments, photos, and support requests.",
    modules: ["Client Dashboard"],
  },
];

const roleStorageKey = "blpOperatingSystemRole.v1";
let activeRoleKey = localStorage.getItem(roleStorageKey) || "owner";

const recentModuleUpdates = [
  ["Sales Console", "Replaced", "Old embedded prototype retired; now the live blpsalesapp.netlify.app sales app."],
  ["Shop Manager / Restoration Console", "Replaced", "Now links to the live brighamlarsonpianos.tech shop site."],
  ["Store Map", "Added", "Replaces Inventory & Pricing Audits; live floor map at blpstoremap.netlify.app."],
  ["Piano Technology Library", "Added", "New live resource at pianotechnologylibrary.com."],
];

const operatingSignals = [
  ["Sales Dashboard", "Sales Console"],
  ["Piano Log", "Piano Log & Inventory"],
  ["Shop Manager", "Shop Manager / Restoration Console"],
  ["BLP CRM", "BLP CRM"],
  ["BrigGPT", "BrigGPT Console"],
  ["Store Map", "Store Map"],
  ["Piano Technology Library", "Piano Technology Library"],
  ["Knowledge Vault", "Knowledge Vault"],
];

let activeModuleIndex = 0;
let activePreviewSize = "desktop";

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;");
}

function getStatusLabel(status = "") {
  const normalized = status.toLowerCase();
  if (normalized.includes("live")) return "Live";
  if (normalized.includes("needs live data") || normalized.includes("data bridge")) return "Needs data";
  if (normalized.includes("permission")) return "Needs permissions";
  if (normalized.includes("imported") || normalized.includes("handoff")) return "Ready to polish";
  return "Draft";
}

function getStatusSlug(status = "") {
  return getStatusLabel(status).toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
}

function getActiveRoleProfile() {
  return roleProfiles.find((profile) => profile.key === activeRoleKey) || roleProfiles[0];
}

function moduleAllowedForRole(module, profile = getActiveRoleProfile()) {
  if (!module || profile.modules === "all") return true;
  if (Array.isArray(profile.modules) && profile.modules.includes(module.title)) return true;
  const haystack = `${module.title} ${module.owner} ${module.access} ${module.summary}`.toLowerCase();
  return (profile.tokens || []).some((token) => haystack.includes(String(token).toLowerCase()));
}

function getAllowedModuleIndexes(profile = getActiveRoleProfile()) {
  return liveModules
    .map((module, index) => (moduleAllowedForRole(module, profile) ? index : -1))
    .filter((index) => index >= 0);
}

function ensureActiveModuleAllowed() {
  const allowed = getAllowedModuleIndexes();
  if (!allowed.includes(activeModuleIndex)) {
    activeModuleIndex = allowed[0] ?? 0;
  }
}

function renderRoleLogin() {
  const select = document.querySelector("#roleProfileSelect");
  const card = document.querySelector("#roleSessionCard");
  const description = document.querySelector("#roleLoginDescription");
  if (!select || !card) return;

  const profile = getActiveRoleProfile();
  const allowedCount = getAllowedModuleIndexes(profile).length;
  const heading = document.querySelector("#currentUserHeading");

  select.innerHTML = roleProfiles
    .map((role) => `<option value="${role.key}" ${role.key === profile.key ? "selected" : ""}>${role.label}</option>`)
    .join("");

  if (heading) heading.textContent = `Viewing as ${profile.label}`;
  if (description) description.textContent = profile.description;

  card.innerHTML = `
    <span>${profile.login}</span>
    <strong>${allowedCount}</strong>
    <p>Visible module${allowedCount === 1 ? "" : "s"} for ${escapeHtml(profile.label)}.</p>
  `;
}

function renderLiveModules() {
  const target = document.querySelector("#liveModules");
  if (!target) return;
  const allowed = getAllowedModuleIndexes();
  target.innerHTML = allowed
    .map((index) => {
      const module = liveModules[index];
      return `
        <a class="module-card${index === activeModuleIndex ? " is-selected" : ""}" data-tone="${module.tone}" data-module-index="${index}" href="${module.href}">
          <header>
            <div>
              <small>${module.owner}</small>
              <h4>${module.title}</h4>
            </div>
            <span class="status" data-status="${getStatusSlug(module.status)}">${getStatusLabel(module.status)}</span>
          </header>
          <p>${module.summary}</p>
          <span class="access-pill">${module.access}</span>
        </a>
      `;
    })
    .join("");

  const count = document.querySelector("#liveCount");
  if (count) count.textContent = `${allowed.length} visible modules`;
}

function renderPlannedModules() {
  const target = document.querySelector("#plannedModules");
  if (!target) return;
  target.innerHTML = plannedModules
    .map((module) => `
        <article class="module-card status-module-card" data-tone="${module.tone}">
          <header>
            <div>
              <small>${module.owner}</small>
              <h4>${module.title}</h4>
            </div>
            <span class="status" data-status="draft">Future development</span>
          </header>
          <p>${module.summary}</p>
        </article>
      `)
    .join("");
}

function renderRecentUpdates() {
  const target = document.querySelector("#recentUpdatesGrid");
  if (!target) return;
  target.innerHTML = recentModuleUpdates
    .map(([title, label, note]) => {
      const moduleIndex = liveModules.findIndex((module) => module.title === title);
      return `
        <article class="recent-update-card" ${moduleIndex >= 0 ? `data-module-index="${moduleIndex}"` : ""}>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(title)}</strong>
          <p>${escapeHtml(note)}</p>
        </article>
      `;
    })
    .join("");
}

function renderAccessModel() {
  const target = document.querySelector("#accessList");
  if (!target) return;
  const profile = getActiveRoleProfile();
  target.innerHTML = accessModel
    .map(
      ([role, description]) => `
        <article class="access-item${role.toLowerCase().replace(/[^a-z]+/g, "-") === profile.key ? " is-active" : ""}">
          <strong>${role}</strong>
          <span>${description}</span>
        </article>
      `,
    )
    .join("");
}

function renderLoginRoles() {
  const target = document.querySelector("#loginRoleGrid");
  if (!target) return;
  const profile = getActiveRoleProfile();
  target.innerHTML = loginRoles
    .map(
      ([role, login, access]) => `
        <article class="login-role-card${role.toLowerCase().replace(/[^a-z]+/g, "-") === profile.key ? " is-active" : ""}">
          <div>
            <strong>${role}</strong>
            <span>${login}</span>
          </div>
          <p>${access}</p>
        </article>
      `,
    )
    .join("");
}

function renderSignals() {
  const target = document.querySelector("#signalList");
  if (!target) return;
  const profile = getActiveRoleProfile();
  const allowedIndexes = getAllowedModuleIndexes(profile);
  target.innerHTML = operatingSignals
    .filter(([, moduleTitle]) => {
      const moduleIndex = liveModules.findIndex((module) => module.title === moduleTitle);
      return moduleIndex < 0 || allowedIndexes.includes(moduleIndex);
    })
    .map(
      ([title, moduleTitle]) => {
        const moduleIndex = liveModules.findIndex((module) => module.title === moduleTitle);
        return `
        <article class="signal-item" ${moduleIndex >= 0 ? `data-module-index="${moduleIndex}"` : ""}>
          <strong>${escapeHtml(title)}</strong>
        </article>
      `;
      },
    )
    .join("");
}

function renderModulePreview() {
  ensureActiveModuleAllowed();
  const module = liveModules[activeModuleIndex] || liveModules[0];
  const preview = document.querySelector(".module-preview");
  const select = document.querySelector("#previewModuleSelect");
  const owner = document.querySelector("#previewOwner");
  const status = document.querySelector("#previewStatus");
  const frame = document.querySelector("#moduleFrame");
  const openLink = document.querySelector("#previewOpenLink");

  if (!module || !preview || !select || !owner || !status || !frame || !openLink) return;

  preview.dataset.size = activePreviewSize;
  select.innerHTML = getAllowedModuleIndexes()
    .map((index) => `<option value="${index}"${index === activeModuleIndex ? " selected" : ""}>${escapeHtml(liveModules[index].title)}</option>`)
    .join("");
  owner.textContent = module.owner;
  status.textContent = module.status;
  frame.title = module.title;
  if (frame.getAttribute("src") !== module.href) frame.src = module.href;
  openLink.href = module.href;

  document.querySelectorAll("[data-preview-size]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.previewSize === activePreviewSize);
  });

  document.querySelectorAll(".signal-item[data-module-index]").forEach((item) => {
    item.classList.toggle("is-selected", Number(item.dataset.moduleIndex) === activeModuleIndex);
  });
}

function setupHamburger() {
  const toggle = document.querySelector("#hamburgerToggle");
  const dropdown = document.querySelector("#hamburgerDropdown");
  if (!toggle || !dropdown) return;

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    dropdown.hidden = open;
  });

  document.addEventListener("click", (event) => {
    if (dropdown.hidden || event.target.closest(".hamburger-menu")) return;
    toggle.setAttribute("aria-expanded", "false");
    dropdown.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || dropdown.hidden) return;
    toggle.setAttribute("aria-expanded", "false");
    dropdown.hidden = true;
    toggle.focus();
  });
}

document.addEventListener("click", (event) => {
  const moduleCard = event.target.closest("[data-module-index]");
  if (moduleCard) {
    event.preventDefault();
    activeModuleIndex = Number(moduleCard.dataset.moduleIndex);
    renderLiveModules();
    renderModulePreview();
    document.querySelector("#preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const sizeButton = event.target.closest("[data-preview-size]");
  if (sizeButton) {
    activePreviewSize = sizeButton.dataset.previewSize;
    renderModulePreview();
  }
});

document.addEventListener("change", (event) => {
  const moduleSelect = event.target.closest("#previewModuleSelect");
  if (moduleSelect) {
    activeModuleIndex = Number(moduleSelect.value);
    renderModulePreview();
    return;
  }

  const roleSelect = event.target.closest("#roleProfileSelect");
  if (!roleSelect) return;
  activeRoleKey = roleSelect.value;
  localStorage.setItem(roleStorageKey, activeRoleKey);
  ensureActiveModuleAllowed();
  renderRoleLogin();
  renderLiveModules();
  renderPlannedModules();
  renderAccessModel();
  renderLoginRoles();
  renderSignals();
  renderModulePreview();
});

setupHamburger();
renderRoleLogin();
renderLiveModules();
renderPlannedModules();
renderRecentUpdates();
renderAccessModel();
renderLoginRoles();
renderSignals();
renderModulePreview();
