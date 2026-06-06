const liveModules = [
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
    title: "Sales Console",
    status: "Imported prototype",
    href: "./modules/sales-console/index.html",
    summary: "Sales lead command center with heat scoring, funnel work queues, Brigham queue assignment, editable lead drawer, draft recommendations, and sales-team guide.",
    owner: "Sales and showroom",
    access: "Owner, sales, admins, managers",
    tone: "gold",
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
    title: "Shop Manager / Restoration Console",
    status: "Imported, needs live permissions",
    href: "./modules/shop-manager/index.html",
    summary: "Chris's restoration shop app for Piano Log pipeline, technician dashboards, floor-plan map, weekly planning, shopping lists, and live Google Sheets/Calendar sync.",
    owner: "Restoration shop and technicians",
    access: "Owner, Chris, shop admin, technicians",
    tone: "gold",
  },
  {
    title: "Piano Log & Inventory",
    status: "Live Google Sheet",
    href: "./modules/pianolog/index.html",
    summary: "Live piano inventory and restoration tracking source with Piano Log, restoration contracts, storage requests, Shopify export, image uploads, and product records.",
    owner: "Inventory, restoration, and showroom",
    access: "Owner, Chris, shop admin, inventory, marketing",
    tone: "gold",
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
    title: "BLP CRM",
    status: "Priority draft",
    href: "./modules/blp-crm/index.html",
    summary: "Central customer database for sales, tuning, teachers, moving, restoration, leads, accounting, marketing, and client portals, with imports from Gazelle, QBO, Agile, Google Sheets, and more.",
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
    title: "Inventory & Pricing Audits",
    status: "Priority draft",
    href: "./modules/inventory-pricing-audits/index.html",
    summary: "Audit center for piano inventory accuracy, Piano Log and Shopify comparisons, weekly pricing checks, margin review, stale listings, and correction queues.",
    owner: "Inventory and pricing control",
    access: "Owner, inventory, sales, marketing, shop admin, accounting",
    tone: "blue",
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
    title: "Team Culture",
    status: "Priority draft",
    href: "./modules/team-culture/index.html",
    summary: "People dashboard for values, recognition, team rituals, celebrations, feedback loops, internal stories, culture notes, and team-building initiatives.",
    owner: "People and culture",
    access: "Owner, Karmel, managers, admins, team leads",
    tone: "green",
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
    title: "Knowledge Vault",
    status: "Priority draft",
    href: "./modules/knowledge-vault/index.html",
    summary: "Training and source-truth dashboard for Obsidian and Drive knowledge, training records, policies, SOPs, approved answers, and agent source libraries.",
    owner: "Training and source truth",
    access: "Owner, Lindsay, managers, trainers, approved agents",
    tone: "blue",
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
];

const plannedModules = [];

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
    modules: ["Admin Task Board", "Agent Operations Console", "BLP CRM", "Client Dashboard", "Customer Service", "Knowledge Vault", "Onboarding & Training Portal", "Team Culture", "Team Meetings"],
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
    modules: ["Agent Operations Console", "Design Center", "Marketing Command Center", "Newsletters", "Research", "Social Sites", "VideoFlow Automation Studio", "Sales Console", "Piano Log & Inventory", "Inventory & Pricing Audits"],
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
    modules: ["Shop Manager / Restoration Console", "Restoration Pipeline", "Piano Restoration Training", "Technician Dashboards", "Piano Log & Inventory", "Inventory & Pricing Audits", "Warranty Tracking"],
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

const roadmap = [
  ["Collect", "Import each new app/codebase as its own module folder so nothing gets overwritten."],
  ["Inventory", "Document framework, data sources, permissions, and business purpose for every module."],
  ["Unify", "Choose the shared app shell, navigation, login model, design system, and data contracts."],
  ["Migrate", "Move modules into the shared platform one at a time with tests and stakeholder review."],
];

const snapshotStats = [
  ["Live modules", liveModules.length, "Imported and reachable from this command home."],
  ["Latest import", "VideoFlow", "Drive handoff and Next.js source are ready for setup."],
  ["Design direction", "1 + 3", "Executive showroom blended with bright staff usability."],
  ["Primary action", "Route work", "Human requests flow into agents, teams, and review queues."],
];

const operatingSignals = [
  ["Accounting", "Priority draft for QuickBooks, bill pay, payroll coordination, taxes, reconciliations, reports, and financial controls.", "Accounting Department"],
  ["Admin task board", "Trello-style board for admin and manager tasks, priorities, blockers, and follow-ups.", "Admin Task Board"],
  ["Agent console", "Live prototype for human-to-agent work routing.", "Agent Operations Console"],
  ["BLP CRM", "Priority draft for the shared customer database that connects every revenue stream.", "BLP CRM"],
  ["BrigGPT", "Priority draft for Brigham's expert piano knowledge, founder voice, avatar scripts, and cross-dashboard guidance.", "BrigGPT Console"],
  ["Building", "Priority draft for facility projects, maintenance, inspections, room readiness, repairs, vendors, budgets, and owner approvals.", "Building"],
  ["Client Dashboard", "Priority draft for customer-facing piano records, restoration updates, documents, approvals, and safe messages.", "Client Dashboard"],
  ["Customer Service", "Priority draft for calls, texts, emails, tickets, transcripts, follow-ups, and customer communication history.", "Customer Service"],
  ["Design Center", "Priority draft for brand assets, signs, web graphics, print pieces, templates, design requests, approvals, vendor handoffs, and production files.", "Design Center"],
  ["Executive Vision Board", "Priority draft for north-star goals, quarterly priorities, strategic projects, health metrics, decision logs, and owner approvals.", "Executive Vision Board"],
  ["Fleet", "Priority draft for vehicle records, maintenance, mileage, assignments, insurance, inspections, issues, incidents, and replacement planning.", "Fleet"],
  ["Holidays & Parties", "Priority draft for holidays, company parties, dates, budgets, vendors, invitations, assignments, approvals, and event follow-through.", "Holidays & Parties"],
  ["Inventory Audits", "Priority draft for Piano Log accuracy, Shopify listing hygiene, pricing checks, margin review, and correction queues.", "Inventory & Pricing Audits"],
  ["Knowledge Vault", "Priority draft for Obsidian and Drive knowledge, training records, policies, SOPs, approved answers, and agent source libraries.", "Knowledge Vault"],
  ["Marketing", "Imported command center for growth metrics, campaigns, and content planning.", "Marketing Command Center"],
  ["Newsletters", "Priority draft for customer and teacher newsletters, campaign calendars, story ideas, approvals, segments, send dates, and performance.", "Newsletters"],
  ["Onboarding", "Static prototype running with restored image assets.", "Onboarding & Training Portal"],
  ["Payroll", "Priority draft for time approvals, technician hours, commissions, pay period review, exceptions, and payroll-ready reports.", "Payroll"],
  ["Piano log", "Live Google Sheet connected as the inventory and restoration source.", "Piano Log & Inventory"],
  ["Profit First", "Priority draft for Profit First accounts, allocations, transfer rhythms, review dates, owner dashboards, exceptions, and financial health checkpoints.", "Profit First"],
  ["Recitals", "Priority draft for teacher CRM, student scheduling, venue planning, programs, reminders, media, payments, and family communication.", "Recitals"],
  ["Research", "Priority draft for market research, competitor tracking, product notes, opportunity briefs, pricing intelligence, and source-backed recommendations.", "Research"],
  ["Restoration", "Priority draft for estimates, approvals, rebuild stages, parts, photos, handoffs, and completion signals.", "Restoration Pipeline"],
  ["Restoration Training", "Priority draft for restoration skill modules, safety standards, practice assignments, mentor sign-offs, photo evidence, quality checks, and technician progression.", "Piano Restoration Training"],
  ["Sales Dashboard", "Imported sales console for lead queues, heat scoring, follow-up drafts, and showroom work.", "Sales Console"],
  ["Shop manager", "Imported and waiting on full live permissions.", "Shop Manager / Restoration Console"],
  ["Social Sites", "Priority draft for platform planning, post queues, content approvals, comment follow-up, platform health, growth signals, and cross-module handoffs.", "Social Sites"],
  ["Team Culture", "Priority draft for values, recognition, team rituals, celebrations, feedback loops, internal stories, culture notes, and team-building initiatives.", "Team Culture"],
  ["Team Meetings", "Priority draft for agendas, recurring rhythms, decisions, action items, attendance, follow-ups, and leadership review notes.", "Team Meetings"],
  ["Technicians", "Priority draft for field assignments, skills, training, service notes, and technician records.", "Technician Dashboards"],
  ["Tuning CRM", "Imported with live data bridge still to connect.", "Tuning CRM / Online Scheduling"],
  ["Uniforms", "Priority draft for team apparel inventory, sizing, ordering, assignments, replacement requests, vendor notes, and role-based policy details.", "Uniforms"],
  ["VideoFlow", "Source handoff received; needs .env.local, Supabase, and Google OAuth setup.", "VideoFlow Automation Studio"],
  ["Warranty", "Priority draft for warranty coverage, expiring records, claims, reminders, and contacts spreadsheet sync.", "Warranty Tracking"],
];

const teamStorageKey = "blpAdminTaskBoardTeam.v1";
const homeColumns = [
  ["intake", "Intake"],
  ["priority", "Priority"],
  ["progress", "In Progress"],
  ["waiting", "Waiting"],
  ["done", "Done"],
];

const defaultHomeTeamBoards = {
  brigham: {
    name: "Brigham",
    role: "Owner priorities",
    initials: "B",
    image: "https://www.brighamlarsonpianos.com/cdn/shop/files/Brigham.Larson.BW.jpg?v=1709675863&width=300",
    tasks: {
      intake: [["Review new operating module ideas", "Decide which future modules should become live prototypes first.", ["Owner", "Strategy"]]],
      priority: [["Set weekly company focus", "Choose the one priority that should guide admin, agents, and managers this week.", ["High", "Leadership"]]],
      progress: [["Approve operating system direction", "Review the unified BLP app shell and confirm the next design pass.", ["Review", "Product"]]],
      waiting: [["Feedback from leadership", "Waiting for notes on which dashboards should become production systems first.", ["Waiting", "Feedback"]]],
      done: [],
    },
  },
  karmel: {
    name: "Karmel",
    role: "Owner/admin priorities",
    initials: "K",
    image: "https://www.brighamlarsonpianos.com/cdn/shop/files/Copy_of_999A8339-Edit_e9215d62-9f45-4050-9554-f4e2f78cdfcb.jpg?v=1735944534&width=300",
    tasks: {
      intake: [["Collect module requests", "Capture new console ideas, missing data, and app feedback as they come in.", ["Intake", "Admin"]]],
      priority: [["Confirm task board workflow", "Decide whether this board should connect first to Notion, Google Sheets, or a database.", ["High", "Ops"]]],
      progress: [["Review live module links", "Check each mini-app link and note broken permissions or missing source data.", ["QA", "Modules"]]],
      waiting: [["Agent data responses", "Waiting on full OpenClaw and Hermes response data for active agent dashboards.", ["Agents", "Waiting"]]],
      done: [["Add Web App Home links", "Return links added across major imported modules.", ["Complete", "Navigation"]]],
    },
  },
  melissa: {
    name: "Melissa",
    role: "Client service priorities",
    initials: "M",
    image: "https://www.brighamlarsonpianos.com/cdn/shop/files/5U4A1257.jpg?v=1775246484&width=300",
    tasks: {
      intake: [["New customer follow-up", "Review incoming customer requests that need a same-day response.", ["Client", "Follow-up"]]],
      priority: [["Service handoff rhythm", "Define how customer-service tickets should route to tuning, sales, and shop.", ["High", "Tickets"]]],
      progress: [["Customer Service module plan", "Outline the SalesCaptain replacement workflow for calls, texts, emails, and tickets.", ["Planning", "CRM"]]],
      waiting: [],
      done: [],
    },
  },
  susie: {
    name: "Susie",
    role: "Office priorities",
    initials: "S",
    image: "",
    tasks: {
      intake: [["Front desk requests", "Collect scheduling, customer, and admin requests that need triage.", ["Office", "Intake"]]],
      priority: [["Daily communication queue", "Keep urgent client-facing messages from getting buried.", ["High", "Calls"]]],
      progress: [["Tuning CRM review", "Validate which fields the front desk needs on the tuning console.", ["Tuning", "Review"]]],
      waiting: [["Calendar permissions", "Waiting on full calendar/source access for live appointment data.", ["Calendar", "Waiting"]]],
      done: [],
    },
  },
  alisa: {
    name: "Alisa",
    role: "Admin priorities",
    initials: "A",
    image: "https://www.brighamlarsonpianos.com/cdn/shop/files/Alisa.Merrill.BW_1.jpg?v=1735949942&width=300",
    tasks: {
      intake: [["Document request", "Collect forms, checklists, and repeatable admin procedures for the Knowledge Vault.", ["Docs", "Process"]]],
      priority: [["Checklist cleanup", "Identify admin checklists that should move into the operating system.", ["High", "Systems"]]],
      progress: [],
      waiting: [["Source folder access", "Waiting on final Drive folder links for shared admin documents.", ["Drive", "Waiting"]]],
      done: [],
    },
  },
  ezzy: {
    name: "Ezzy",
    role: "Creative and media priorities",
    initials: "E",
    image: "https://www.brighamlarsonpianos.com/cdn/shop/files/Ezaray.Lopp.BW_cc6b4562-389e-4c78-b1fe-3dcd2590bd86.jpg?v=1777569159&width=300",
    tasks: {
      intake: [["Design request queue", "Capture graphics, social, newsletter, and signage requests.", ["Creative", "Intake"]]],
      priority: [["Design Center module outline", "Define what assets, approvals, and templates belong in the Design Center.", ["High", "Design"]]],
      progress: [["VideoFlow handoff", "Review video workflow source handoff and media queue needs.", ["Video", "Workflow"]]],
      waiting: [],
      done: [],
    },
  },
  doris: {
    name: "Doris",
    role: "Accounting priorities",
    initials: "D",
    image: "https://www.brighamlarsonpianos.com/cdn/shop/files/DORIS-BW_2.jpg?v=1735946727&width=300",
    tasks: {
      intake: [["Accounting requests", "Collect bill pay, payroll, taxes, and QuickBooks-related tasks.", ["Finance", "Intake"]]],
      priority: [["Accounting module requirements", "List the first QuickBooks, bill pay, payroll, and tax workflows to wire.", ["High", "QuickBooks"]]],
      progress: [["Profit First planning", "Shape the Profit First module into a practical review dashboard.", ["Finance", "Planning"]]],
      waiting: [["QuickBooks permissions", "Waiting on production access details before live integration work.", ["Waiting", "Access"]]],
      done: [],
    },
  },
};

let activeModuleIndex = 0;
let activePreviewSize = "desktop";
let activeHomeBoardKey = "brigham";

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;");
}

function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "T";
}

function loadHomeTeamBoards() {
  try {
    const stored = JSON.parse(localStorage.getItem(teamStorageKey) || "null");
    if (stored && typeof stored === "object" && Object.keys(stored).length) return stored;
  } catch (error) {
    console.warn("Could not load saved home team boards", error);
  }
  return defaultHomeTeamBoards;
}

function renderHomeTaskCard(task, column) {
  const [title, detail, tags = []] = task;
  const stateClass = column === "priority" ? " is-priority" : column === "waiting" ? " is-waiting" : column === "done" ? " is-done" : "";
  return `
    <div class="home-task-card${stateClass}">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(detail)}</p>
      ${tags[0] ? `<span>${escapeHtml(tags[0])}</span>` : ""}
    </div>
  `;
}

function renderHomeTeamBoard(key = activeHomeBoardKey) {
  const boards = loadHomeTeamBoards();
  const fallbackKey = Object.keys(boards)[0];
  const boardKey = boards[key] ? key : fallbackKey;
  const person = boards[boardKey];
  const switcher = document.querySelector("#homeTeamSwitcher");
  const kanban = document.querySelector("#homeKanban");
  if (!switcher || !kanban || !person) return;

  activeHomeBoardKey = boardKey;
  switcher.innerHTML = Object.entries(boards)
    .map(([personKey, board]) => `
      <button class="home-team-profile${personKey === boardKey ? " is-active" : ""}" type="button" data-home-board="${escapeAttribute(personKey)}">
        ${board.image
          ? `<img src="${escapeAttribute(board.image)}" alt="${escapeAttribute(board.name)}" loading="lazy" onload="if (!this.naturalWidth) { this.hidden = true; this.nextElementSibling.hidden = false; }" onerror="this.hidden = true; this.nextElementSibling.hidden = false;" />`
          : ""}
        <span class="home-initials-avatar"${board.image ? " hidden" : ""}>${escapeHtml(board.initials || getInitials(board.name))}</span>
        <span>${escapeHtml(board.name)}</span>
      </button>
    `)
    .join("");

  document.querySelector("#homeBoardTitle").textContent = `${person.name}'s operating board`;
  document.querySelector("#homeBoardRole").textContent = person.role || "Team priorities";
  kanban.innerHTML = homeColumns
    .map(([column, label]) => {
      const tasks = person.tasks?.[column] || [];
      return `
        <article class="home-kanban-column">
          <div class="home-column-title">
            <strong>${label}</strong>
            <span>${tasks.length}</span>
          </div>
          ${tasks.length
            ? tasks.map((task) => renderHomeTaskCard(task, column)).join("")
            : `<p class="home-task-empty">No ${column === "done" ? "completed" : label.toLowerCase()} tasks on this board yet.</p>`}
        </article>
      `;
    })
    .join("");
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

  select.innerHTML = roleProfiles
    .map((role) => `<option value="${role.key}" ${role.key === profile.key ? "selected" : ""}>${role.label}</option>`)
    .join("");

  if (description) description.textContent = profile.description;

  card.innerHTML = `
    <span>${profile.login}</span>
    <strong>${profile.label}</strong>
    <p>${allowedCount} module${allowedCount === 1 ? "" : "s"} visible in this role.</p>
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
            <span class="status">${module.status}</span>
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
  target.innerHTML = plannedModules
    .map(
      ([title, summary, owner]) => `
        <article class="module-card" data-tone="gold">
          <header>
            <div>
              <small>${owner}</small>
              <h4>${title}</h4>
            </div>
            <span class="status">Planned</span>
          </header>
          <p>${summary}</p>
        </article>
      `,
    )
    .join("");
}

function renderAccessModel() {
  const target = document.querySelector("#accessList");
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

function renderRoadmap() {
  const target = document.querySelector("#roadmapList");
  target.className = "roadmap-list";
  target.innerHTML = roadmap
    .map(
      ([title, description], index) => `
        <article class="roadmap-step">
          <span>${index + 1}</span>
          <strong>${title}</strong>
          <p>${description}</p>
        </article>
      `,
    )
    .join("");
}

function renderSnapshotStats() {
  const target = document.querySelector("#snapshotGrid");
  if (!target) return;
  target.innerHTML = snapshotStats
    .map(
      ([label, value, note]) => `
        <article class="snapshot-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <p>${note}</p>
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
    .filter(([, , moduleTitle]) => {
      const moduleIndex = liveModules.findIndex((module) => module.title === moduleTitle);
      return moduleIndex < 0 || allowedIndexes.includes(moduleIndex);
    })
    .map(
      ([title, detail, moduleTitle]) => {
        const moduleIndex = liveModules.findIndex((module) => module.title === moduleTitle);
        return `
        <article class="signal-item" ${moduleIndex >= 0 ? `data-module-index="${moduleIndex}"` : ""}>
          <div>
            <strong>${title}</strong>
            <span>${detail}</span>
          </div>
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
  const title = document.querySelector("#previewTitle");
  const owner = document.querySelector("#previewOwner");
  const status = document.querySelector("#previewStatus");
  const frame = document.querySelector("#moduleFrame");
  const openLink = document.querySelector("#previewOpenLink");

  if (!module || !preview || !title || !owner || !status || !frame || !openLink) return;

  preview.dataset.size = activePreviewSize;
  title.textContent = module.title;
  owner.textContent = module.owner;
  status.textContent = module.status;
  frame.title = module.title;
  frame.src = module.href;
  openLink.href = module.href;

  document.querySelectorAll("[data-preview-size]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.previewSize === activePreviewSize);
  });

  document.querySelectorAll(".signal-item[data-module-index]").forEach((item) => {
    item.classList.toggle("is-selected", Number(item.dataset.moduleIndex) === activeModuleIndex);
  });
}

document.addEventListener("click", (event) => {
  const homeBoardButton = event.target.closest("[data-home-board]");
  if (homeBoardButton) {
    renderHomeTeamBoard(homeBoardButton.dataset.homeBoard);
    return;
  }

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
  const roleSelect = event.target.closest("#roleProfileSelect");
  if (!roleSelect) return;
  activeRoleKey = roleSelect.value;
  localStorage.setItem(roleStorageKey, activeRoleKey);
  ensureActiveModuleAllowed();
  renderRoleLogin();
  renderLiveModules();
  renderAccessModel();
  renderLoginRoles();
  renderSignals();
  renderModulePreview();
});

renderSnapshotStats();
renderRoleLogin();
renderHomeTeamBoard();
renderLiveModules();
renderPlannedModules();
renderAccessModel();
renderLoginRoles();
renderSignals();
renderModulePreview();
