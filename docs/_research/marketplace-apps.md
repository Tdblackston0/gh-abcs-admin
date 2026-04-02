# Research Brief: GitHub Marketplace & Apps

> **VBD Agenda Items:** 1.8 (GitHub Marketplace)
> **Priority:** P1
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

GitHub Apps and GitHub Marketplace form a critical part of the GHEC ecosystem, enabling organizations to extend GitHub's functionality through vetted integrations. GitHub Apps are the officially recommended integration type, replacing OAuth Apps with a more secure, fine-grained permissions model that gives administrators granular control over what data and actions third-party tools can access [1]. GitHub Apps can act independently of users (server-to-server) or on behalf of users (user-to-server), use short-lived installation tokens instead of long-lived OAuth tokens, and support built-in centralized webhooks [2].

GitHub Marketplace (https://github.com/marketplace) is the primary discovery and distribution channel for both GitHub Apps and GitHub Actions. It supports free and paid listings, publisher verification, and multiple pricing models [3]. For enterprise administrators, the key concern is governance: controlling which apps can be installed, who can install them, what permissions they receive, and auditing all app-related activity across the enterprise.

The emergence of MCP (Model Context Protocol) and Copilot Extensions represents the newest frontier in GitHub's extensibility model. MCP is an open standard enabling AI models (including Copilot) to integrate with external tools and services, with enterprise admins controlling availability via the "MCP servers in Copilot" policy [4]. The GitHub MCP Registry (https://github.com/mcp) serves as a curated discovery hub for MCP servers, distinct from GitHub Marketplace [4].

## Key Concepts

### GitHub Apps vs OAuth Apps

**Current Status:** GitHub Apps are the officially recommended way to integrate with GitHub. The documentation explicitly states: "In general, GitHub Apps are preferred over OAuth apps" [2]. OAuth Apps are still supported but GitHub actively encourages migration to GitHub Apps.

**OAuth App Deprecation Timeline:** As of this research, GitHub has not announced a formal sunset or hard deprecation date for OAuth Apps. However, OAuth Apps are positioned as legacy, and the documentation consistently steers developers toward GitHub Apps. The migration guide exists as a first-class document [5]. [NEEDS VERIFICATION — check GitHub Changelog and blog regularly for any deprecation announcements after this research date.]

**Key Differences:**

| Feature | GitHub Apps | OAuth Apps |
|---------|------------|------------|
| **Permission Model** | Fine-grained permissions (repository, organization, account levels) [6] | Coarse OAuth scopes (e.g., `repo` grants full access) [2] |
| **Repository Access** | User chooses specific repositories during installation [2] | Access to all repos user can see [2] |
| **Authentication** | Installation access tokens (1-hour expiry) + user access tokens [2] | Long-lived OAuth tokens (until revoked) [2] |
| **Acting as** | Can act independently (bot) OR on behalf of user [1] | Always acts on behalf of a user [2] |
| **Webhooks** | Built-in, centralized webhook for all repos in installation [2] | Must configure per-repository/organization [2] |
| **Rate Limits** | Scale with number of repos + org users [2] | Fixed 5,000 requests/hour per user [2] |
| **Enterprise Seats** | App bots do NOT consume a GHEC seat [2] | Machine user accounts DO consume a seat [2] |
| **Org Policy Scope** | NOT subject to organization OAuth app access restrictions [2] | Subject to OAuth app access restrictions [7] |
| **Enterprise-level access** | Cannot yet be given permissions against the enterprise object itself [2] | Can access enterprise-level resources [2] |

**Important Enterprise Limitation:** GitHub Apps cannot yet be given permissions against the enterprise object itself. If an app needs to access enterprise-level resources (such as the enterprise object), an OAuth app is still required [2]. However, GitHub Apps can access enterprise-owned organization and repository resources.

**Migration Path:** GitHub provides a detailed 7-step migration guide: (1) Review OAuth app, (2) Register a GitHub App, (3) Modify code (update auth, review rate limits), (4) Publicize, (5) Instruct users to migrate, (6) Remove old webhooks, (7) Delete old OAuth app [5]. Each user must install and/or authorize the new GitHub App individually — there is no automated migration [5].

### GitHub Marketplace

**How It Works:** GitHub Marketplace (https://github.com/marketplace) connects developers with tools that extend GitHub workflows. It lists two types of tools: **GitHub Actions** and **Apps** (GitHub Apps and OAuth Apps) [3].

**Listing Types:**
- **Free apps:** Anyone can list. Must meet general requirements (valid contact info, description, privacy policy, support link, webhook events for plan changes) [8].
- **Paid apps:** Must be owned by an organization that has completed the **publisher verification process**. GitHub Apps need minimum 100 installations; OAuth Apps need minimum 200 users [8].

**Pricing Models** [9]:
- **Free** — no charge
- **Flat-rate** — fixed monthly/annual price
- **Per-unit** — per-seat or per-resource pricing
- All paid plans must support both monthly and annual billing
- 14-day free trials are optional but available for paid plans
- Up to 10 pricing plans per listing
- Plans can target: personal accounts + organizations, personal only, or organizations only

**Publisher Verification:** Required for paid listings. Involves proving organizational identity and meeting specific criteria [3]. Verified creators receive a badge displayed in Marketplace [10].

**Enterprise Considerations:**
- Organization owners and repository admins can install Marketplace apps on their organizations [11]
- Enterprise admins can enforce policies about which Actions from Marketplace are allowed (allow all, allow verified creators only, allow specific patterns) [10]
- The **"Allow Marketplace actions by verified creators"** option in enterprise Actions policy specifically filters for the verified creator badge [10]

### App Installation & Permissions

**Installation Flow:**
1. **Discovery:** User finds app on Marketplace, a third-party site, or via direct URL (`https://github.com/apps/APP_NAME/installations/new`) [11]
2. **Permission Review:** GitHub displays the exact permissions the app requests (repository, organization, account) before installation [11]
3. **Repository Selection:** User selects which repositories the app can access — all repos or specific repos [11]
4. **Installation:** App is installed at the organization or personal account level [1]
5. **Authorization (if needed):** If the app acts on behalf of users, each user must separately authorize the app [11]

**Permission Model (Fine-Grained)** [6]:
- **Repository permissions:** Access to repo-related resources (contents, issues, pull requests, actions, secrets, etc.)
- **Organization permissions:** Access to org-related resources (members, teams, projects, etc.)
- **Account permissions:** Access to user resources (requires user authorization of the app)
- Apps start with **no permissions by default** — must explicitly request each permission [6]
- Permissions are mapped to specific REST API endpoints and webhook events [6]
- Success depends on the **intersection** of app permissions and user permissions when using user access tokens [6]

**Permission Updates:** When an app owner changes permissions, every account owner where the app is installed is prompted to approve new permissions. Until approved, the installation uses old permissions [6].

**Org-Level Installation Restrictions** [12]:
- By default, repository admins can install GitHub Apps that don't request org permissions or "repository administration" permission
- Organization owners can restrict installation to **organization owners only**
- When restricted: repo admins cannot install apps, must request installation from org owners
- Repo admins cannot add their repos to existing installations either
- App access requests can be enabled/disabled per organization
- Organization owners can control whether members or outside collaborators can request unapproved apps

### Enterprise App Policies

**GitHub Actions Policies (Enterprise Level)** [10]:
Enterprise owners navigate to **Policies > Actions** and can enforce:
- **Allow all actions and reusable workflows** — no restrictions
- **Allow enterprise actions and reusable workflows** — only internal enterprise repos
- **Allow enterprise, and select non-enterprise, actions and reusable workflows** — with sub-options:
  - Allow actions created by GitHub (`actions/*`, `github/*`)
  - Allow Marketplace actions by verified creators
  - Allow/block specific actions with pattern syntax (e.g., `octocat/*`, `!blocked-org/action@*`)
- **Require actions pinned to full-length commit SHA** — strongest supply chain security

**OAuth App Access Restrictions** [7]:
- When enabled (default for new orgs), members cannot authorize OAuth app access to org resources
- Users can request owner approval; org owners get notified of pending requests
- Organization-owned apps automatically get access when restrictions are enabled
- Does NOT apply to GitHub Apps — GitHub Apps are controlled via installation, not OAuth restrictions

**Personal Access Token (PAT) Policies** [13][14]:
Enterprise owners can enforce at enterprise level:
- Restrict or allow fine-grained PATs and classic PATs independently
- Set maximum lifetime for tokens (default: 366 days for fine-grained)
- Require approval for fine-grained PATs before they can access org resources
- Exempt enterprise administrators from lifetime policies
- Organization owners can further restrict within enterprise limits but cannot override enterprise restrictions

**Audit Log Events** [15]:
Key app-related audit events include:
- `integration_installation.create` / `integration_installation.destroy` — App installed/uninstalled
- `integration_installation.repositories_added` / `integration_installation.repositories_removed` — Repos added/removed from app
- `oauth_application.create` / `oauth_application.destroy` — OAuth app lifecycle
- `oauth_authorization.create` / `oauth_authorization.destroy` — User authorizes/revokes OAuth app
- `auto_approve_personal_access_token_requests.enable` / `.disable` — PAT approval policy changes
- `api.request` — API request events (when enabled via audit log streaming)

[NEEDS VERIFICATION — the specific audit event names for GitHub App installations should be validated against the current audit log events reference page, as the full list is extensive and may have changed.]

**Repository Policies (Public Preview)** [16]:
- Enterprise owners can create repository policies to govern lifecycle events
- Control who can create, delete, transfer repos and naming conventions
- Use custom repository properties for flexible targeting
- Policies are **additive** with member privilege policies (most restrictive wins)
- Support delegated bypass with approval workflows

### Copilot Extensions & MCP

**Current State — Model Context Protocol (MCP)** [4]:
MCP is an open standard for connecting AI models to data sources and tools. GitHub has embraced MCP as the primary extensibility mechanism for Copilot, replacing the earlier "Copilot Extensions" model.

**Key points:**
- MCP works across all major Copilot surfaces: IDE (VS Code, JetBrains, Xcode), Copilot CLI, and Copilot cloud agent (coding agent on GitHub.com) [4]
- **GitHub MCP Server** is the official GitHub-provided MCP server, maintained by GitHub [4]
- The **GitHub MCP Registry** (https://github.com/mcp) is a curated catalog of MCP servers — this is separate from GitHub Marketplace [4]
- Registry is in **public preview** as of this research date [4]

**Enterprise Admin Controls for MCP** [4][17]:
- **"MCP servers in Copilot"** policy available at enterprise and organization level
- Policy is **disabled by default** — admins must explicitly enable it
- Controlled via **AI controls > MCP** in enterprise settings [17]
- Only applies to Copilot Business and Copilot Enterprise subscriptions
- Does NOT govern Copilot Free, Pro, or Pro+ users
- Does NOT control access to GitHub MCP server in third-party host apps (Cursor, Windsurf, Claude)

**Copilot Extensions in Marketplace:**
Searching GitHub Marketplace for "copilot" returns integrations that complement Copilot (metrics dashboards, license monitors, Linear/Jira integrations for coding agent) but these are standard GitHub Apps, not "Copilot Extensions" in the traditional sense [18]. The Copilot extensibility model has shifted toward MCP as the primary mechanism.

**Copilot Cloud Agent Integrations:**
- Copilot cloud agent supports MCP servers configured at the repository level [4]
- GitHub MCP server and Playwright MCP server are configured by default [4]
- The coding agent can be assigned work from third-party tools (e.g., "GitHub Copilot for Linear" assigns Linear issues to the coding agent) [18]

**Security:**
- Push protection secures GitHub MCP server interactions for public repos and repos with GitHub Advanced Security [4]
- Blocks secrets from AI-generated responses [4]

## What to Cover in Workshop (L300)

### Must-Cover Topics
1. **GitHub Apps as the default integration pattern** — Why GitHub Apps are preferred, security benefits (fine-grained permissions, short-lived tokens, no seat consumption), the one exception (enterprise-level object access still requires OAuth) [1][2]
2. **Enterprise app governance model** — The layered policy hierarchy: Enterprise Actions policies → Organization OAuth restrictions → Repository-level controls. Demonstrate the allow/block patterns for Actions [10]
3. **App installation approval workflows** — How to restrict app installation to org owners only, enable/disable access requests, the permission review and update flow [12]
4. **Fine-grained PAT policies** — Enterprise-level token policies, approval requirements, maximum lifetime enforcement, and how these interact with GitHub App tokens [13][14]
5. **MCP and Copilot extensibility governance** — The MCP policy toggle, GitHub MCP Registry vs Marketplace, enterprise control surface for AI integrations [4][17]
6. **Audit logging for app activity** — What events are captured, how to monitor for unauthorized app installations [15]

### Advanced Topics (L300)
- **GitHub App permission intersection model**: How user permissions AND app permissions combine when using user access tokens [6]
- **OAuth app access restrictions vs GitHub App installation control**: Why these are fundamentally different governance models [2][7]
- **Supply chain security for Actions**: Commit SHA pinning requirements, verified creator filtering [10]
- **MCP server security model**: Push protection integration, toolset customization [4]
- **PAT lifetime enforcement nuances**: Different enforcement behavior for classic vs fine-grained tokens [14]

## Workshop Exercise Ideas

### Exercise 1: App Governance Audit
**Objective:** Review and harden app policies for an enterprise
**Steps:**
1. Audit currently installed GitHub Apps across organizations using the REST API (`GET /orgs/{org}/installations`)
2. Review OAuth app access restrictions — identify any organizations with restrictions disabled
3. Configure enterprise-level Actions policies to allow only verified creators + specific allowlisted actions
4. Enable fine-grained PAT approval requirements at the enterprise level
5. Review the audit log for any `integration_installation.create` events in the past 30 days
**Outcome:** A documented app governance posture with recommendations

### Exercise 2: GitHub App Installation & Permission Review
**Objective:** Understand the app installation lifecycle from an admin perspective
**Steps:**
1. Register a private GitHub App with minimal permissions (read-only contents)
2. Install it on a test organization, selecting specific repositories
3. Observe the permission prompts and audit log entries generated
4. Modify the app to request additional permissions (e.g., write Issues)
5. Observe the approval flow for updated permissions at the org level
6. Restrict app installation to org owners only and attempt install as a repo admin
**Outcome:** Hands-on understanding of the permission model and admin controls

### Exercise 3: MCP Policy Configuration & Copilot Governance
**Objective:** Configure MCP policies for enterprise Copilot governance
**Steps:**
1. Navigate to enterprise AI controls and review the MCP policy (default: disabled)
2. Enable MCP for a specific organization
3. Configure a repository with a custom MCP server configuration for Copilot cloud agent
4. Review the GitHub MCP Registry to understand available integrations
5. Test that the policy correctly restricts/allows MCP usage based on subscription tier
6. Document a recommended MCP governance policy for the enterprise
**Outcome:** An enterprise MCP governance playbook

## Key Changes Since 2024

1. **MCP replaces Copilot Extensions as the primary extensibility model** — GitHub's Copilot extensibility documentation has pivoted from the earlier "Copilot Extensions" agent/skillset model to MCP as the primary mechanism. MCP works across IDE, CLI, and cloud agent surfaces [4].

2. **GitHub MCP Registry launched (public preview)** — A curated catalog of MCP servers at https://github.com/mcp, separate from GitHub Marketplace, providing a discovery hub for AI tool integrations [4].

3. **Enterprise MCP policy controls** — New "MCP servers in Copilot" policy available in enterprise AI controls, disabled by default, giving admins explicit control over MCP adoption [4][17].

4. **Repository policies (public preview)** — New governance primitive at enterprise level for controlling repository lifecycle events (creation, deletion, transfer, naming) with custom property-based targeting and delegated bypass workflows [16].

5. **Commit SHA pinning requirement for Actions** — Enterprise Actions policy now includes an option to require all actions be pinned to full-length commit SHAs, strengthening supply chain security [10].

6. **PAT lifetime enforcement at enterprise level** — Enterprise owners can now set and enforce maximum token lifetimes for both fine-grained and classic PATs, with the ability to exempt administrators [14].

7. **GitHub Apps remain unable to access enterprise-level object** — This limitation persists as of this research. Apps needing enterprise-level access (the enterprise object itself) still require OAuth Apps [2]. [NEEDS VERIFICATION — check if this has changed in recent releases.]

8. **Copilot cloud agent and coding agent integrations** — Third-party Marketplace apps can now assign work to Copilot's coding agent (e.g., "GitHub Copilot for Linear", "GitHub Copilot for Jira") [18].

## Sources

1. https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps — About Creating GitHub Apps
2. https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps — Differences Between GitHub Apps and OAuth Apps
3. https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview/about-github-marketplace-for-apps — About GitHub Marketplace for Apps
4. https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions — About Building Copilot Extensions (MCP)
5. https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/migrating-oauth-apps-to-github-apps — Migrating OAuth Apps to GitHub Apps
6. https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app — Choosing Permissions for a GitHub App
7. https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-oauth-access-to-your-organizations-data/about-oauth-app-access-restrictions — About OAuth App Access Restrictions
8. https://docs.github.com/en/apps/github-marketplace/creating-apps-for-github-marketplace/requirements-for-listing-an-app — Requirements for Listing an App
9. https://docs.github.com/en/apps/github-marketplace/listing-an-app-on-github-marketplace/setting-pricing-plans-for-your-listing — Setting Pricing Plans for Your Listing
10. https://docs.github.com/en/enterprise-cloud@latest/admin/policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise — Enforcing Policies for GitHub Actions in Your Enterprise
11. https://docs.github.com/en/apps/using-github-apps/about-using-github-apps — About Using GitHub Apps
12. https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-programmatic-access-to-your-organization/limiting-oauth-app-and-github-app-access-requests — Limiting OAuth App and GitHub App Access Requests
13. https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization — Setting a PAT Policy for Your Organization
14. https://docs.github.com/en/enterprise-cloud@latest/admin/policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-personal-access-tokens-in-your-enterprise — Enforcing Policies for PATs in Your Enterprise
15. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise — Audit Log Events for Your Enterprise
16. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-repositories-in-your-enterprise/governing-how-people-use-repositories-in-your-enterprise — Governing How People Use Repositories
17. https://docs.github.com/en/copilot/how-tos/administer/enterprises/managing-policies-and-features-for-copilot-in-your-enterprise — Managing Policies and Features for Copilot in Your Enterprise
18. https://github.com/marketplace?type=apps&query=copilot — GitHub Marketplace search: Copilot apps
