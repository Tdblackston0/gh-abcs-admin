# Research Brief: VBD Workshop Structural Best Practices

> **VBD Agenda Items:** All (structural)
> **Priority:** P0 (defines workshop format)
> **Researched:** April 2026
> **Status:** Ready for Phase 6

## Overview

### What is VBD (Value-Based Delivery)?

Value-Based Delivery (VBD) is Microsoft's framework for structuring partner and customer-facing technical engagements — including training workshops, implementation sessions, and advisory services — around **measurable business outcomes** rather than feature walkthroughs. VBD workshops are designed so that every module, lab, and discussion maps directly to a business value that the customer takes away.

**Key VBD principles:**
1. **Outcome-oriented** — Each session block ties to a tangible skill or configuration the attendee can immediately apply
2. **Hands-on emphasis** — Minimum 40-60% of session time is interactive (labs, demos, guided exercises)
3. **Assessment-driven** — Uses Understanding by Design (UBD) backward design: define desired outcomes → define evidence of learning → design learning plan [1]
4. **Modular structure** — Content organized in independent blocks that can be tailored to customer needs
5. **Feedback loops** — Built-in knowledge checks, real-time polls, and post-session assessments

### How VBD Applies to This Workshop

This 2-day, 3-hour/day, Level 300 GitHub Enterprise Cloud Admin Training workshop uses VBD principles to ensure administrators leave with **immediately actionable skills** for managing their GitHub Enterprise Cloud environment. Every module maps to a real administrative task (not abstract theory), and labs use the customer's actual GitHub environment where possible.

> **⚠️ Research Note:** The term "VBD" is used broadly within Microsoft Partner and Services organizations but has limited public documentation as a formalized framework. This brief synthesizes VBD principles from GitHub Expert Services offerings [2], Microsoft's What The Hack framework [3], Microsoft's workshop-template UBD approach [1], and general Microsoft Instructor-Led Training (ILT) best practices. Where VBD-specific documentation was unavailable, general Microsoft workshop standards and industry best practices for remote technical training are documented and noted.

---

## Workshop Format Standards

### VBD Template Structure

Based on analysis of GitHub Expert Services offerings [2][4][5], Microsoft What The Hack [3][6], and Microsoft Learning workshop templates [1][7], a VBD-aligned workshop follows this standard structure:

#### Standard VBD Workshop Sections

| Section | Purpose | Typical Duration |
|---------|---------|-----------------|
| **Pre-Workshop** | Prerequisites validation, environment setup, pre-assessment | Before Day 1 |
| **Opening / Welcome** | Logistics, introductions, agenda review, learning objectives | 10-15 min |
| **Context Setting** | Business case, why this matters, "what's in it for me" | 10-15 min |
| **Core Module** | Instructor-led content + guided demo | 20-30 min |
| **Hands-on Lab** | Guided or challenge-based exercise | 20-40 min |
| **Knowledge Check** | Quick quiz, poll, or discussion to verify understanding | 5-10 min |
| **Break** | Mandatory break (remote: every 60-75 min) | 10-15 min |
| **Repeat Core/Lab cycles** | Additional modules following same pattern | Varies |
| **Wrap-up / Q&A** | Summary, key takeaways, next steps, feedback collection | 10-15 min |
| **Post-Workshop** | Feedback survey, post-assessment, resource sharing | After session |

#### Backward Design (UBD) Framework

Microsoft's official workshop template uses **Understanding by Design (UBD)**, a backward design methodology [1]:

1. **Stage 1: Desired Results** — Define learning outcomes and takeaway skills
2. **Stage 2: Evidence** — Define how you'll know attendees achieved the outcomes (assessments, performance tasks, quizzes)
3. **Stage 3: Learning Plan** — Design the lesson milestones, labs, and activities that build toward the outcomes

This aligns perfectly with VBD: start with the business value → define measurable evidence → build the learning experience.

### Day Structure for 3-Hour Remote Sessions

Based on research into remote training cognitive load, engagement patterns, and GitHub's own delivery format (16-person class max, remote) [4]:

#### The 3-Hour Remote Session Blueprint

```
┌─────────────────────────────────────────────────────┐
│  HOUR 1 (60 min): Foundation + First Lab            │
│  ├── 0:00-0:10  Welcome / Agenda / Objectives       │
│  ├── 0:10-0:35  Module A: Instructor-Led + Demo     │
│  ├── 0:35-0:55  Lab A: Guided Hands-on Exercise     │
│  └── 0:55-1:00  Knowledge Check / Q&A               │
│                                                     │
│  ═══════ BREAK (10-15 min) ═══════                  │
│                                                     │
│  HOUR 2 (60 min): Deep Dive + Second Lab            │
│  ├── 1:15-1:40  Module B: Instructor-Led + Demo     │
│  ├── 1:40-2:05  Lab B: Challenge-Based Exercise     │
│  └── 2:05-2:15  Knowledge Check / Discussion        │
│                                                     │
│  ═══════ BREAK (5-10 min) ═══════                   │
│                                                     │
│  HOUR 3 (45-50 min): Advanced Topic + Wrap-up       │
│  ├── 2:25-2:45  Module C: Instructor-Led + Demo     │
│  ├── 2:45-3:05  Lab C / Guided Walkthrough          │
│  ├── 3:05-3:15  Day Summary / Q&A                   │
│  └── 3:15-3:20  Preview Next Session + Feedback     │
│                                                     │
│  Total: ~3 hours 20 min (including breaks)          │
│  OR: 3 hours flat with 2x 5-min micro-breaks        │
└─────────────────────────────────────────────────────┘
```

#### Timing Principles for Remote 3-Hour Sessions

| Principle | Recommendation | Source |
|-----------|---------------|--------|
| **Max continuous instruction** | 25-30 min before interaction | Cognitive load research |
| **Break frequency** | Every 60-75 min mandatory | Remote training best practice |
| **Break duration** | 10-15 min (minimum 5 min for micro-breaks) | Remote fatigue research |
| **Lab-to-lecture ratio** | Minimum 40% hands-on for L300 | VBD / GitHub Services pattern |
| **Max session length** | 3-3.5 hours with breaks | Attention span ceiling for remote |
| **Interaction cadence** | Every 10-15 min (poll, question, chat prompt) | Engagement research |

### Remote Delivery Considerations

#### Platform & Tools

Based on GitHub Expert Services delivery requirements [4][5] and Microsoft What The Hack virtual guidance [6]:

| Tool | Purpose | Notes |
|------|---------|-------|
| **Microsoft Teams / Zoom** | Primary session platform | GitHub Services uses Teams or customer platform |
| **Screen sharing** | Instructor demos, lab walkthroughs | Ensure high resolution; dual-monitor recommended for instructors |
| **Chat/Q&A panel** | Real-time questions, links, commands | Designate a co-facilitator to monitor chat |
| **Breakout rooms** | Small group lab collaboration | 3-5 per room; 1 coach per 5-10 participants [6] |
| **GitHub Codespaces** | Pre-configured lab environments | Eliminates "works on my machine" issues |
| **Polls (Slido, Teams polls)** | Knowledge checks, engagement | Use at start, middle, and end of each module |
| **Shared document/wiki** | Parking lot for questions, resource links | Teams channel or GitHub Discussion |

#### Remote Engagement Strategies

1. **Cameras-on policy** — Request (not mandate) cameras on; model this as instructor [6]
2. **Co-facilitator model** — Instructor teaches; co-facilitator monitors chat, manages breakout rooms, handles tech issues
3. **Chat waterfall technique** — Ask everyone to type their answer, then "send on 3" for simultaneous engagement
4. **Frequent interaction** — Poll, question, or chat prompt every 10-15 minutes minimum
5. **Name use** — Call on participants by name to maintain personal connection
6. **Lab buddy system** — Pair fast participants with slower ones in breakout rooms
7. **Standing desk breaks** — Encourage physical movement during breaks
8. **Pre-session tech check** — 15-min optional join for environment validation
9. **Async parking lot** — GitHub Discussion or Teams channel for questions between sessions

#### Class Size

GitHub Expert Services caps remote training classes at **16 participants maximum** [4][5]. For admin training specifically:
- **Optimal:** 8-12 participants (allows personal attention)
- **Maximum:** 16 participants (requires co-facilitator)
- **Minimum:** 4 participants (below this, convert to consulting engagement)

---

## Content Design Principles

### L300 Training Design

#### Microsoft Training Level Taxonomy

Microsoft uses a 100-400 level system that maps to audience expertise:

| Level | Name | Audience | Depth | Prerequisites |
|-------|------|----------|-------|---------------|
| **100** | Beginner | No prior experience | Conceptual overview, awareness | None |
| **200** | Intermediate | Some experience | Practical skills, guided exercises | Basic understanding of domain |
| **300** | **Advanced** | **Significant experience** | **Complex scenarios, troubleshooting, architecture decisions** | **Working knowledge of the platform; hands-on experience** |
| **400** | Expert | Deep expertise | Edge cases, internals, custom extensions, performance tuning | Extensive production experience |

Sources: GitHub Expert Services levels training offerings as Intermediate [200] and Advanced [300] [4][5][8]. Microsoft Learn uses Beginner/Intermediate/Advanced categorization [9]. The GHAS Rollout & Deployment Training is explicitly labeled "Advanced [300]" [8].

#### What Distinguishes L300 from L200 and L400

**L300 vs L200 (Intermediate):**
- L200 teaches "how to use it" → L300 teaches "how to use it well in complex environments"
- L200 assumes basic familiarity → L300 assumes hands-on operational experience
- L200 uses guided step-by-step labs → L300 uses challenge-based or scenario-driven labs
- L200 covers default configurations → L300 covers enterprise customization, policy design, edge cases
- L200 has one right answer → L300 explores trade-offs and architectural decisions

**L300 vs L400 (Expert):**
- L300 covers enterprise-scale operations → L400 covers platform internals, API deep dives, custom tooling
- L300 teaches best practices → L400 teaches how to extend/modify the platform
- L300 uses realistic scenarios → L400 uses production edge-case debugging
- L300 audience manages the platform → L400 audience builds on/extends the platform

#### L300 Audience Assumptions for This Workshop

Based on GitHub Admin Training [4] and GHAS Advanced Training [8] patterns:

**Attendees SHOULD already know:**
- GitHub.com navigation and basic repository operations
- Git fundamentals (clone, push, pull, branch, merge)
- Basic understanding of GitHub organizations and teams
- Awareness of authentication concepts (SSO, 2FA)
- Basic familiarity with GitHub Enterprise Cloud vs. Server

**Attendees WILL learn:**
- Enterprise hierarchy design and organization strategy
- Advanced IAM configuration (SAML SSO, SCIM, EMU trade-offs)
- Policy inheritance and governance at scale
- Repository governance and security-by-default patterns
- Audit, compliance, and billing management
- Advanced Actions, Copilot, and GHAS governance

#### L300 Content Design Patterns

1. **Scenario-based learning** — Present real-world enterprise scenarios, not feature tours
2. **Decision frameworks** — Teach "when to use X vs Y" rather than "how to enable X"
3. **Trade-off discussions** — Every configuration choice has trade-offs; discuss them explicitly
4. **Anti-patterns** — Show common mistakes and how to avoid/recover from them
5. **Reference architecture** — Provide a complete reference implementation attendees can adapt
6. **Troubleshooting walkthroughs** — Include "something went wrong" scenarios in labs

### Lab Design for Remote

#### Duration Estimation Framework

| Lab Type | Description | Estimated Duration | L300 Adjustment |
|----------|-------------|-------------------|-----------------|
| **Guided walkthrough** | Step-by-step with instructor | 15-20 min | Rarely used at L300 |
| **Guided exercise** | Steps provided, attendee executes | 20-30 min | Include decision points |
| **Challenge-based** | Goal stated, minimal guidance | 30-45 min | Primary format for L300 |
| **Scenario lab** | Multi-step realistic scenario | 45-60 min | Best for capstone exercises |

#### Lab Duration Estimation Formula

```
Base estimate = (Number of distinct steps) × 3 min/step
Remote overhead = Base × 1.3 (30% overhead for remote)
L300 audience = Remote × 0.85 (experienced users are faster)
Buffer = Result × 1.15 (15% buffer for troubleshooting)

Example: 8-step lab
  Base: 8 × 3 = 24 min
  Remote: 24 × 1.3 = 31 min
  L300: 31 × 0.85 = 26 min
  Buffer: 26 × 1.15 = 30 min → Allocate 30 minutes
```

#### Handling Fast/Slow Participants in Remote

| Strategy | Implementation |
|----------|---------------|
| **Stretch goals** | Every lab has a "bonus challenge" for fast finishers |
| **Tiered instructions** | Provide hints at 3 levels: (1) goal only, (2) approach hints, (3) step-by-step |
| **Buddy system** | Pair fast/slow in breakout rooms; fast finishers become peer coaches |
| **Async completion** | Labs designed so they can be finished post-session if needed |
| **Progress checkpoints** | Instructor checks in at defined milestones (not just at the end) |
| **Early-finish tasks** | "Explore" tasks that let fast finishers dig deeper without leaving the group behind |
| **Time-boxed labs** | Hard time limits; instructor does live walkthrough of remaining steps |

#### Lab Environment Strategy

For GitHub Enterprise Cloud Admin Training specifically:
- **Dedicated training GitHub Enterprise** — Pre-provisioned org with sample repos, teams, policies
- **Per-attendee accounts** — Each attendee has admin access to a sandboxed organization
- **Pre-configured scenarios** — Repos with deliberate misconfigurations for troubleshooting labs
- **GitHub Codespaces** — For any CLI/API exercises; eliminates local setup issues
- **Reset capability** — Instructor can reset lab environments between sessions

### Assessment Approaches

#### Assessment Framework for L300

| Phase | Assessment Type | Purpose | Format |
|-------|----------------|---------|--------|
| **Pre-workshop** (T-1 week) | **Self-assessment survey** | Gauge baseline, identify knowledge gaps, tailor content | 10-15 question survey (Likert scale + open) |
| **Pre-workshop** (T-1 week) | **Prerequisites checklist** | Ensure environment readiness | Checklist with verification steps |
| **During session** (every module) | **Knowledge checks** | Verify comprehension, identify confused attendees | 2-3 question polls (multiple choice) |
| **During session** (every lab) | **Lab completion verification** | Confirm hands-on skill acquisition | Instructor checks defined success criteria |
| **During session** (mid-point) | **Scenario discussion** | Test applied understanding | Open-ended: "What would you do if..." |
| **End of Day 1** | **Reflection prompt** | Self-assessment, surface questions for Day 2 | 1-2 open-ended questions |
| **End of Day 2** | **Capstone challenge** | Comprehensive skill demonstration | Multi-step scenario exercise |
| **Post-workshop** (T+1 day) | **Post-assessment quiz** | Measure knowledge gain vs pre-assessment | Mirror pre-assessment questions |
| **Post-workshop** (T+1 week) | **Feedback survey** | Evaluate delivery quality and content relevance | NPS + structured feedback form |
| **Post-workshop** (T+30 days) | **Follow-up check** | Measure actual adoption/application | Short survey on actions taken |

#### Pre-Assessment Design for L300

The pre-assessment serves two purposes:
1. **Validate L300 readiness** — Confirm attendees meet prerequisites
2. **Tailor content** — Identify which modules need more/less depth

Sample pre-assessment categories:
- GitHub Enterprise Cloud familiarity (1-5 scale)
- IAM/SSO configuration experience
- Organization management experience
- Security policy implementation experience
- API/automation experience
- Top 3 challenges they face as admins (open-ended)

#### In-Session Knowledge Checks

Design 2-3 questions per module using these patterns:
- **Scenario-based:** "Your CISO requires all repos to have branch protection. Which approach would you use?"
- **Trade-off:** "What are the implications of choosing EMU vs. personal accounts for SSO?"
- **Troubleshooting:** "A developer can't push to a protected branch. What's the most likely cause?"

Avoid simple recall questions ("What menu do you click to enable X?") — these are appropriate for L200, not L300.

---

## Required Workshop Deliverables

### Complete VBD Workshop Package Checklist

Based on GitHub Expert Services patterns [2][4], What The Hack author guide [7], and Microsoft workshop template [1]:

| Deliverable | Audience | Required? | Notes |
|-------------|----------|-----------|-------|
| **Workshop Agenda** | All | ✅ Required | Day-by-day, module-by-module timing |
| **Instructor Guide** | Instructor | ✅ Required | Talking points, timing, demo scripts, FAQ |
| **Slide Deck** | Instructor/Attendee | ✅ Required | Per-module presentation slides |
| **Lab Guides** | Attendee | ✅ Required | Step-by-step (L200) or challenge-based (L300) |
| **Lab Environment Setup** | Instructor | ✅ Required | Scripts/instructions to provision lab environments |
| **Pre-Assessment Survey** | Attendee | ✅ Required | Baseline knowledge gauge |
| **Prerequisites Document** | Attendee | ✅ Required | What to install/configure before Day 1 |
| **Post-Assessment Quiz** | Attendee | ✅ Required | Knowledge gain measurement |
| **Feedback Form** | Attendee | ✅ Required | Microsoft Forms or equivalent |
| **Reference Architecture** | Attendee | ✅ Required | Take-home reference document |
| **Resource Links Document** | Attendee | ✅ Required | Curated links to docs, guides, videos |
| **Coach/Co-facilitator Guide** | Co-facilitator | 🔶 Recommended | Lab hints, common issues, escalation path |
| **Solution Guide** | Instructor | 🔶 Recommended | Lab solutions for instructor reference |
| **Recording** | Attendee | 🔶 Recommended | Session recording for post-workshop review |
| **Certificate of Completion** | Attendee | ⬜ Optional | PDF certificate for L300 completion |
| **Follow-up Action Plan** | Attendee | ⬜ Optional | Personalized next-steps based on assessment |

### Instructor Guide Format

Based on synthesis of What The Hack Coach's Guide [7], Microsoft ILT patterns, and GitHub Expert Services delivery:

#### Instructor Guide Structure

```
📄 INSTRUCTOR-GUIDE.md (or PDF)

1. WORKSHOP OVERVIEW
   ├── Workshop title, level, duration
   ├── Target audience and prerequisites
   ├── Learning objectives (mapped to modules)
   └── Required materials and environment

2. PREPARATION CHECKLIST
   ├── T-2 weeks: Confirm attendee list, send pre-assessment
   ├── T-1 week: Provision lab environments, verify access
   ├── T-1 day: Tech check, final environment verification
   └── Day-of: 30 min early join for setup

3. MODULE GUIDES (per module)
   ├── Module title and learning objectives
   ├── Timing breakdown (start time, duration per section)
   ├── Talking points (key messages, NOT a script)
   ├── Demo script (step-by-step for live demos)
   ├── Slide references (slide numbers)
   ├── Lab guide reference and success criteria
   ├── Common questions and answers (FAQ)
   ├── Known blockers and workarounds
   ├── Transition to next module (bridge statement)
   └── Knowledge check questions and answers

4. LAB SOLUTIONS
   ├── Expected outcomes for each lab
   ├── Step-by-step solutions (for instructor reference)
   ├── Common failure modes and fixes
   └── "Fast finisher" bonus challenge solutions

5. FACILITATION NOTES
   ├── Remote delivery tips specific to this content
   ├── Pacing guidance (speed up/slow down signals)
   ├── Audience engagement techniques per module
   ├── How to handle off-topic questions
   └── Escalation path for unresolvable technical issues

6. APPENDIX
   ├── Environment setup/teardown scripts
   ├── Backup plan if labs fail (screenshots, video)
   ├── Attendee roster template
   └── Post-workshop report template
```

#### Talking Points vs. Scripts

For L300 workshops, the instructor guide should provide **talking points** (key messages and technical facts), NOT verbatim scripts. L300 instructors are subject matter experts who should adapt delivery to the audience. Include:

- **Key message:** The one thing the attendee must understand from this section
- **Supporting points:** 2-3 technical details that reinforce the key message
- **Demo callouts:** "While showing this, emphasize that..."
- **Common misconception:** "Attendees often think X, but actually Y"
- **Bridge:** "This connects to Module N where we'll cover..."

### Participant Prerequisites

#### What to Communicate Before the Workshop

Send **T-1 week minimum** (T-2 weeks preferred):

```
📋 PARTICIPANT PREREQUISITES

1. ACCOUNTS & ACCESS
   □ GitHub.com account (personal or EMU)
   □ Access to training GitHub Enterprise organization [link]
   □ Admin role verified in training organization
   □ Microsoft Teams / Zoom installed and tested

2. ENVIRONMENT SETUP
   □ Modern browser (Chrome, Edge, Firefox)
   □ GitHub CLI installed (gh version 2.x+)
   □ Git installed (git version 2.x+)
   □ Optional: VS Code with GitHub extensions

3. KNOWLEDGE PREREQUISITES
   □ Git basics (clone, push, pull, branch, merge)
   □ GitHub.com navigation (repos, issues, PRs)
   □ Basic understanding of SAML SSO concepts
   □ Familiarity with GitHub organizations
   □ Completed pre-assessment survey [link]

4. TIME COMMITMENT
   □ Day 1: [Date] [Time] - [Time] ([Timezone])
   □ Day 2: [Date] [Time] - [Time] ([Timezone])
   □ Optional pre-session tech check: [Date] [Time]
   □ Estimated 30-60 min pre-work (pre-assessment + setup)

5. WHAT TO BRING
   □ Your organization's GitHub admin questions
   □ Access to your production GitHub Enterprise (view-only, for reference)
   □ A second monitor is strongly recommended for remote labs
```

### Workshop Agenda Template

#### Example Agenda for 2-Day, 3hrs/Day Format

```
═══════════════════════════════════════════════════════
  GITHUB ENTERPRISE CLOUD ADMIN TRAINING (L300)
  2-Day Workshop | 3 Hours/Day | Remote Delivery
═══════════════════════════════════════════════════════

PRE-WORKSHOP (T-1 week)
  • Complete pre-assessment survey
  • Set up lab environment
  • Verify prerequisites

───────────────────────────────────────────────────────
DAY 1: Foundation & Identity
───────────────────────────────────────────────────────

  0:00 - 0:15  Welcome & Introductions
               • Instructor introduction
               • Participant introductions (name, role, #1 question)
               • Agenda & logistics overview
               • Learning objectives for Day 1

  0:15 - 0:45  Module 1: Enterprise Hierarchy & Org Strategy
               • Enterprise account architecture
               • Organization design patterns
               • Permission flow model
               • 💬 Discussion: Your current org structure

  0:45 - 1:05  🔬 Lab 1: Enterprise & Org Configuration
               • Review enterprise settings
               • Configure organization policies
               • Success criteria verification

  1:05 - 1:15  ═══ BREAK (10 min) ═══

  1:15 - 1:50  Module 2: Identity & Access Management
               • SAML SSO deep dive
               • SCIM provisioning
               • EMU vs. personal accounts (trade-offs)
               • 💬 Decision framework discussion

  1:50 - 2:15  🔬 Lab 2: IAM Configuration Challenge
               • Configure SSO (simulated)
               • Team sync patterns
               • Troubleshoot access issues

  2:15 - 2:25  ═══ BREAK (10 min) ═══

  2:25 - 2:50  Module 3: Teams, Permissions & Policy
               • Team architecture patterns
               • Permission inheritance model
               • Branch protection & rulesets
               • Repository governance

  2:50 - 3:10  🔬 Lab 3: Permission & Policy Setup
               • Design team hierarchy
               • Configure rulesets
               • Verify policy inheritance

  3:10 - 3:20  Day 1 Wrap-up
               • Key takeaways summary
               • Day 2 preview
               • Reflection: "What's your #1 takeaway?"
               • Homework: Review your org against patterns

───────────────────────────────────────────────────────
DAY 2: Security, Governance & Operations
───────────────────────────────────────────────────────

  0:00 - 0:10  Day 2 Kickoff
               • Day 1 recap (quick poll)
               • Questions from Day 1 / homework
               • Day 2 objectives

  0:10 - 0:40  Module 4: Security & Compliance
               • Security-by-default configuration
               • GHAS governance
               • Audit log & compliance
               • Secret scanning & push protection

  0:40 - 1:05  🔬 Lab 4: Security Configuration Challenge
               • Enable security defaults
               • Configure audit log streaming
               • Secret scanning policies

  1:05 - 1:15  ═══ BREAK (10 min) ═══

  1:15 - 1:45  Module 5: GitHub Copilot & Actions Governance
               • Copilot policy management
               • Actions allowed list & runner governance
               • Marketplace app management
               • Billing & license management

  1:45 - 2:10  🔬 Lab 5: Governance Configuration
               • Configure Copilot policies
               • Actions allow-list setup
               • Review billing dashboard

  2:10 - 2:20  ═══ BREAK (10 min) ═══

  2:20 - 2:50  Module 6: Operational Best Practices
               • Monitoring & alerting
               • Migration planning
               • Disaster recovery
               • Reference architecture walkthrough

  2:50 - 3:10  🔬 Capstone: Architecture Review Challenge
               • Review a reference architecture
               • Identify improvements
               • Present recommendations (small groups)

  3:10 - 3:25  Workshop Wrap-up
               • Complete key takeaways
               • Post-assessment quiz
               • Resource links & next steps
               • Feedback survey
               • Certificate of completion (if applicable)
```

### Feedback & Assessment

#### Post-Workshop Feedback Form Structure

Based on Microsoft Forms and GitHub Expert Services patterns:

| Section | Questions | Format |
|---------|-----------|--------|
| **Overall satisfaction** | "How would you rate this workshop overall?" | 1-5 stars |
| **Net Promoter Score** | "How likely are you to recommend this workshop?" | 0-10 NPS |
| **Content relevance** | "How relevant was the content to your role?" | 1-5 Likert |
| **Depth appropriate** | "Was the depth appropriate for your experience?" | Too basic / Just right / Too advanced |
| **Lab quality** | "How useful were the hands-on labs?" | 1-5 Likert |
| **Instructor quality** | "How effective was the instructor?" | 1-5 Likert |
| **Pace** | "How was the pace of the workshop?" | Too slow / Just right / Too fast |
| **Most valuable** | "What was the most valuable part?" | Open text |
| **Improve** | "What would you improve?" | Open text |
| **Missing topics** | "Were there topics you expected that weren't covered?" | Open text |
| **Apply** | "What will you apply in the next 30 days?" | Open text |
| **Additional training** | "What related topics would you like training on?" | Multi-select + open text |

---

## Example Workshop Structures

### Well-Structured GitHub/Microsoft Training References

| Resource | Type | Level | Key Structural Pattern | URL |
|----------|------|-------|----------------------|-----|
| **GitHub Admin Training (GHEC)** | Official GitHub Expert Services | L300 | 2-day, remote, 16-person max, enterprise/org/repo modules, hands-on activities | [2] |
| **GitHub GHAS Rollout & Deployment** | Official GitHub Expert Services | L300 | 2-hour face-to-face, 15-person max, planning + implementation focused | [8] |
| **Microsoft What The Hack** | Open-source hackathon framework | Varies | Challenge-based, squad format (3-5), coach-guided, not step-by-step | [3] |
| **WTH: DevOps with GitHub** | What The Hack hackathon | L200-300 | 12 challenges, progressive complexity, Coach's guide + Student guide | [10] |
| **WTH: Modern GitHub Dev** | What The Hack hackathon | L200-300 | 6 challenges, scenario-based (pet shelter app), Codespaces for environment | [11] |
| **Microsoft workshop-template** | Template repo | L100-200 | UBD design, 5 milestones per hour, quiz/challenge, feedback link | [1] |
| **GitHub Universe Workshops** | Conference workshops | Varies | Repo-per-workshop, devcontainer, docs/ folder, reference implementations | [12] |
| **MicrosoftLearning repos** | Official lab repos | Varies | 349+ repos, per-course structure, Bicep/scripts for environment setup | [13] |
| **GitHub for Developers** | Official GitHub Expert Services | L200 | Remote/onsite, 16-person max, Git deep-dive + collaboration focus | [5] |
| **GitHub Copilot Agents & MCP** | Official GitHub Expert Services | — | 4-hour training, modern format for agent/MCP topics | [14] |

### Common Structural Patterns Across Examples

1. **Progressive challenge design** — Start simple (establish confidence), build complexity (build competence) [7]
2. **Coach/facilitator model** — 1 coach per 5-10 attendees; coach guides but doesn't give answers [6]
3. **Verifiable success criteria** — Every lab/challenge has explicit "done" criteria [7]
4. **Pre-loaded resources** — Upload materials to collaboration platform; don't require repo access during event [6]
5. **Mini-lectures** — Limit presentations to 5-10 minutes per challenge/module [7]
6. **Parking lot** — Dedicated space for off-topic but valuable questions
7. **Milestone structure** — Content organized as milestones (5 per hour for L100; 2-3 per hour for L300) [1]

---

## Recommended Timing for This Workshop

### Day 1: Foundation & Identity (3 hours + breaks)

| Time | Duration | Type | Content | Notes |
|------|----------|------|---------|-------|
| 0:00 | 15 min | 🎤 Lecture | Welcome, intros, agenda, objectives | Icebreaker: "What's your biggest admin challenge?" |
| 0:15 | 25 min | 🎤 Lecture + Demo | Enterprise hierarchy & org strategy | Live demo in training Enterprise account |
| 0:40 | 20 min | 🔬 Lab | Enterprise settings & org configuration | Guided exercise with decision points |
| 1:00 | 5 min | ✅ Check | Knowledge check poll (3 questions) | Use Teams/Zoom polls |
| 1:05 | 10 min | ☕ Break | **Mandatory break** | |
| 1:15 | 30 min | 🎤 Lecture + Demo | Identity & access management deep dive | SAML, SCIM, EMU trade-off discussion |
| 1:45 | 25 min | 🔬 Lab | IAM configuration challenge | Challenge-based with tiered hints |
| 2:10 | 5 min | ✅ Check | Scenario discussion: "Which SSO approach?" | Interactive discussion, not quiz |
| 2:15 | 10 min | ☕ Break | **Mandatory break** | |
| 2:25 | 20 min | 🎤 Lecture + Demo | Teams, permissions & rulesets | Live demo of permission inheritance |
| 2:45 | 20 min | 🔬 Lab | Permission & policy setup challenge | Build team hierarchy + rulesets |
| 3:05 | 5 min | ✅ Check | Quick poll + Q&A | |
| 3:10 | 10 min | 🎤 Wrap | Day 1 summary, Day 2 preview, reflection | "Your #1 takeaway?" in chat |
| | | | | |
| **Totals** | | | | |
| Lecture/Demo | 90 min | 46% | | |
| Labs | 65 min | 33% | | |
| Checks/Discussion | 15 min | 8% | | |
| Breaks | 20 min | 10% | | |
| Admin (welcome/wrap) | 25 min | 13% | | |
| **Net instruction** | **170 min** | | (excluding breaks) | |
| **Gross time** | **3h 20m** | | (including breaks) | |

### Day 2: Security, Governance & Operations (3 hours + breaks)

| Time | Duration | Type | Content | Notes |
|------|----------|------|---------|-------|
| 0:00 | 10 min | 🎤 Lecture | Day 2 kickoff, Day 1 recap poll, questions | Quick 3-question recall poll |
| 0:10 | 25 min | 🎤 Lecture + Demo | Security & compliance | Security defaults, audit logs, GHAS |
| 0:35 | 25 min | 🔬 Lab | Security configuration challenge | Enable security defaults, audit streaming |
| 1:00 | 5 min | ✅ Check | Knowledge check (3 questions) | |
| 1:05 | 10 min | ☕ Break | **Mandatory break** | |
| 1:15 | 25 min | 🎤 Lecture + Demo | Copilot & Actions governance | Policies, allowed lists, billing |
| 1:40 | 25 min | 🔬 Lab | Governance configuration | Copilot policies, Actions allow-list |
| 2:05 | 5 min | ✅ Check | Scenario: "Developer installs unauthorized Action" | |
| 2:10 | 10 min | ☕ Break | **Mandatory break** | |
| 2:20 | 20 min | 🎤 Lecture + Demo | Operational best practices & reference arch | Migration, DR, monitoring |
| 2:40 | 20 min | 🔬 Lab | Capstone: architecture review challenge | Small group breakout → present back |
| 3:00 | 5 min | ✅ Check | Capstone debrief | Groups share key findings |
| 3:05 | 15 min | 🎤 Wrap | Summary, post-assessment, resources, feedback, next steps | Feedback survey link in chat |
| | | | | |
| **Totals** | | | | |
| Lecture/Demo | 80 min | 41% | | |
| Labs | 70 min | 36% | | |
| Checks/Discussion | 15 min | 8% | | |
| Breaks | 20 min | 10% | | |
| Admin (kickoff/wrap) | 25 min | 13% | | |
| **Net instruction** | **165 min** | | (excluding breaks) | |
| **Gross time** | **3h 20m** | | (including breaks) | |

### Timing Summary Across Both Days

| Metric | Day 1 | Day 2 | Total |
|--------|-------|-------|-------|
| Lecture/Demo time | 90 min | 80 min | 170 min (51%) |
| Hands-on lab time | 65 min | 70 min | 135 min (40%) |
| Knowledge checks | 15 min | 15 min | 30 min (9%) |
| Breaks | 20 min | 20 min | 40 min |
| Admin overhead | 25 min | 25 min | 50 min |
| **Gross session time** | ~3h 20m | ~3h 20m | ~6h 40m |
| **Net instruction time** | ~2h 50m | ~2h 45m | ~5h 35m |

> **VBD Target:** 40-60% hands-on. This schedule achieves **~40% lab time** (135 of 335 net minutes), which is at the lower end for L300. If the audience is highly experienced, consider converting some lecture time to additional lab/challenge time to push toward 50%.

---

## Sources

1. Microsoft Workshop Template — UBD (Understanding by Design) framework and workshop-designer.md template. https://github.com/microsoft/workshop-template
2. GitHub Expert Services — Full catalog of training and implementation services. https://github.com/services
3. Microsoft What The Hack — Challenge-based hackathon framework and collection. https://github.com/microsoft/WhatTheHack
4. GitHub Admin Training (GitHub Enterprise Cloud) — Official syllabus, 2-day, 16-person max remote. https://github.com/services/admin-training-github-enterprise-cloud
5. GitHub for Developers Training — Intermediate [200] level format reference. https://github.com/services/github-for-developers-training
6. What The Hack — How To Host A Hack guide (virtual event logistics, squad model, Teams setup). https://github.com/microsoft/WhatTheHack/blob/master/000-HowToHack/WTH-HowToHostAHack.md
7. What The Hack — Author's Guide (challenge design, coach's guide structure, presentation guidance). https://github.com/microsoft/WhatTheHack/blob/master/000-HowToHack/WTH-HowToAuthorAHack.md
8. GitHub GHAS Rollout & Deployment Training — Advanced [300] level, 2-hour format. https://github.com/services/ghas-rollout-deployment-training
9. Microsoft Learn — GitHub training learning paths. https://learn.microsoft.com/en-us/training/github/
10. What The Hack — DevOps with GitHub (12 challenges, progressive complexity). https://github.com/microsoft/WhatTheHack/blob/master/031-DevOpsWithGitHub/README.md
11. What The Hack — Modern Development and DevOps with GitHub (6 challenges, Codespaces). https://github.com/microsoft/WhatTheHack/blob/master/065-ModernGitHubDev/README.md
12. GitHub Universe Workshops — Conference workshop repos (devcontainer, docs, reference implementations). https://github.com/githubuniverseworkshops
13. Microsoft Learning — 349+ official course lab repos. https://github.com/MicrosoftLearning
14. GitHub Copilot Agents and MCP Training — 4-hour session format reference. https://github.com/services/github-copilot-agents-and-mcp
15. GitHub Implementation (GHEC) — Implementation engagement structure. https://github.com/services/implementation-github-enterprise-cloud
16. McTighe, J. & Wiggins, G. — "Understanding by Design" (UBD) framework referenced by Microsoft workshop template.
