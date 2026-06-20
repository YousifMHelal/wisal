**WISAL COMMAND CENTER** Admin Dashboard — Design Specification 

## **FOR FIGMA DESIGN TEAM** 

Modules · Sub-Modules · Monitored Data · Interactions 

20 June 2026 

**C O N F I D E N T I A L** 

Wisal Command Center · Design Specification 

**CONFIDENTIAL** 

## **00  Purpose & Navigation Model** 

This document specifies how an HHC administrator sees and operates the Wisal Command Center — every module, every sub-module within it, what each one monitors, and how an admin interacts with it. It is intended as the working reference for screen design, not a visual mockup. 

## **Navigation Model** 

The dashboard uses a persistent sidebar navigation — one module visible at a time, not a single long scrolling page. An admin always has all five modules one click away, and always knows which one they are currently in. 

## **Persistent Sidebar (left, always visible)** 

- Product mark at the top. 

- Five module entries, each with an icon, a label, and a live status dot (green / amber / red) reflecting that module's current worst condition — so an admin can tell something needs attention without opening it. 

- The five entries, top to bottom: Live Operations, Wisal Intelligence, Governance & Compliance, Workforce & Quality, Executive Rollup. 

## **Persistent Top Bar (always visible, inside the main content area)** 

- Cluster selector — defaults to “All Clusters” (national view); switching to a named cluster filters every widget on the current module to that cluster only. 

- Date / time range selector — Live, Today, 7 Days, 30 Days, Custom range. 

- Global search — searches case IDs, agent names, and cluster names across modules. 

- Admin account menu — profile, role/permissions indicator, sign out. 

## **Main Content Area** 

Changes completely based on which sidebar module is selected. Each module's content area is organized as a vertical stack of sub-module widgets, described in full below. Within a module, an admin scrolls; between modules, an admin clicks the sidebar. 

## **01  Module: Live Operations** 

_The default landing view on login. Answers: is everything okay right now, across the whole Kingdom, without checking 20 separate screens?_ 

## **National SLA Heatmap MAP WIDGET** 

**Monitors:** All 20 HHC clusters plotted on a map of Saudi Arabia, each cluster shaded green/amber/red according to live Service Level performance (target: 80% of calls answered within 20 seconds). Tooltip on hover shows the cluster name, current Service Level %, and call volume. 

_**Interactions:** Clicking a cluster filters the entire dashboard (all modules) to that cluster, equivalent to using the top-bar cluster selector._ 

Page 2 

20 June 2026 · Version 1.0 

Wisal Command Center · Design Specification 

**CONFIDENTIAL** 

## **Channel Pulse STATUS STRIP** 

**Monitors:** A horizontal row of cards, one per channel (Voice, WhatsApp, Live Chat, Email, Sign Language Video, Social). Each card shows current volume, average wait time, and a status color. 

_**Interactions:** Clicking a channel card opens a filtered view of Active Incidents Feed scoped to that channel only._ 

## **Active Incidents Feed RANKED LIST** 

**Monitors:** Auto-surfaced anomalies, not raw alerts: a cluster breaching SLA, a channel down, an unusual spike in abandoned calls. Each entry shows severity (critical/warning), what triggered it, which cluster/channel, and how long it has been active. 

_**Interactions:** List is ranked by severity, not by time. Clicking an entry expands it inline to show the underlying metric trend; an admin can mark an incident as acknowledged._ 

## **Today vs Target COMPOSITE GAUGE CLUSTER** 

**Monitors:** One primary gauge showing today's overall performance against the day's combined KPI target, decomposed into individual gauges for Service Level, Abandoned Calls, AHT, and FCR on hover or click. 

_**Interactions:** Hovering any sub-gauge shows the exact number and target; the primary gauge is the only element visible by default to keep the view uncluttered._ 

## **02  Module: Wisal Intelligence** 

_The module that does not exist in a typical contact-center dashboard. Answers: is the AI actually behaving the way we were told it would — and does it know when it's wrong?_ 

## **Adaptive Tier Monitor TREND CHART + BREAKDOWN** 

**Monitors:** Percentage of interactions currently in Tier 1 (Demographic), Tier 2 (Clinical Context), and Tier 3 (Caregiver Mode), shown as a stacked trend line over the selected time range, plus the Tier 1 autocorrection rate — how often an initial demographic assumption was revised mid-call — shown as its own small trend. 

_**Interactions:** Clicking a tier band filters the chart to that tier only; the auto-correction rate has an info tooltip explaining what it means, since it is the least intuitive metric on the dashboard._ 

## **Caregiver Mode Audit RESTRICTED-ACCESS TABLE** 

**Monitors:** Every Tier 3 (Caregiver Mode) case: case ID, cluster, timestamp, whether the proxy was confirmed or remained ambiguous, and the resulting action (completed with consent vs. fail-closed handoff to a human agent). 

_**Interactions:** This table requires elevated permissions to view, distinct from the rest of the dashboard, since it touches PHI-adjacent decisions. Each row expands to the full audit trail entry for that case._ 

## **AI vs Human Resolution Split DONUT / FUNNEL** 

**Monitors:** What percentage of total volume Wisal fully resolved autonomously, partially resolved before handing off, or routed straight to a human agent — segmented by channel and by cluster. 

_**Interactions:** Toggling between donut (proportion) and funnel (volume at each stage) view; segment click filters by that resolution category across the rest of the module._ 

## **Drift Watch MULTI-LINE TREND + ALERT LIST** 

**Monitors:** NLU and intent-classification confidence over the last 7/30 days, broken out per cluster and per dialect. Automatic flags appear when confidence drops below a defined threshold (for example: “Jazan cluster dialect confidence down 6% this week — retraining recommended”). 

Page 3 

20 June 2026 · Version 1.0 

Wisal Command Center · Design Specification 

**CONFIDENTIAL** 

_**Interactions:** Each flagged alert is clickable and links to the specific cluster/dialect trend line that triggered it; alerts can be assigned to a team member directly from this view._ 

## **Kill Switch Panel STATUS CARD + CONTROL** 

**Monitors:** Current state (armed / active), the timestamp of the last time it was triggered (if ever), and which scope it currently covers (all AI, a specific channel, or a specific cluster). 

_**Interactions:** The manual override control is restricted to authorized HHC and platform administrators only, and requires a confirmation step before activation — this is a deliberately heavy-handed interaction, not a casual toggle._ 

## **03  Module: Governance & Compliance** 

_Built for risk and compliance reviewers, not day-to-day operators. Answers: if a regulator or auditor asks us to prove this system is compliant, can we show them in minutes, not weeks?_ 

## **Medical Content Approval Log SEARCHABLE TABLE** 

**Monitors:** Every AI-generated response that touched clinical content: case ID, the content itself, approval status, who/what approved it, and the timestamp. 

_**Interactions:** Searchable by case ID, date range, or approval status; exportable as a filtered report for compliance packs._ 

## **Consent & Disclosure Audit SEARCHABLE TABLE** 

**Monitors:** Every Tier 3 disclosure decision, cross-referenced against the consent record on file at the time — this is the PDPL accountability trail. 

_**Interactions:** Same search/export behavior as the Medical Content Approval Log; rows link directly into the Caregiver Mode Audit sub-module in Module 02 for the full case context._ 

## **Forbidden-Intent Triggers LOG + TREND** 

**Monitors:** Every time a beneficiary's request matched a forbidden-intent pattern (for example, asking the bot for a diagnosis), what Wisal did in response, and a trend of how often this occurs over time. 

_**Interactions:** Trend line at the top, detailed log below it; clicking a spike in the trend filters the log to that date range._ 

## **Compliance Scorecard ROLLUP CARD GRID** 

**Monitors:** A single-page rollup of compliance status against NCA, PDPL, DGA, and NDMO requirements, refreshed periodically. 

_**Interactions:** Each card is exportable individually or as a complete compliance pack; cards link to the underlying logs that support each compliance claim._ 

## **04  Module: Workforce & Quality** 

_The operational management layer for supervisors. Answers: are we staffed correctly, and is our quality team reviewing the calls that actually need review — not just a random sample?_ 

## **Agent Performance Grid SORTABLE TABLE** 

**Monitors:** Per-agent AHT, FCR, QA score, and CSAT, color-coded red/amber/green, filterable by team or cluster. 

_**Interactions:** Sortable by any column; clicking an agent row opens their individual performance detail and recent interaction history._ 

Page 4 

20 June 2026 · Version 1.0 

Wisal Command Center · Design Specification 

**CONFIDENTIAL** 

## **Schedule & Coverage View CALENDAR / GANTT VIEW** 

**Monitors:** Live staffing levels against forecasted demand by hour and by cluster, plus pending shift-swap requests awaiting approval. 

_**Interactions:** Drag-and-drop is not required for v1; approving or rejecting a pending shift-swap request can be done inline from this view._ 

## **QA Sampling Queue PRIORITIZED LIST** 

**Monitors:** AI-flagged interactions for human QA review — prioritized by signals like low sentiment score or low bot confidence — so the quality team reviews what actually needs review instead of a random sample. 

_**Interactions:** Each item opens the full interaction transcript/recording alongside a scoring form; completed reviews are removed from the queue automatically._ 

## **Training Impact Tracker BEFORE/AFTER COMPARISON CHART** 

**Monitors:** Links recent training completions to subsequent QA score changes, per agent — showing whether training is actually moving quality metrics. 

_**Interactions:** Filterable by training module and by date range; clicking an agent shows their full training history alongside their score trend._ 

## **05  Module: Executive Rollup** 

_The five-minute Monday-morning briefing view. Answers: in five minutes, can I see whether this program is working and where the money is going?_ 

## **National KPI Scorecard CARD GRID** 

**Monitors:** The seven committed metrics (AI Completion Rate, AI Error Rate, Service Level, FCR, CSAT, Agent Recruitment Time, Availability), each shown this week versus target versus last week. 

_**Interactions:** Each card is clickable and opens the relevant detail view in the module that owns that metric (for example, clicking AI Completion Rate jumps to Wisal Intelligence)._ 

## **Cluster Ranking LEADERBOARD TABLE** 

**Monitors:** All 20 clusters ranked by a composite performance score, used to identify where investment or attention is needed. 

_**Interactions:** Sortable by individual KPI instead of the composite score; clicking a cluster filters the whole dashboard to it, same as the heatmap in Module 01._ 

## **Savings & Efficiency Tracker TREND CHART** 

**Monitors:** Estimated human-agent-hours saved by AI-resolved volume, trended over the contract period — tied directly to the RFP's required savings realization methodology. 

_**Interactions:** Hovering any point on the trend shows the underlying calculation (AI-resolved volume × average handle time saved); exportable for board-level reporting._ 

## **Beneficiary Voice THEME SUMMARY CARDS** 

**Monitors:** Top themes from complaints, feedback, and sentiment analysis, written in plain language and refreshed weekly — the one part of the dashboard designed for a non-technical reader. 

_**Interactions:** Each theme card expands to show representative (anonymized) examples and the trend of that theme over recent weeks._ 

Page 5 

20 June 2026 · Version 1.0 

Wisal Command Center · Design Specification 

**CONFIDENTIAL** 

_This specification covers module structure, sub-module content, monitored data, and interaction behavior for design purposes. Visual styling (colors beyond status semantics, typography, spacing, component library) is left to the Figma team's design system._ 

Page 6 

20 June 2026 · Version 1.0 

