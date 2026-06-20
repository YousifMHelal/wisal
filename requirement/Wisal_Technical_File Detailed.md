## **WISAL** 

Patient Experience Call Center 

Tender No. PR-00786 

## **TECHNICAL FILE** 

Architecture · Components · Features · Delivery & Support Team 

20 June 2026 

**C O N F I D E N T I A L** 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

## **01  Solution Architecture** 

## **Architecture Overview** 

Wisal is structured as six layers, each with a single responsibility. Data and decisions flow top to bottom: a beneficiary reaches Wisal through any channel, the integration layer resolves identity and connects to external systems, the intelligence layer understands the request and decides what to do, the core platform stores and updates beneficiary data, the governance dashboard makes all of this visible and auditable, and the sovereign infrastructure layer guarantees where and how everything runs. 

20 June 2026 · Version 2.0 

Page 2 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

This is not six independent systems stitched together — it is one platform with clean separation of concerns, so a change in one layer (a new channel, a new agent type, a new compliance rule) does not require rebuilding the others. Section 02 explains every individual component shown in the diagram above; Section 03 describes the resulting features and capabilities from a beneficiary and operator point of view. 

## **02  Architecture Component Reference** 

Every labeled box in the Solution Architecture diagram is documented below, organized by layer in the order data flows through the system. 

## **Access Channels — Omnichannel Layer** 

The seven entry points through which a beneficiary can reach Wisal, built on the Digital Government Authority's three-tier channel model (DGA-1-2-4-208). 

## **Voice   DID / DOD / IVR** 

Unified inbound number (DID) with outbound calling capability (DOD), backed by an IVR layer that understands free speech rather than forcing beneficiaries through rigid touch-tone menus. This is the highest-volume channel for a population-scale health call center and the one most directly measured against the RFP's Service Level and Abandoned Calls targets. 

## **Live Chat   Web / App / Social** 

A single chat experience unified across the web portal, the mobile app, and every social messaging surface (Facebook Messenger, X DM, LinkedIn DM). A beneficiary typing into any of these reaches the same conversation engine and the same case record. 

## **WhatsApp   Meta verified** 

A Meta-verified WhatsApp Business number, the channel most Saudi beneficiaries already use daily. Supports two-way messaging, automated responses, and human handoff without losing conversation context. 

## **Sign Language Video   Video interpreter** 

Live video calling routed to a qualified human sign-language interpreter through the same unified queue as voice and chat. This channel is mandated as critical-tier under the DGA standard; ensuring Deaf and hard-of-hearing beneficiaries reach a real interpreter, not a fallback text channel, is treated as core scope rather than an optional add-on. 

## **Mobile App   Self-service** 

A dedicated mobile application offering self-service booking, rescheduling, and status checks, plus push notifications for outbound reminders. The app shares the same backend case identity as every other channel. 

## **Email   SLA tracked** 

A monitored inbox with enforced response-time SLAs, used for beneficiaries who prefer written correspondence or need to attach documents. 

## **X / Facebook   Public + DM** 

Public mention monitoring and direct-message handling on both platforms, covering beneficiaries who reach out through social channels rather than dedicated apps. 

20 June 2026 · Version 2.0 

Page 3 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

## **Cross-Channel Continuity** 

A single case identity is created the moment a beneficiary's identity is resolved (see Identity Resolution, Section 02 — Intelligence Layer) and persists if they move between channels mid-interaction. A beneficiary who starts a request on WhatsApp and later calls does not repeat themselves; the agent or bot picks up exactly where the last channel left off. 

## **Integration Layer — Central API Management** 

Every connection between Wisal and the outside world passes through this layer — never directly between a channel or agent and a backend system. The RFP is explicit on this point: no point-to-point integrations are permitted outside it. 

## **API Gateway   REST · FHIR · HL7 v2** 

The single point through which every external call enters or leaves Wisal. Enforces the integration standards named in the RFP — REST APIs as the default, FHIR where the data is clinical, HL7 v2 for legacy health-system interfaces — so every consumer of the API sees one consistent contract regardless of what sits behind it. 

## **Integration Matrix   Sync + event-driven, no point-to-point** 

A maintained map of every integration: which system owns which endpoint, who is responsible for building and maintaining each interface, and whether the pattern is synchronous (request/response, used for real-time lookups like checking an appointment slot) or event-driven (asynchronous, used for things like a completed call triggering a CRM update). This matrix is what makes “no point-to-point integration” enforceable rather than aspirational — if it is not in the matrix, it does not get built. 

## **External Systems   Nafath · Mawid · Sehhaty · HR** 

Governed connections to the national identity verification platform (Nafath), national appointment and health-record platforms (Mawid, Sehhaty), and HHC's own HR systems for workforce data. Each connection is a defined interface in the Integration Matrix, not a custom one-off integration. 

## **Tenant Routing   Per-cluster logical isolation** 

Routes every request to the correct HHC cluster's logically isolated data partition. Even though all 20 clusters share the same platform, one cluster's beneficiary data, agents, and reports are never visible to another — enforced at this layer, not left to application-level discipline. 

## **Intelligence Layer** 

This is where Wisal decides what to do, not just what to say. The whole layer operates inside a single governance boundary, shown as the dashed border in the diagram: every component below — understanding, decision, action — is subject to the same forbidden-intent rules, kill-switch authority, clinical-content approval workflow, and continuous drift monitoring. Nothing in this layer acts outside that boundary. 

## **Understanding** 

## **Identity Resolution** 

The first thing that happens on contact: a match against Iqama records, Nafath verification, or an existing CRM profile. The result of this match assigns the beneficiary's adaptive tier (see Wisal Adaptive Intelligence, Section 03) and creates the single case identity that follows them across channels. 

20 June 2026 · Version 2.0 

Page 4 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

## **Arabic NLU** 

Natural language understanding tuned specifically for Saudi dialect variation — Najdi, Hijazi, Janoubi/Asiri, and Gulf-shared forms — rather than a generic Modern Standard Arabic model. Extracts both the intent (what the beneficiary wants) and entities (dates, names, service types) from what they say or type. 

## **Speech-to-Text** 

Converts live voice to text in real time. One transcription pipeline feeds two consumers simultaneously: the Arabic NLU engine (to understand intent) and the Sentiment Signal component (to analyze tone). 

## **Sentiment Signal** 

Combines two independent measurements — sentiment from word choice and phrasing, and emotion from voice pitch and pace — and cross-checks them against each other. Text alone misses tone; voice alone misses explicit complaint language. Using both catches what either one would miss alone. 

## **Orchestrator** 

The decision point of the entire system. The orchestrator receives the understood intent, the resolved identity, and the assigned adaptive tier, and decides which agentic unit should handle the request — using the AI-based contextual routing mode the DGA standard names explicitly. The orchestrator does not generate responses itself; its only job is routing the right request to the right unit, every time, on the basis of what was actually said and who actually said it. 

## **Agentic Execution Units** 

## **Booking Agent** 

Handles appointment scheduling, rescheduling, and status checks end to end. When confidence is high enough, it completes the transaction without involving a human agent at all — this is the unit doing the actual work behind the RFP's appointment-management objective. 

## **Campaign Agent** 

Runs outbound contact: appointment reminders, rescheduling nudges when a slot is at risk, and post-visit satisfaction surveys. This is the mechanism behind demand suppression — every reminder that prevents a missed appointment or a follow-up call is volume that never has to be absorbed by the inbound channels. 

## **Knowledge / FAQ Agent** 

Answers informational questions by retrieving from the versioned, bilingual knowledge base rather than generating clinical content freely at inference time. This distinction matters: a beneficiary asking “what are your Ramadan hours” gets a retrieved, pre-approved answer, not an improvised one. 

## **Escalation / Triage Agent** 

Runs the Tier 2 (clinical context) and Tier 3 (caregiver mode) adaptive logic described in Section 03, and is the only unit authorized to hand a case to a human agent under the fail-closed rule — meaning when it is uncertain whether disclosure is appropriate, it always chooses not to disclose and always escalates. 

## **Action & Output** 

## **Text-to-Speech** 

Converts the chosen agent's response into natural voice output for voice channels, with pacing and formality adjusted according to the beneficiary's active adaptive tier. 

20 June 2026 · Version 2.0 

Page 5 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

## **Call Whispering** 

Feeds real-time, inaudible guidance to a human agent during a live call — the beneficiary's adaptive-tier context, a suggested next response, or relevant knowledge-base content — without ever interrupting the conversation the agent is having. 

## **Agent Assist** 

Surfaces next-best-action and next-best-response prompts directly on the human agent's screen, generated from the same understanding layer the autonomous bot itself uses, so a human-handled case benefits from the same intelligence as a bot-handled one. 

## **CRM Write-Back** 

Every action, whether taken by an agentic unit or a human agent, closes the loop by updating the case record and writing an audit log entry. Nothing that happens inside the intelligence layer goes unrecorded — this is what makes the Governance & Compliance dashboard module (Section 02 — Governance) possible at all. 

## **Core Platform — Data Layer** 

The system of record that every agentic unit reads from and writes to, and that the governance dashboard reports from. 

## **360° Beneficiary CRM** 

The complete beneficiary record: demographic data, full interaction history across every channel, active case flags, consent status, and a complete audit trail. This is what Identity Resolution queries the instant a beneficiary makes contact. 

## **Case Management** 

Tracks complaints and service requests from creation through resolution, with internal SLA enforcement and defined escalation paths. Includes the versioned, bilingual knowledge base the Knowledge/FAQ Agent retrieves from. 

## **Campaign Records** 

Stores the history and results of every outbound campaign the Campaign Agent runs — reminder delivery, survey responses, outbound call outcomes — and maintains the consent-gated contact list that determines who can be contacted and how. 

## **Workforce Management** 

Demand-based agent scheduling, performance management data, and integration with HHC's HR systems for attendance, payroll, and incentive calculation. 

## **Governance & Analytics — Wisal Command Center** 

A dashboard is only useful if it answers a question someone actually has. Wisal's Command Center is organized around five modules, each tied to a specific question HHC leadership, compliance, or operations will actually ask. 

## **Live Operations** 

A national heatmap of all 20 clusters color-coded by live SLA status, a channel-by-channel volume and wait-time view, an auto-surfaced incident feed ranked by severity, and a single composite gauge for today versus target. 

20 June 2026 · Version 2.0 

Page 6 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

_**Solves:** “Is everything okay right now, across the whole Kingdom, without me checking 20 separate screens?”_ 

## **Wisal Intelligence** 

Live breakdown of how often each adaptive tier triggers and how often Tier 1 assumptions self-correct mid-call, the AI-versus-human resolution split, drift tracking broken out by cluster and dialect, and killswitch status. 

_**Solves:** “Is the AI actually behaving the way we were told it would — and does it know when it's wrong?”_ 

## **Governance & Compliance** 

A searchable log of every AI-generated response that touched clinical content and its approval status, every Tier 3 disclosure decision cross-referenced against consent records, and every forbidden-intent match with what Wisal did about it. 

_**Solves:** “If a regulator or auditor asks us to prove this system is compliant, can we show them in minutes, not weeks?”_ 

## **Workforce & Quality** 

Per-agent performance grid, live staffing versus forecasted demand, an AI-flagged QA sampling queue that prioritizes the interactions worth reviewing, and a tracker linking training completions to subsequent quality scores. 

_**Solves:** “Are we staffed correctly, and is our quality team reviewing the calls that actually need review — not just a random sample?”_ 

## **Executive Rollup** 

The committed KPI scorecard against target, a cluster ranking to identify where attention is needed, a savings and efficiency tracker tied to the RFP's required savings methodology, and a plain-language summary of beneficiary feedback themes. 

_**Solves:** “In five minutes on a Monday morning, can I see whether this program is working and where the money is going?”_ 

## **Sovereign Infrastructure** 

## **Hosted in Saudi Arabia** 

Wisal's AI is hosted and runs locally within Saudi Arabia, compliant with DGA, NCA, NDMO, and PDPL — no cross-border data flow for any beneficiary data or AI processing. 

20 June 2026 · Version 2.0 

Page 7 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

## **Regulatory Compliance** 

Built to DGA's contact-center standard, NCA's cybersecurity controls, NDMO's data governance framework, and PDPL's data protection requirements as native design constraints, not retrofitted afterward. 

## **Decentralized Operations** 

One platform backbone serving all 20 HHC clusters, each operating semi-autonomously with its own queue, agents, and SLA view — mirroring HHC's own Centralized Technology / Decentralized Operations model. 

## **High Availability** 

24/7 operation targeting 99.9999% availability, the benchmark set by the DGA standard. 

## **03  System Features & Capabilities** 

Where Section 02 explains what each architectural component is, this section describes what the resulting system actually does — organized by the capability a beneficiary, agent, or administrator experiences. 

## **Omnichannel Communication** 

## **Critical Tier — Always Available** 

|**Channel**|**Capability**|
|---|---|
|Self-Service Electronic Platform|Appointment booking and rescheduling, results inquiry, complaint submission —<br>fully integrated with the unified inbox.|
|Live Chat (Web, App, all social<br>DMs)|Unified across X DM, Facebook Messenger, LinkedIn DM, WhatsApp, and in-<br>app/web chat.|
|Sign Language Video Calls|Qualified human interpreters, routed through the same unified queue as voice and<br>chat.|



## **High Tier — Minimum Three Required** 

|**Channel**|**Capability**|
|---|---|
|Mobile App|Self-service, push notifications, and full channel-switch continuity.|
|Voice (DID/DOD)|Unified inbound number with outbound campaign capability.|
|IVR Self-Service|Automated menu navigation plus AI-driven free-speech understanding.|



## **Important Tier — Minimum One Required** 

|**Channel**|**Capability**|
|---|---|
|WhatsApp Business (Meta-verified)|Two-way messaging, outbound campaigns, automated and human handoff.|
|Email|Unified inbox with SLA-tracked response.|
|X / Facebook|Public mention handling plus direct messages.|



20 June 2026 · Version 2.0 

Page 8 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

## **CRM & Case Management** 

|**Capability**|**Description**|
|---|---|
|360° Beneficiary Profile|Demographic data, full interaction history, active case flags, consent status,<br>and complete audit trail.|
|Case & Complaint Management|Internal SLA enforcement, defined escalation paths, full status tracking.|
|Knowledge Base|Versioned, bilingual (Arabic/English), scheduled publish/unpublish, role-based<br>publishing rights.|
|Outbound Campaign Engine|Appointment reminders, proactive rescheduling, satisfaction surveys,<br>awareness campaigns — with measurable campaign results.|
|Consent & Privacy Management|PDPL-aligned consent tracking with full audit trail of every data access event.|



## **Wisal Adaptive Intelligence — Flagship Capability** 

The moment a beneficiary's Iqama or National ID is captured, Wisal reshapes how it interacts with that specific person for the rest of the contact, across three auditable, self-correcting tiers. 

|**Tier**|**Trigger**|**What Changes**|**Guardrail**|
|---|---|---|---|
|Tier 1:<br>Demographic|Date of birth and gender on<br>file|Speech rate, formality register,<br>menu depth, and default channel<br>offered.|Self-corrects mid-call if the<br>caller's behavior contradicts the<br>initial assumption.|
|Tier 2: Clinical<br>Context|Active case or admission<br>flag in the 360° profile|Empathy register increases,<br>escalation threshold drops, AI<br>stays narrowly on the contact<br>reason.|Must not over-trigger on routine,<br>stable chronic-care records.|
|Tier 3: Caregiver<br>Mode|Voice-age mismatch vs.<br>patient of record, or explicit<br>self-declaration|Third-party consent flow; confirms<br>relationship before any clinical<br>disclosure; logs the interaction.|Fail-closed: ambiguous proxy<br>confirmation → Wisal withholds<br>all protected health information,<br>escalates to a human agent.|



## **Child-safety guardrail (cross-cutting):** 

An inferred-minor caller increases Wisal's caution — never relaxes it. Wisal provides no autonomous medical guidance to a minor without a confirmed adult on the line, and automatically escalates to a human agent. 

## **Conversational AI** 

|**Capability**|**Description**|
|---|---|
|Chatbot & Voicebot|Intent classification and free-text understanding; automated execution of<br>routine transactions — booking, status checks, FAQs.|
|Arabic-First NLU/NLG|Tuned for Saudi dialect variation across clusters; cross-checked against Iqama<br>nationality data for expatriate-language routing.|
|Speech-to-Text / Text-to-Speech|Full voice-to-text and text-to-voice integration, supporting free-speech<br>automated response.|



20 June 2026 · Version 2.0 

Page 9 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

|**Capability**|**Description**|
|---|---|
|Governance Guardrails|Forbidden-intent list, clinical-content approval workflow, kill switch, continuous<br>drift monitoring.|



## **Workforce & Performance Management** 

|**Capability**|**Description**|
|---|---|
|Workforce Management|Demand-pattern-based shift scheduling and rescheduling, leave integration,<br>shift swapping between agents.|
|Performance Management|Per-agent, per-team, and per-cluster targets with red/amber/green visual<br>indicators, linked to QA results and CSAT.|
|HR System Integration|Attendance, payroll, and incentive linkage.|



## **Infrastructure & Compliance** 

|**Capability**|**Description**|
|---|---|
|KSA Data Residency|All data hosted and processed within Saudi Arabia, aligned with DGA, PDPL,<br>and NCA requirements.|
|Logical Tenant Isolation|Per-cluster data separation within the multi-tenant model.|
|Integration Standards|REST APIs, FHIR where applicable, HL7 v2, centralized API management —<br>no point-to-point integrations.|
|Network & Voice|SIP trunk / E1 with dual-path redundancy; disaster recovery with channel-<br>specific RPO/RTO tiers.|
|High Availability|24/7 operation, targeting the DGA's 99.9999% availability benchmark.|



## **Committed Performance Targets** 

|**KPI**|**Target**|**Source**|
|---|---|---|
|Conversational AI Completion Rate|≥ 80% (phased by cluster maturity)|DGA Standard|
|Conversational AI Error Rate|< 1%|DGA Standard|
|Service Level|80% / 20 seconds|HHC Appendix 1.ii|
|First Contact Resolution|≥ 90%|HHC Appendix 1.ii|
|Customer Satisfaction|≥ 95%|DGA Standard|
|Agent Recruitment Time|10 working days|DGA Standard|
|System Availability|99.9999%|DGA Standard|



## **04  Technical Team** 

Wisal is delivered by two teams with distinct mandates: a delivery team that designs, builds, and launches the platform, and a run team that operates and supports it for the life of the contract. The delivery team hands off to the run team at go-live, with an overlap period to transfer operational knowledge. 

20 June 2026 · Version 2.0 

Page 10 

Wisal — Patient Experience Call Center · Technical File 

**CONFIDENTIAL** 

## **Delivery Team — Build Phase** 

|**Role**|**Responsibility**|
|---|---|
|Project Director|Owns the overall delivery commitment to HHC — scope, schedule, budget, and<br>the single point of executive accountability for the program.|
|Solution Architect|Owns the end-to-end architecture shown in Section 01 — the layer model, the<br>integration design, and every cross-cutting technical decision.|
|AI / NLP Engineering Lead|Owns the intelligence layer: Arabic NLU tuning, the orchestrator's routing logic, the<br>adaptive intelligence tiers, and all governance guardrails (forbidden-intent list, kill<br>switch, drift monitoring).|
|Conversational AI Engineers (x2-3)|Build and tune the agentic execution units — Booking, Campaign,<br>Knowledge/FAQ, and Escalation/Triage agents — and the STT/TTS pipeline.|
|Integration Engineers (x2)|Build and maintain the API Gateway, the Integration Matrix, and every external<br>system connection (Nafath, Mawid, Sehhaty, HR systems).|
|CRM / Platform Engineers (x2)|Build the 360° Beneficiary CRM, Case Management, Campaign Records, and<br>Workforce Management modules.|
|Dashboard & Analytics Engineer|Builds the five Wisal Command Center modules and the underlying reporting<br>pipeline.|
|QA / Test Lead|Owns test planning and execution across every module, including the adaptive-tier<br>guardrail testing and the fail-closed Tier 3 logic specifically.|
|DevOps / Infrastructure Engineer|Owns KSA-hosted deployment, the sovereign infrastructure layer, disaster<br>recovery configuration, and CI/CD pipelines.|
|UX / Conversation Designer|Designs the conversation flows for every channel and writes the tone/register<br>variations used by the adaptive intelligence tiers.|



## **Run Team — Post-Launch Operations** 

|**Role**|**Responsibility**|
|---|---|
|Technical Operations Manager|Single point of accountability for platform uptime, incident response, and the<br>technical relationship with HHC after go-live.|
|AI Operations Specialist|Monitors the Wisal Intelligence dashboard module daily — drift trends, adaptive-<br>tier trigger rates, kill-switch status — and initiates retraining or correction when<br>thresholds are crossed.|
|Integration Support Engineer|Maintains the Integration Matrix as HHC's external systems evolve, and resolves<br>integration incidents.|
|Platform Support Engineer (x2,<br>follow-the-sun rotation)|Handles day-to-day technical support tickets, monitors infrastructure health, and<br>escalates to specialist roles when needed.|
|Compliance & Governance Analyst|Owns the Governance & Compliance dashboard module — reviewing the medical-<br>content approval log, the consent and disclosure audit trail, and preparing<br>compliance packs on request.|



## **Handoff & Continuity** 

The delivery team remains engaged through a defined transition period after go-live, during which the run team shadows live operations before assuming full responsibility. This avoids the common failure mode where the people who understand a system's design are not the people operating it once it is live. 

20 June 2026 · Version 2.0 

Page 11 

