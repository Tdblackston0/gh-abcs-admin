# Slide Deck Outline

This outline provides the structure for creating a slide deck for the GitHub Admin Training workshop. Each module includes slide titles, key visuals, and speaker notes summary. This is NOT a full slide deck — it's an outline that can be used to create one in your preferred presentation tool.

## How to Use This Outline

- Each module section corresponds to a presentation slot in the [Agenda](AGENDA.md)
- "Key Visual" suggests a diagram or screenshot to include
- "Speaker Notes" provides the essential points to cover
- Reference the [Instructor Guide](INSTRUCTOR-GUIDE.md) for detailed talking points

## Day 1

### Module 1.1: Repository Permissions and Settings (15 min)

**Slide 1: Module Title**
- Title: "Repository Permissions and Settings"
- Subtitle: "Visibility, base permissions, and custom roles"

**Slide 2: Repository Visibility Levels**
- Key Visual: Comparison table of Public / Internal / Private
- Speaker Notes: Internal is unique to GHEC — enables inner source. Default for new repos should be configured at org level.

**Slide 3: Base Permissions**
- Key Visual: Screenshot of Org → Settings → Member privileges → Base permissions
- Speaker Notes: Base permission = minimum for all org members. "Read" is recommended for most orgs. Can be "No permission" for strict environments.

**Slide 4: Custom Repository Roles**
- Key Visual: Diagram showing permission hierarchy (Read → Triage → Write → Maintain → Admin → Custom)
- Speaker Notes: Custom roles fill gaps between built-in roles. Example: "Release Manager" with maintain + manage releases but no admin.

**Slide 5: Transition to Lab**
- Title: "Hands-on: Lab 4 — GitHub Templates"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 1.2-1.3: Branches, PRs, and Rulesets (20 min)

**Slide 1: Module Title**
- Title: "Branches, Pull Requests, and Rulesets"
- Subtitle: "Modern branch governance for your organization"

**Slide 2: Rulesets vs Legacy Branch Protection**
- Key Visual: Side-by-side comparison table (branch protection rules vs rulesets)
- Speaker Notes: Rulesets are the modern replacement. Key advantages: org-level scope, layering, bypass lists, tag targets.

**Slide 3: Ruleset Components**
- Key Visual: Diagram showing ruleset anatomy (targets → rules → bypass → enforcement)
- Speaker Notes: Targets define which branches/tags. Rules define what's enforced. Bypass lists grant exceptions. Enforcement can be active or evaluate-only.

**Slide 4: Organization vs Repository Rulesets**
- Key Visual: Flow diagram showing org rulesets cascading to repos
- Speaker Notes: Org rulesets apply across all or selected repos. Repo rulesets are scoped to that repo only. Both layer together — most restrictive wins.

**Slide 5: PR Workflow with Rulesets**
- Key Visual: Sequence diagram (developer → PR → required reviews → status checks → merge)
- Speaker Notes: Walk through a typical PR flow with rulesets enforcing required reviewers and status checks.

**Slide 6: Transition to Lab**
- Title: "Hands-on: Lab 3 — Branch Rulesets"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 1.4: Required Status Checks (15 min)

**Slide 1: Module Title**
- Title: "Required Status Checks"
- Subtitle: "Automating quality gates in your workflow"

**Slide 2: How Status Checks Work**
- Key Visual: Flow diagram (PR opened → CI triggered → status reported → merge allowed/blocked)
- Speaker Notes: Status checks are external signals (CI, linters, tests) that report pass/fail to GitHub. Required checks block merge until green.

**Slide 3: Configuring Required Checks in Rulesets**
- Key Visual: Screenshot of ruleset → Require status checks to pass
- Speaker Notes: Configure by adding check names. Checks must match exactly. Use "Require branches to be up to date" for strict mode.

**Slide 4: CI/CD Integration Patterns**
- Key Visual: Architecture diagram showing GitHub Actions, third-party CI, and status API
- Speaker Notes: GitHub Actions auto-reports status. Third-party CI uses the Status API or Check Runs API. Multiple checks can be required.

**Slide 5: Transition to Lab**
- Title: "Hands-on: Lab 6 — Required Status Checks"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 1.5: Security in the Cloud (15 min)

**Slide 1: Module Title**
- Title: "Security in the Cloud"
- Subtitle: "Secret scanning, code scanning, and Dependabot"

**Slide 2: GitHub Security Overview**
- Key Visual: Security feature comparison matrix (secret scanning, code scanning, Dependabot)
- Speaker Notes: Three pillars of GitHub security. Each addresses a different threat vector: leaked secrets, vulnerable code, vulnerable dependencies.

**Slide 3: Secret Scanning and Push Protection**
- Key Visual: Diagram showing push protection flow (push → scan → block if secret found)
- Speaker Notes: Push protection prevents secrets from being committed. Supports 200+ token patterns. Can be enabled org-wide.

**Slide 4: Security Overview Dashboard**
- Key Visual: Screenshot concept of the org-level security overview
- Speaker Notes: Single pane of glass for all security alerts across the organization. Filter by severity, tool, repository.

**Slide 5: Enable Security at Scale**
- Key Visual: Settings hierarchy (Enterprise → Org → Repo) for security features
- Speaker Notes: Enable features at org level for consistency. Use security configurations to standardize settings across repos.

**Slide 6: Transition to Lab**
- Title: "Hands-on: Lab 7 — Security"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 1.6-1.8: Privacy, Licenses, Marketplace (10 min)

**Slide 1: Module Title**
- Title: "Privacy, Licensing, and Marketplace"
- Subtitle: "Data residency, billing, and extending GitHub"

**Slide 2: Data Residency Overview**
- Key Visual: World map showing GitHub data center regions
- Speaker Notes: GHEC offers data residency options for regulated industries. Understand where your data lives and applicable compliance frameworks.

**Slide 3: Billing and Seat Management**
- Key Visual: Billing dashboard screenshot concept showing seat usage
- Speaker Notes: Seats are consumed by org members. Monitor usage to optimize costs. Actions and Packages have separate metered billing.

**Slide 4: Marketplace and GitHub Apps**
- Key Visual: Marketplace categories and GitHub App permission model diagram
- Speaker Notes: GitHub Marketplace provides integrations. GitHub Apps are preferred over OAuth Apps — more granular permissions, better security model.

**Slide 5: Self-Paced Extensions**
- Note: No in-session lab for this module
- Recommend self-paced extension activities for deeper exploration

---

## Day 2

### Module 2.1: Integrations and Authentication (15 min)

**Slide 1: Module Title**
- Title: "Integrations and Authentication"
- Subtitle: "SAML, SCIM, OIDC, and Enterprise Managed Users"

**Slide 2: Authentication Landscape**
- Key Visual: Architecture diagram showing SAML SSO, SCIM provisioning, and OIDC flows
- Speaker Notes: SAML for authentication, SCIM for provisioning, OIDC for token-based auth. All three work together for complete identity management.

**Slide 3: EMU vs Non-EMU Comparison**
- Key Visual: Side-by-side comparison table (EMU vs standard GHEC)
- Speaker Notes: EMU = full identity control from IdP. Non-EMU = users link existing GitHub accounts. EMU is more restrictive but provides stronger governance.

**Slide 4: IdP Configuration Flow**
- Key Visual: Step-by-step flow diagram for IdP setup (Azure AD / Okta example)
- Speaker Notes: Walk through the key configuration steps. Emphasize testing with a small group before org-wide rollout.

**Slide 5: OAuth Apps vs GitHub Apps**
- Key Visual: Comparison table (OAuth App vs GitHub App permissions, scope, installation)
- Speaker Notes: GitHub Apps are the recommended path. Fine-grained permissions, installation-level access, webhook-driven architecture.

**Slide 6: Self-Paced Lab Reference**
- Note: No in-session lab — covered in self-paced Lab 11
- Provide link and brief description

---

### Module 2.2: Enterprise Administration (10 min)

**Slide 1: Module Title**
- Title: "Enterprise Administration"
- Subtitle: "Hierarchy, policies, and governance at scale"

**Slide 2: Enterprise Hierarchy**
- Key Visual: Enterprise hierarchy diagram (Enterprise → Organizations → Teams → Repositories)
- Speaker Notes: Enterprise is the top-level container. Organizations group related repos and teams. Teams manage access within orgs.

**Slide 3: Enterprise vs Org Policies**
- Key Visual: Table showing which policies can be set at enterprise vs org level
- Speaker Notes: Enterprise policies can be enforced (locked) or allowed (delegated). Enforced policies cannot be overridden at the org level.

**Slide 4: Policy Enforcement Types**
- Key Visual: Diagram showing Allow / Block / Enforce behavior
- Speaker Notes: Allow = orgs choose. Enforce = all orgs must comply. Block = no org can enable. Choose based on governance needs.

**Slide 5: Transition to Lab**
- Title: "Hands-on: Lab 15 — Enterprise Administration"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 2.4-2.5-2.7: Orgs, Users, Teams (15 min)

**Slide 1: Module Title**
- Title: "Organizations, Users, and Teams"
- Subtitle: "Structure, lifecycle, and access management"

**Slide 2: Organization Structure Patterns**
- Key Visual: Common org structures (single org, multi-org by BU, multi-org by environment)
- Speaker Notes: Choose based on isolation needs, compliance requirements, and team boundaries. Most enterprises use 1-3 orgs.

**Slide 3: User Lifecycle**
- Key Visual: User journey diagram (invite → onboard → active → role change → offboard)
- Speaker Notes: Automate with SCIM where possible. Monitor for dormant users. Offboarding should revoke access immediately.

**Slide 4: Teams and Nested Teams**
- Key Visual: Team hierarchy diagram with permission inheritance
- Speaker Notes: Teams can be nested for org structure mapping. Child teams inherit parent permissions. Use for code review assignment and access control.

**Slide 5: IdP Group Sync**
- Key Visual: Flow diagram (IdP group → GitHub team → repository access)
- Speaker Notes: Sync IdP groups to GitHub teams for automated access management. Changes in IdP propagate to GitHub automatically.

**Slide 6: Transition to Lab**
- Title: "Hands-on: Lab 9 — Teams"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 2.3-2.6: Audit and Dormant Users (10 min)

**Slide 1: Module Title**
- Title: "Audit Logging and Dormant Users"
- Subtitle: "Visibility, compliance, and license optimization"

**Slide 2: Audit Log Overview**
- Key Visual: Audit log dashboard screenshot concept
- Speaker Notes: Audit log captures all administrative and security events. Available via UI, API, and streaming. Retained for 180 days (GHEC).

**Slide 3: Key Events to Monitor**
- Key Visual: Table of critical audit events with severity indicators
- Speaker Notes: Focus on permission changes, member additions/removals, repo visibility changes, and security setting modifications.

**Slide 4: Audit Log Streaming**
- Key Visual: Architecture diagram (GitHub → streaming endpoint → SIEM)
- Speaker Notes: Stream to S3, Azure Blob, Datadog, Splunk, or Azure Event Hubs. Enables long-term retention and correlation with other security data.

**Slide 5: Identifying and Managing Dormant Users**
- Key Visual: Dormant user identification workflow diagram
- Speaker Notes: Use API to identify users with no activity. Reclaim licenses from dormant accounts. Consider automation for periodic reviews.

**Slide 6: Transition to Lab**
- Title: "Hands-on: Lab 8 — Audit Log"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 2.8-2.11: API and Webhooks (10 min)

**Slide 1: Module Title**
- Title: "API and Webhooks"
- Subtitle: "Automation foundations for GitHub administration"

**Slide 2: REST vs GraphQL Comparison**
- Key Visual: Side-by-side comparison (REST: simple, paginated vs GraphQL: flexible, single request)
- Speaker Notes: REST for simple operations and scripting. GraphQL for complex queries and reducing API calls. Both use the same authentication.

**Slide 3: API Authentication Methods**
- Key Visual: Decision tree (PAT vs GitHub App vs GITHUB_TOKEN)
- Speaker Notes: Use GitHub App tokens for automation. PATs for personal scripts (prefer fine-grained). GITHUB_TOKEN for Actions workflows.

**Slide 4: Webhook Architecture**
- Key Visual: Flow diagram (GitHub event → webhook → your server → process)
- Speaker Notes: Webhooks enable event-driven automation. Configure at repo, org, or enterprise level. Always verify webhook signatures.

**Slide 5: Transition to Lab**
- Title: "Hands-on: Lab 5 — Webhooks"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Module 2.9-2.14: Integrations, Deploy, Automation, Health (10 min)

**Slide 1: Module Title**
- Title: "Deployments, Automation, and Repository Health"
- Subtitle: "CI/CD governance and operational excellence"

**Slide 2: Deployment Environments**
- Key Visual: Deployment pipeline diagram (dev → staging → production) with environment protection rules
- Speaker Notes: Environments define deployment targets with protection rules. Require reviewers, wait timers, and branch restrictions for production.

**Slide 3: Environment Protection Rules**
- Key Visual: Protection rule configuration screenshot concept
- Speaker Notes: Required reviewers gate production deploys. Wait timers add a cooling period. Branch restrictions ensure only main can deploy to production.

**Slide 4: gh CLI Automation**
- Key Visual: Example script snippets for common admin tasks
- Speaker Notes: gh CLI enables scriptable administration. Combine with cron/Actions for scheduled tasks. Use `--json` and `--jq` for structured output.

**Slide 5: Repository Health and Large Files**
- Key Visual: Repository health checklist and Git LFS architecture diagram
- Speaker Notes: Monitor repo size, contributor activity, and security alerts. Use Git LFS for large binary files. Consider history rewriting for accidentally committed large files.

**Slide 6: Transition to Lab**
- Title: "Hands-on: Lab 13 — Automation"
- Duration: 10 minutes
- Quick description of what they'll do

---

### Workshop Wrap-Up (10 min)

**Slide 1: Key Takeaways**
- Title: "Top 5 Things to Implement This Week"
- Content:
  1. Enable organization rulesets for branch protection
  2. Configure security features (secret scanning + push protection) org-wide
  3. Set up audit log streaming to your SIEM
  4. Review and optimize permission levels (principle of least privilege)
  5. Automate user provisioning with SCIM

**Slide 2: Resources**
- [Participant Reference Card](REFERENCE-CARD.md) — keep this handy
- Self-paced labs for continued learning
- [GitHub Enterprise Cloud Documentation](https://docs.github.com/en/enterprise-cloud@latest)
- [GitHub Community Discussions](https://github.com/orgs/community/discussions)

**Slide 3: Action Planning**
- Title: "Your Action Plan"
- Prompt: "Write down 3 things you will do in the next 30 days based on what you learned"
- Provide a simple template: What → When → Who

**Slide 4: Feedback**
- Title: "Help Us Improve"
- Link to feedback form
- QR code placeholder for easy mobile access

**Slide 5: Thank You**
- Title: "Thank You!"
- Contact information for follow-up questions
- Links to GitHub Support and community resources
