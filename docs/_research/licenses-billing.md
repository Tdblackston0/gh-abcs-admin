# Research Brief: Licenses & Billing

> **VBD Agenda Items:** 1.7 (Licenses)
> **Priority:** P1
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

GitHub Enterprise Cloud (GHEC) billing has undergone a major transformation since 2024. The legacy model of fixed-seat volume licensing has been superseded by **usage-based (metered) billing** as the default for all new GHEC accounts created after August 1, 2024 [2]. Existing volume/subscription customers transition to metered billing at renewal. Under the new model, enterprises pay monthly for the actual number of licenses consumed, plus metered charges for products like GitHub Actions, Packages, Codespaces, and Copilot premium requests. All metered products follow a fixed billing period from the 1st to the last day of each calendar month [6].

The billing platform now supports **budgets and alerts**, **cost centers** for departmental chargeback, and deep integration with **Azure subscriptions** for unified cloud billing [3][7][8]. GitHub Copilot has evolved into a multi-tier product line with six distinct plans—Free, Student, Pro, Pro+, Business, and Enterprise—each with its own premium request allowance and pricing [10]. Advanced Security has been split into two separately licensable SKUs: **Secret Protection** and **Code Security** [5]. REST API endpoints provide comprehensive billing usage data at user, organization, and enterprise levels, enabling automated cost reporting and integration with BI tools [13][14].

These changes represent a fundamental shift toward consumption-based economics that enterprise administrators must understand to manage costs effectively.

## Key Concepts

### License Types

#### GitHub Enterprise Cloud Plans

GitHub Enterprise Cloud is the primary plan for enterprise organizations. Each member of an enterprise consumes one license (previously called a "seat"). The enterprise account is the central billing point for all organizations it owns [2].

**Two billing models exist for GHEC licenses** [2][3]:

| Model | Description | Availability |
|-------|-------------|-------------|
| **Usage-based (metered)** | Pay monthly for the number of licenses actually consumed. No upfront commitment. | Default for all trials started after Aug 1, 2024. Available at renewal for existing customers. |
| **Volume (subscription)** | Purchase a fixed number of licenses for a defined period (typically annual). | Legacy model for existing invoiced customers until renewal. |

**Unique-user licensing model**: With GitHub Enterprise, users are entitled to both GHEC and GHES. A single user consumes only one license regardless of how many GHES instances or GHEC organizations they belong to. License synchronization between GHES and GHEC environments prevents double-counting [2].

#### GitHub Advanced Security (GHAS) SKUs

GHAS has been split into two independent license SKUs [5]:

| SKU | Features | Billing Basis |
|-----|----------|---------------|
| **GitHub Secret Protection** | Secret scanning, push protection | Unique active committers (90-day window) |
| **GitHub Code Security** | Code scanning, premium Dependabot, dependency review | Unique active committers (90-day window) |

- All GHAS features are **free for public repositories** on GitHub.com [5].
- For private/internal repos, licensing is based on **unique active committers** in the last 90 days to repos with GHAS enabled [5].
- Metered billing: pay monthly per active committer, no pre-defined limit [5].
- Volume billing: purchase a fixed number of committer licenses; overage blocks enabling GHAS on new repos [5].

#### Who Consumes a GHEC License?

The following consume a license [9]:
- Enterprise owners who are members/owners of at least one organization
- Organization members (including owners)
- Outside collaborators on private/internal repositories (excluding forks)
- Dormant users who are members of at least one organization

**Do NOT consume a license** [9]:
- Suspended Enterprise Managed User accounts
- Enterprise owners not in any organization
- Enterprise/organization billing managers
- Guest collaborators who are not org members or repo collaborators
- Unaffiliated users (added to enterprise but not members of any org)
- Users with failed invitations

**EMU-specific behavior**: With Enterprise Managed Users (EMU), pending invitations do NOT consume licenses (since identity is provisioned via SCIM). Without EMU, pending invitations DO consume licenses [9].

### Billing Model

#### Metered vs. Seat-Based Billing

GitHub charges for three categories [1]:

| Category | Type | Examples |
|----------|------|----------|
| **Plans** | Fixed monthly | GitHub Pro, GitHub Team, GitHub Enterprise Cloud |
| **Subscriptions** | Fixed monthly | GitHub Secret Protection, GitHub Code Security |
| **Metered usage** | Variable/consumption | GitHub Actions, Packages, Codespaces, Copilot premium requests, Git LFS |

#### Free Usage Included with GHEC [12]

| Product | Usage Type | GHEC Included Amount |
|---------|-----------|---------------------|
| GitHub Actions | Minutes/month | 50,000 |
| GitHub Actions | Storage | 50 GB (shared with Packages) |
| GitHub Packages | Storage | 50 GB (shared with Actions) |
| GitHub Packages | Data transfer/month | 100 GB |
| Git LFS | Storage/month | 250 GB |
| Git LFS | Bandwidth/month | 250 GB |

> **Note**: Codespaces does not have a free organizational/enterprise allowance—only personal accounts on Free/Pro plans get free Codespaces hours [12].

#### GitHub Actions Pricing Highlights [4]

- **Free for**: public repos (standard runners), self-hosted runners, GitHub Pages, Dependabot
- **Larger runners**: Always billed, even for public repos [4]
- **Storage**: Hourly accrual model (GB-Hours); artifacts, caches, and Packages share the same pooled storage allowance [4]
- **Baseline rates**: Linux 2-core $0.006/min, Windows 2-core $0.010/min, macOS 3/4-core $0.062/min [4]

#### Azure Subscription Integration [8]

- GHEC accounts can connect an Azure subscription for billing, which routes all metered usage through Azure invoicing [8]
- Required for GitHub Enterprise Cloud through a Microsoft Enterprise Agreement to use GHAS, Codespaces, Copilot, and to exceed plan's included Actions/Packages/LFS amounts [8]
- Once linked, metered costs bill through Azure on the 1st of each month; pre-existing GitHub plan charges continue on the legacy billing date [8]
- Azure SPV app requires tenant-wide admin consent to list available subscriptions [8]

#### Billing Cycles [6]

- **Metered products**: Fixed period from 1st to last day of each month (UTC) [6]
- **Volume-based licenses**: Billed on anniversary date of subscription [6]
- **Self-serve CC metered enterprise accounts**: As of December 1, 2025, billing date standardized to the 1st of the month [6]
- **Mid-cycle changes**: Adding users/licenses is prorated; removing users still bills through end of cycle; removing orgs/repos stops charges immediately [6]

### Seat Management

#### Managing Enterprise Licenses [15]

| Customer Type | How to Manage Licenses |
|--------------|----------------------|
| **Usage-based billing** | No manual seat management required—billed automatically for consumed licenses [15] |
| **Volume billing (invoiced)** | Contact GitHub Sales team to adjust license count [15] |
| **Volume billing (self-serve)** | Manage through GitHub UI: Enterprise → Billing & licensing → Licensing → Manage licenses [15] |

#### Copilot Seat Management via REST API [14]

Key REST API endpoints for Copilot seat management:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orgs/{org}/copilot/billing` | GET | Get Copilot seat info and settings (plan type, seat breakdown, policies) |
| `/orgs/{org}/copilot/billing/seats` | GET | List all Copilot seat assignments with last activity data |
| `/orgs/{org}/copilot/billing/selected_teams` | POST | Add teams to Copilot subscription |
| `/orgs/{org}/copilot/billing/selected_teams` | DELETE | Remove teams from Copilot subscription |
| `/orgs/{org}/copilot/billing/selected_users` | POST | Add individual users to Copilot subscription |
| `/orgs/{org}/copilot/billing/selected_users` | DELETE | Remove individual users (set to pending cancellation) |
| `/orgs/{org}/members/{username}/copilot` | GET | Get seat details for a specific user |

**Required scopes**: `manage_billing:copilot` or `read:org` (for GET), `manage_billing:copilot` or `admin:org` (for POST/DELETE) [14].

**Seat management setting** (`seat_management_setting`): Can be `assign_all`, `assign_selected`, `disabled`, or `unconfigured` [14].

**Seat breakdown response** includes: `total`, `added_this_cycle`, `pending_cancellation`, `pending_invitation`, `active_this_cycle`, `inactive_this_cycle` [14].

#### EMU vs Non-EMU License Consumption [9]

| Scenario | EMU | Non-EMU |
|----------|-----|---------|
| Pending org invitations | Do NOT consume license | DO consume license |
| Suspended accounts | Do NOT consume license | N/A (suspension is EMU-only via SCIM) |
| Identity provisioning | Via SCIM/IdP | Manual or SAML SSO |
| Outside collaborator invites | N/A (EMU doesn't support outside collaborators the same way) | Pending invites consume license for 7 days |

#### License Reports [16]

Enterprise admins can download CSV license reports from Billing & Licensing → Licensing page. Report fields include [16]:
- `GitHub com login`, `GitHub com name`, `GitHub com enterprise roles`
- `License type` (`Visual Studio subscription` or `Enterprise`)
- `GitHub com code security license user`, `GitHub com secret protection license user`
- `Ghe license active`, `Ghe license start date`, `Ghe license end date`
- `GitHub com cost center`
- `Visual studio license status`, `Visual studio subscription email`
- `Total user accounts`

### Copilot Licensing

#### Plan Comparison [10]

| Plan | Target | Price | Premium Requests/Month | Key Features |
|------|--------|-------|----------------------|--------------|
| **Copilot Free** | Individual | $0 | 50 | Limited completions; no cloud agent |
| **Copilot Student** | Verified students | $0 | 300 | Unlimited completions, cloud agent, premium models |
| **Copilot Pro** | Individual | $10/month | 300 | Unlimited completions, cloud agent, premium models |
| **Copilot Pro+** | Individual (power user) | $39/month | 1,500 | All models, higher request allowance |
| **Copilot Business** | Org/Enterprise | $19/user/month | 300/user | Centralized management, policy control, cloud agent |
| **Copilot Enterprise** | Enterprise (GHEC) | $39/user/month | 1,000/user | All Business features + enterprise-grade capabilities |

**Enterprise-level flexibility**: Enterprise owners can assign Copilot Enterprise or Copilot Business to individual organizations, or mix both across the enterprise. Only the higher-tier seat is billed when a user has both [10][11].

#### Premium Requests [11]

Premium requests provide access to advanced AI models and features (advanced reasoning, large context windows, Copilot cloud agent, Spark) [11].

**Three dedicated SKUs** (since November 1, 2025) [11]:
- `copilot_premium_request` — Chat, CLI, Code Review, Extensions, Spaces
- `spark_premium_request` — Spark app creation
- `copilot_agent_premium_request` — Copilot cloud agent sessions

**Multipliers**: Some models consume more than 1 premium request per interaction (e.g., advanced reasoning models may use 5× or 20×) [11].

**Overage**: Additional requests at $0.04/request (all paid plans except Free) [10].

**Enterprise controls** [11]:
- **Premium request paid usage** policy controls whether members can exceed their allowance
- Separate policy options for Copilot, Spark, and cloud agent
- Budgets can be set to either monitor OR block overages
- Bundled or individual SKU budget management

#### Copilot Billing Details [10][11]

- Personal Copilot plan is **auto-canceled** when user gets an org/enterprise seat (with prorated refund) [10]
- If a user has seats in multiple orgs within the same enterprise, enterprise is billed **once** per cycle [10]
- If both Business and Enterprise seats are assigned, **only Enterprise seat is billed** [10]
- Cloud agent consumes both **Actions minutes** AND **premium requests** [11]

### Billing APIs

#### Usage Reporting Endpoints [13]

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/organizations/{org}/settings/billing/usage` | GET | Detailed usage report for all paid products (org level) |
| `/organizations/{org}/settings/billing/usage/summary` | GET | Summary usage report (org level) — **public preview** |
| `/organizations/{org}/settings/billing/premium_request/usage` | GET | Premium request usage report (org level) |
| `/users/{username}/settings/billing/usage` | GET | Detailed usage report (user level) |
| `/users/{username}/settings/billing/usage/summary` | GET | Summary usage report (user level) — **public preview** |
| `/users/{username}/settings/billing/premium_request/usage` | GET | Premium request usage report (user level) |
| `/enterprises/{enterprise}/settings/billing/usage/summary` | GET | Summary usage report (enterprise level) |
| `/orgs/{org}/settings/billing/advanced-security` | GET | GHAS active committers per repository |

**Enterprise-level endpoints** are available under the GitHub Enterprise Cloud REST API version [13].

**Common query parameters** for filtering [14]:
- `year`, `month`, `day`, `hour` — filter by time period
- `cost_center_id` — filter by cost center (enterprise only)
- `repository` — filter by repository
- `product` — filter by product name
- `sku` — filter by SKU name

**Authentication**: Personal access tokens (classic) with billing permissions. Fine-grained PATs are NOT supported for billing usage endpoints [14].

**API version header**: `X-GitHub-Api-Version: 2026-03-10` [13][14].

#### Product and SKU Identifiers [17]

For programmatic budget creation and usage queries, use these product IDs:

| Product ID | Product Name |
|-----------|-------------|
| `actions` | GitHub Actions |
| `packages` | GitHub Packages |
| `codespaces` | GitHub Codespaces |
| `copilot` | GitHub Copilot |
| `ghas` | GitHub Advanced Security |
| `ghec` | GitHub Enterprise Cloud |

Key Copilot SKUs: `copilot_enterprise`, `copilot_for_business`, `copilot_premium_request`, `copilot_agent_premium_request`, `copilot_standalone`, `spark_premium_request` [17].

Key GHAS SKUs: `ghas_licenses`, `ghas_code_security_licenses`, `ghas_secret_protection_licenses` [17].

GHEC license SKU: `ghec_licenses` [17].

#### Billing Reports (Downloadable CSV) [18]

Three report types available from the UI:

| Report | Max Period | Key Fields |
|--------|-----------|------------|
| **Summarized usage** | 1 year | date, sku, repository, cost_center_name, quantity, gross_amount, discount_amount, net_amount |
| **Detailed usage** | 31 days | Adds username, workflow_path (NOT available via REST API) |
| **Premium requests usage** | 31 days | date, model, username, quantity, exceeds_quota, total_monthly_quota |

> **Important**: The detailed usage report with `username` and `workflow_path` is only available via the GitHub web UI, NOT via the REST API `/usage` endpoint [18].

## What to Cover in Workshop (L300)

### Must-Cover Topics

1. **Billing model transition**: How to evaluate and migrate from volume to usage-based billing at contract renewal. Understand the implications for budgeting and procurement.

2. **License consumption mechanics**: Deep dive into who consumes a license under EMU vs non-EMU, how unique-user licensing works across GHEC + GHES hybrid deployments, and how to synchronize licenses.

3. **Copilot cost management**: Understanding the premium request model, multipliers for advanced models, how to set and enforce budgets per-SKU (Copilot vs Spark vs cloud agent), and the policy controls (`Premium request paid usage` policy).

4. **Cost center architecture**: How to design cost centers for departmental chargeback, the allocation rules (usage-based products charge by repo/org; license-based products charge by user), limitations (250 max, 25,000 resources each), and Azure subscription routing per cost center.

5. **Billing API automation**: Building automated usage reporting pipelines with REST API. Demonstrate querying usage summaries, filtering by time period and cost center, and feeding data into BI tools. Emphasize that classic PATs are required (fine-grained PATs unsupported).

6. **GHAS license optimization**: Managing costs for Secret Protection and Code Security independently, understanding the 90-day active committer window, and strategies for reducing license consumption (e.g., disabling features on inactive repos).

7. **Budget and alert configuration**: Setting up budgets at enterprise, org, and cost center levels. Configuring stop-usage vs. alert-only budgets. Using included usage alerts (90%/100% thresholds).

8. **Azure integration**: Connecting Azure subscriptions, understanding the billing date implications, Azure SPV app consent requirements, and Microsoft Enterprise Agreement considerations.

## Workshop Exercise Ideas

### Exercise 1: Billing Audit & Cost Optimization Report

**Level**: L300 | **Duration**: 45 minutes

Participants receive a simulated enterprise billing scenario with multiple organizations, Copilot seats across Business and Enterprise tiers, GHAS enabled on various repos, and Actions usage data. Using the REST API (or `gh api` CLI), they will:
- Query the usage summary endpoint to identify top-cost products
- Analyze Copilot seat assignments to find inactive users (`last_activity_at`)
- Identify GHAS active committer overlap across organizations
- Propose cost optimization recommendations (e.g., remove dormant Copilot seats, consolidate GHAS-enabled repos)
- Calculate projected monthly savings

### Exercise 2: Cost Center & Budget Architecture Design

**Level**: L300 | **Duration**: 30 minutes

Given an enterprise with 5 business units, 12 organizations, and mixed Copilot Business/Enterprise assignments, participants will:
- Design a cost center hierarchy using the REST API
- Configure budgets per cost center with appropriate stop-usage vs. alert-only settings
- Set up Copilot premium request budgets using individual SKU targeting (copilot_premium_request, copilot_agent_premium_request, spark_premium_request)
- Write a `gh api` script to automate monthly cost center usage reports
- Handle the edge case of Azure subscription routing per cost center

### Exercise 3: Copilot Seat Lifecycle Management Automation

**Level**: L300 | **Duration**: 30 minutes

Build a GitHub Actions workflow that automates Copilot seat management:
- Use the `GET /orgs/{org}/copilot/billing/seats` endpoint to list all seats
- Identify users who haven't been active in 30+ days using `last_activity_at`
- Generate a report of inactive seats and their cost impact
- Use `DELETE /orgs/{org}/copilot/billing/selected_users` to remove inactive users (with approval gate)
- Post a summary to a Slack channel or GitHub Issue
- Handle edge cases: users assigned via team vs. direct assignment, users with both Business and Enterprise seats

## Key Changes Since 2024

### 2024

- **August 2024**: Usage-based billing became the default for all new GHEC trials [3]. This was the pivotal shift from volume to consumption-based licensing.

### 2025

- **April 1, 2025**: GHAS unbundled — GitHub Advanced Security was split into two separately purchasable SKUs—Secret Protection ($19/committer/mo) and Code Security ($30/committer/mo)—allowing organizations to buy only what they need. Both products now available on GitHub Team plan (previously Enterprise-only) [5].

- **November 1, 2025**: Premium requests for Spark and Copilot cloud agent were broken out into dedicated SKUs (`spark_premium_request`, `copilot_agent_premium_request`) for better cost visibility and budget control [11].
- **December 1, 2025**: All self-serve, metered GHEC accounts paying by credit card migrated to a standardized billing date of the 1st of the month [6].
- **Copilot cloud agent**: Introduced as a premium feature that consumes both Actions minutes and premium requests, creating a new billing dimension for AI-assisted development [11].
- **Cost centers**: Enhanced to support Azure subscription routing per cost center, and allocation rules were refined to differentiate between usage-based (by repo/org) and license-based (by user) products [7].
- **Premium request multipliers**: Advanced reasoning models introduced multiplied consumption rates (e.g., 5× or 20× per interaction), significantly impacting cost management [11].
- **Enhanced billing platform**: REST API for billing usage was modernized with new `/usage/summary` and `/premium_request/usage` endpoints at user, org, and enterprise levels [13].

### 2026

- **API version**: REST API billing endpoints now use `X-GitHub-Api-Version: 2026-03-10` [13][14].
- **Copilot plan lineup**: Six-tier Copilot plan structure now fully established (Free, Student, Pro, Pro+, Business, Enterprise) with premium request allowances of 50/300/300/1500/300/1000 respectively [10].
- [NEEDS VERIFICATION] Whether any additional billing model changes or new metered products have been introduced in early 2026. The documentation may not yet reflect the very latest announcements.

## Sources

1. [How GitHub billing works](https://docs.github.com/en/billing/get-started/how-billing-works) — Accessed April 2026
2. [Billing for GitHub Enterprise](https://docs.github.com/en/billing/concepts/enterprise-billing/billing-for-enterprises) — Accessed April 2026
3. [Usage-based billing for enterprise licenses](https://docs.github.com/en/billing/concepts/enterprise-billing/usage-based-licenses) — Accessed April 2026
4. [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) — Accessed April 2026
5. [GitHub Advanced Security license billing](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security) — Accessed April 2026
6. [Billing cycles](https://docs.github.com/en/billing/concepts/billing-cycles) — Accessed April 2026
7. [Cost centers](https://docs.github.com/en/billing/concepts/cost-centers) — Accessed April 2026
8. [Azure subscription payments](https://docs.github.com/en/billing/concepts/azure-subscriptions) — Accessed April 2026
9. [People who consume a license in an organization](https://docs.github.com/en/billing/reference/github-license-users) — Accessed April 2026
10. [Plans for GitHub Copilot](https://docs.github.com/en/copilot/about-github-copilot/plans-for-github-copilot) — Accessed April 2026
11. [GitHub Copilot premium requests](https://docs.github.com/en/billing/concepts/product-billing/github-copilot-premium-requests) — Accessed April 2026
12. [Product usage included with each plan](https://docs.github.com/en/billing/reference/product-usage-included) — Accessed April 2026
13. [REST API endpoints for billing usage](https://docs.github.com/en/rest/billing/usage) — Accessed April 2026
14. [REST API endpoints for Copilot user management](https://docs.github.com/en/rest/copilot/copilot-user-management) — Accessed April 2026
15. [Managing user licenses for an organization or enterprise](https://docs.github.com/en/billing/how-tos/manage-plan-and-licenses/manage-user-licenses) — Accessed April 2026
16. [License reports reference](https://docs.github.com/en/billing/reference/license-reports) — Accessed April 2026
17. [GitHub Product and SKU names](https://docs.github.com/en/billing/reference/product-and-sku-names) — Accessed April 2026
18. [Billing reports reference](https://docs.github.com/en/billing/reference/billing-reports) — Accessed April 2026
19. [GitHub Copilot licenses](https://docs.github.com/en/billing/concepts/product-billing/github-copilot-licenses) — Accessed April 2026
20. [Budgets and alerts](https://docs.github.com/en/billing/concepts/budgets-and-alerts) — Accessed April 2026
21. [Automating usage reporting with the REST API](https://docs.github.com/en/billing/tutorials/automate-usage-reporting) — Accessed April 2026
22. [REST API endpoints for billing](https://docs.github.com/en/rest/billing/billing) — Accessed April 2026
