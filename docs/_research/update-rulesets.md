# Research Brief: Repository Rulesets (lab03 Update)

> **VBD Agenda Items:** 1.3 (Configure protected branches), 1.4 (Configure required status checks)
> **Priority:** P0
> **Researched:** April 2026
> **Status:** Ready for lab03 rewrite

## Overview

**Repository Rulesets** are GitHub's modern replacement for legacy branch protection rules. They went **generally available on July 24, 2023** [1] and have since become the recommended approach for governing how people interact with branches, tags, and pushes in repositories. Rulesets provide a named, layerable, status-aware collection of rules that can target branches, tags, or pushes — and can be applied at the repository, organization, or enterprise level.

The key differentiator from legacy branch protection is **composability**: multiple rulesets can apply simultaneously to the same branch, with the most restrictive version of each rule taking effect (rule layering). Legacy branch protection only allows a single rule to match a branch pattern, making it difficult to separate concerns (e.g., one rule for CI requirements, another for review requirements). Rulesets also introduce **enforcement statuses** (Active/Disabled, plus Evaluate on GHEC), **bypass actors** with granular permissions, **Rule Insights** for auditing, and **organization-wide application** across multiple repositories — all things that were impossible or required scripting with legacy branch protection.

For the VBD workshop, rulesets are the correct primary teaching tool. Legacy branch protection still exists and functions, but GitHub's documentation now points users toward rulesets as the preferred approach. The Settings UI still has both paths available: **Settings > Rules > Rulesets** (new) vs. **Settings > Branches** (legacy). The lab should use the rulesets path exclusively, with a brief sidebar noting legacy branch protection for context.

---

## Key Concepts

### Rulesets Overview

A ruleset is a **named list of rules** with an enforcement status, an optional bypass list, and targeting conditions. Rulesets come in three types:

| Type | Target | Availability |
|------|--------|-------------|
| **Branch ruleset** | Branches matching a pattern (including `~DEFAULT_BRANCH` and `~ALL` shortcuts) | All plans (public repos on Free; private repos on Pro/Team/Enterprise) |
| **Tag ruleset** | Tags matching a pattern | All plans (same as branch) |
| **Push ruleset** | Entire repository + fork network (no branch targeting — applies to all pushes) | GitHub Team plan and above (internal/private repos) |

**Limits:** Up to 75 rulesets per repository and 75 organization-wide rulesets.

**GA date:** July 24, 2023 (announced via GitHub Blog and Changelog) [1].

**Prebuilt recipes:** GitHub maintains [`github/ruleset-recipes`](https://github.com/github/ruleset-recipes) — a repository of importable JSON rulesets for common scenarios [2].

### Available Rules

The following rules can be added to **branch/tag rulesets**:

#### Branch/Tag Protection Rules

| Rule | Description | Default? |
|------|-------------|----------|
| **Restrict creations** | Only bypass actors can create matching branches/tags | No |
| **Restrict updates** | Only bypass actors can push to matching branches/tags | No |
| **Restrict deletions** | Only bypass actors can delete matching branches/tags | **Yes** (selected by default) |
| **Require linear history** | Prevents merge commits; requires squash or rebase merge | No |
| **Require deployments to succeed** | Changes must deploy successfully to specified environments before merging | No |
| **Require signed commits** | Commits must have verified signatures | No |
| **Require a pull request before merging** | All changes must go through a PR | No |
| **Require status checks to pass** | Specified CI checks must pass before merging | No |
| **Block force pushes** | Prevents force pushes to targeted branches/tags | **Yes** (enabled by default) |
| **Require merge queue** | Merges must go through a merge queue | No |
| **Require code scanning results** | Code scanning alerts must be clear before merging | No |
| **Require code quality results** | GitHub Code Quality checks must pass | No |

#### Pull Request Sub-Settings

When "Require a pull request before merging" is enabled, the following additional settings are available:

| Setting | Description |
|---------|-------------|
| **Required approving review count** | Number of approvals required (0–10) |
| **Dismiss stale reviews on push** | Dismiss approvals when new commits change the diff |
| **Require review from code owners** | Code owners must approve changes to their files |
| **Require approval of most recent push** | Last pusher cannot be the sole approver |
| **Require conversation resolution** | All review comments must be resolved |
| **Allowed merge methods** | Restrict to merge, squash, and/or rebase |
| **Required reviewers** | Require specific teams to review changes to specific file patterns (up to 15 teams) |

#### Status Check Sub-Settings

When "Require status checks to pass" is enabled:

| Setting | Description |
|---------|-------------|
| **Required status checks** | Named checks that must pass (with optional integration source filtering) |
| **Strict mode** | "Require branches to be up to date before merging" — branch must be current with base |
| **Do not enforce on create** | Allow branch/repo creation even if checks would otherwise block |

#### Push Ruleset Rules (Separate Type)

Push rulesets apply to the entire repository and fork network:

| Rule | Description |
|------|-------------|
| **Restrict file paths** | Block pushes with changes in specified file paths (fnmatch patterns) |
| **Restrict file path length** | Block pushes with file paths exceeding character limit |
| **Restrict file extensions** | Block pushes containing files with specified extensions |
| **Restrict file size** | Block pushes exceeding a file size limit |

#### Metadata Restrictions (GHEC Only)

Available on GitHub Enterprise Cloud:

| Rule | Description |
|------|-------------|
| **Commit message pattern** | Enforce patterns on commit messages (starts_with, ends_with, contains, regex) |
| **Commit author email pattern** | Enforce patterns on author email addresses |
| **Committer email pattern** | Enforce patterns on committer email addresses |
| **Branch name pattern** | Enforce naming conventions on branches |
| **Tag name pattern** | Enforce naming conventions on tags |

### Enforcement Modes

| Status | Behavior | Availability |
|--------|----------|-------------|
| **Active** | Rules are enforced immediately upon creation/activation | All plans |
| **Disabled** | Rules are not enforced; ruleset is preserved for later activation | All plans |
| **Evaluate** | Rules are checked but not enforced; results visible in Rule Insights | **GHEC only** |

**Evaluate mode** is a major advantage over legacy branch protection — you can test rules against real traffic before activating them, seeing what would pass/fail in the Rule Insights dashboard. This is critical for enterprise rollouts.

### Bypass Actors

Rulesets allow fine-grained bypass control. Eligible bypass actors:

| Actor Type | Examples |
|------------|---------|
| **Repository roles** | Admin, Maintain, Write (or custom roles based on Write) |
| **Organization admins** | Org owners |
| **Enterprise owners** | Enterprise admins |
| **Teams** | Any non-secret team |
| **GitHub Apps** | Installed apps with appropriate permissions |
| **Deploy keys** | For automated deployments |
| **Dependabot** | For automated dependency updates |

**Bypass modes:**
- **Always** — Actor can bypass rules on direct pushes and PRs
- **Pull request only** — Actor must open a PR but can bypass rules within the PR (creates audit trail)
- **Exempt** — Rules are not evaluated at all for this actor; no bypass audit entry is created

This is a significant improvement over legacy branch protection, where the only options were "admins can bypass" (on/off) and individual "restrict who can push" lists.

### Rule Layering

When multiple rulesets target the same branch or tag, rules are **aggregated**. The most restrictive version of each rule applies. Rulesets also layer with any existing branch protection rules on the same branch.

**Example:** Ruleset A requires 2 reviews; Ruleset B requires 3 reviews; a branch protection rule requires linear history. Result: 3 reviews AND linear history are required.

This enables powerful patterns like:
- A "base rules" ruleset with no bypass (block force pushes, block deletions)
- A "CI rules" ruleset with a bot bypass (require status checks, but let the CI bot skip them)
- An org-level ruleset enforcing reviews across all repos

### Organization & Enterprise Rulesets

#### Organization-Level Rulesets (Team & Enterprise Plans)

Organization owners can create rulesets that apply across multiple repositories:

**Navigation:** Organization Settings > Code, planning, and automation > Repository > Rulesets

**Repository targeting options:**
1. **All repositories** — Applies to every repo in the org
2. **Repositories matching a name** — Dynamic targeting using fnmatch patterns (e.g., `*-production`)
3. **Repositories matching a filter** — Target by custom properties (e.g., `visibility:private props.team:infra`)
4. **Only selected repositories** — Static list of specific repos

**Key behaviors:**
- Only org owners can edit org-level rulesets (repo admins cannot)
- Repo admins can still create repo-level rulesets that layer on top (additive, never less restrictive)
- Org rulesets prevent repo admins from renaming targeted branches or changing the default branch
- Rule Insights are available at the org level for monitoring

**Advanced features (GHEC):**
- **Evaluate mode** for dry-run testing across repositories
- **Ruleset history** — View changelog, compare changes, restore/revert, download JSON for any iteration (last 180 days)
- **Delegated bypass** — Contributors must request bypass approval from a designated team; requests expire after 7 days
- **Import/Export** — Export rulesets as JSON and import into other orgs/repos

#### Enterprise-Level Rulesets

Enterprise owners can create rulesets and **repository policies** that apply across all organizations:

**Navigation:** Enterprise Settings > Policies > Repository

**Repository policies** (public preview as of 2025) govern lifecycle events:
- Which visibilities are permitted for new repositories
- Who can create/delete/transfer repositories
- Repository naming conventions (regex patterns)

These are additive with org-level and repo-level rulesets — the most restrictive always wins.

### Migration from Branch Protection

#### Current State

Legacy branch protection rules and rulesets **coexist**. They layer together (the most restrictive rule wins). There is no automatic migration tool — you must manually recreate your branch protection settings as rulesets.

#### Migration Process

1. **Audit existing branch protection rules:** Go to Settings > Branches and document all rules for each protected branch pattern
2. **Create equivalent rulesets:** Go to Settings > Rules > Rulesets and create new branch rulesets with matching rules
3. **Verify layering:** With both active, the most restrictive version applies — test that the combined effect is correct
4. **Test with Evaluate mode (GHEC):** If available, set new rulesets to Evaluate first and check Rule Insights
5. **Remove legacy rules:** Once confident, delete the branch protection rules from Settings > Branches
6. **Verify:** Test pushing directly to the protected branch, opening PRs, etc.

#### Key Differences to Note During Migration

| Feature | Branch Protection | Rulesets |
|---------|------------------|---------|
| Multiple rules per branch | Only one rule matches | Multiple rulesets can layer |
| Status management | Delete to disable | Set to Disabled/Evaluate/Active |
| Visibility | Admins only | Anyone with read access can view active rules |
| Bypass control | "Do not allow bypassing" toggle | Granular bypass per actor with modes (always/PR-only/exempt) |
| Organization-wide | Not available (per-repo only) | Available on Team & Enterprise plans |
| Commit metadata rules | Not available | Available on GHEC |
| Push restrictions by file | Not available | Push rulesets (Team+) |
| Audit/Insights | Limited | Rule Insights dashboard |
| Import/Export | Not available | JSON import/export |
| API | Separate branch protection API | Unified rulesets API |
| Evaluate mode | Not available | Available on GHEC |

#### What Still Requires Branch Protection?

As of 2025, branch protection has **not been deprecated** — it's still fully functional. However, GitHub's documentation and blog posts consistently recommend rulesets as the modern approach. There's no official deprecation timeline announced.

Some edge cases where branch protection might still be used:
- **Legacy automation** that uses the branch protection API and hasn't been updated
- **GitHub Free** users with private repos (rulesets require Pro/Team/Enterprise for private repos)
- Organizations with existing tooling/scripts built around branch protection API endpoints

### Rulesets API

#### Repository-Level Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/repos/{owner}/{repo}/rulesets` | List all rulesets for a repository |
| `POST` | `/repos/{owner}/{repo}/rulesets` | Create a new ruleset |
| `GET` | `/repos/{owner}/{repo}/rulesets/{ruleset_id}` | Get a specific ruleset |
| `PUT` | `/repos/{owner}/{repo}/rulesets/{ruleset_id}` | Update a ruleset |
| `DELETE` | `/repos/{owner}/{repo}/rulesets/{ruleset_id}` | Delete a ruleset |
| `GET` | `/repos/{owner}/{repo}/rules/branches/{branch}` | Get all active rules for a branch |

#### Organization-Level Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orgs/{org}/rulesets` | List all org rulesets |
| `POST` | `/orgs/{org}/rulesets` | Create an org ruleset |
| `GET` | `/orgs/{org}/rulesets/{ruleset_id}` | Get a specific org ruleset |
| `PUT` | `/orgs/{org}/rulesets/{ruleset_id}` | Update an org ruleset |
| `DELETE` | `/orgs/{org}/rulesets/{ruleset_id}` | Delete an org ruleset |

#### Key API Fields

```json
{
  "name": "production-branch-protection",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [
    {
      "actor_id": 1,
      "actor_type": "OrganizationAdmin",
      "bypass_mode": "pull_request"
    }
  ],
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "required_status_checks": [
          { "context": "build" }
        ],
        "strict_required_status_checks_policy": false
      }
    }
  ]
}
```

#### Permissions Required

- **Read rulesets:** "Metadata" repository permission (read) — or unauthenticated for public repos
- **Create/edit/delete rulesets:** "Administration" repository or organization permission (write)
- **GraphQL:** `createRepositoryRuleset` and `updateRepositoryRuleset` mutations are also available

### Branch Protection (Legacy)

#### Current Status

Branch protection rules are **still functional and not deprecated** as of 2025. They are found at:
- **UI:** Settings > Branches > Branch protection rules
- **API:** `GET/PUT/DELETE /repos/{owner}/{repo}/branches/{branch}/protection`

#### Feature Comparison

Branch protection supports:
- Require pull request reviews before merging (with dismiss stale reviews, code owner review, last push approval)
- Require status checks before merging (strict/loose mode)
- Require conversation resolution
- Require signed commits
- Require linear history
- Require merge queue
- Require deployments to succeed
- Lock branch (read-only)
- Do not allow bypassing the above settings
- Restrict who can push to matching branches
- Allow force pushes (to specific actors)
- Allow deletions

#### Limitations vs. Rulesets

1. **Single rule per branch pattern** — Only one branch protection rule can match at a time, making it difficult to know which rule applies
2. **Admin-only visibility** — Only admins can see what rules are in place
3. **Coarse bypass control** — Just a "do not allow bypassing" toggle; no granular per-actor bypass
4. **No organization-wide enforcement** — Must be configured per-repository
5. **No evaluate/dry-run mode** — Rules are either on or off
6. **No audit insights** — No dashboard showing pass/fail/bypass events
7. **No import/export** — Cannot share rulesets as JSON
8. **No metadata rules** — Cannot enforce commit message or branch naming patterns

---

## lab03 Rewrite Plan

### Lab Title (Proposed)

**"3 - Managing Repository Rulesets"**

### Duration

10–15 minutes (increased from 5–10 to accommodate the richer UI and concepts)

### Prerequisites

- Repository admin access
- A GitHub Actions workflow that produces a status check (from lab02)
- A CODEOWNERS file in the repository

### Step-by-Step Plan

#### 3.1 Create a Branch Ruleset

1. Navigate to your repository on GitHub.com
2. Click **Settings** in the repository navigation bar
3. In the left sidebar, under **"Code and automation"**, click **Rules**, then click **Rulesets**
4. Click **New ruleset**, then select **New branch ruleset**
5. Configure the ruleset:
   - **Ruleset name:** `default-branch-protection`
   - **Enforcement status:** Leave as **Active** (default)

#### 3.2 Configure Bypass Actors

1. In the **"Bypass list"** section, click **Add bypass**
2. Search for and select **"Repository admin"**
3. Change the bypass mode from **"Always"** to **"For pull requests only"** (this ensures admins must open PRs but can merge without waiting for all checks — creating an audit trail)
4. Click **Add Selected**

#### 3.3 Set Target Branches

1. In the **"Target branches"** section, click **Add a target**
2. Select **"Include default branch"** (this uses the `~DEFAULT_BRANCH` shortcut, which automatically targets `main` or `master`)
3. _(Optional)_ Add another target: click **Add a target** > **Include by pattern** and enter `release/**` to also protect release branches

#### 3.4 Configure Branch Protection Rules

In the **"Branch protections"** section, enable the following rules:

1. **Restrict deletions** — ✅ Already selected by default. Leave enabled.
2. **Require a pull request before merging** — ✅ Check this box
   - Set **Required approvals** to `1`
   - ✅ Check **"Dismiss stale pull request approvals when new commits are pushed"**
   - ✅ Check **"Require review from Code Owners"**
   - ✅ Check **"Require conversation resolution before merging"**
3. **Require status checks to pass before merging** — ✅ Check this box
   - In the search box, type `build` and select the status check from lab02
   - _(If lab02 was not completed, create a simple workflow first)_
   - ✅ Check **"Require branches to be up to date before merging"**
4. **Block force pushes** — ✅ Already enabled by default. Leave enabled.

#### 3.5 Create the Ruleset

1. Click **Create** at the bottom of the page
2. Verify the ruleset appears in the Rulesets list with status **"Active"**

#### 3.6 View the Ruleset as a Contributor

1. Navigate to the repository's **Code** tab
2. In the file tree, open the branch dropdown and click **"View all branches"**
3. Notice the 🛡️ shield icon next to the default branch — click it to view active rules
4. _(Alternative)_ Navigate directly to `https://github.com/{owner}/{repo}/rules` to see all active rules

#### 3.7 Test the Ruleset

1. Try to edit a file directly on the default branch via the GitHub UI
2. Observe that GitHub forces you to create a new branch and open a pull request
3. Create a new branch `feature/lab03` and commit the change
4. Open a pull request from `feature/lab03` to `main`
5. Observe the merge box shows:
   - ❌ Review required (code owner approval needed)
   - ❌ Status check `build` pending/required
6. Wait for the `build` check to pass (or trigger it if needed)
7. Ask the code owner to review and approve the PR
8. Once all checks pass and the review is approved, merge the PR

#### 3.8 _(Optional)_ View Rule Insights

1. Go to **Settings > Rules > Insights**
2. Review the timeline of rule evaluations — you should see your recent PR activity with pass/fail/bypass events

### Sidebar: Legacy Branch Protection

> **Note:** Prior to rulesets (GA July 2023), branch protection rules were the only way to protect branches. They are found at **Settings > Branches** and still function today. Rulesets are the recommended modern approach because they support layering multiple rules, have an Active/Disabled status, provide visibility to all contributors (not just admins), and can be applied at the organization level. You do **not** need to migrate existing branch protection rules — they coexist with rulesets, and the most restrictive combination of both applies.

---

## What to Cover in Workshop (L300)

### Enterprise-Scale Governance Topics

1. **Organization-level rulesets** — Creating rulesets that apply across all repositories in an org
   - Repository targeting: all repos, by naming convention, by custom properties, by static selection
   - `~ALL` and `~DEFAULT_BRANCH` shortcuts for broad coverage
   - Preventing repo admins from weakening org-level rules (additive only)

2. **Evaluate mode (GHEC)** — Dry-running rulesets before activating
   - How to set enforcement to "Evaluate"
   - Reading Rule Insights to understand impact
   - Transitioning from Evaluate → Active

3. **Layered ruleset architecture** — Real-world patterns
   - "Base rules" with no bypass (deletions, force push)
   - "CI rules" with bot bypass (status checks)
   - "Review rules" with admin bypass for pull_request-only mode
   - Org-level + repo-level layering

4. **Bypass governance** — Best practices
   - "Pull request only" bypass vs. "Always" bypass
   - Using a break-glass team on the bypass list
   - Delegated bypass for push rulesets (approval workflow)

5. **Metadata restrictions (GHEC)** — Commit message patterns, branch naming conventions, author email enforcement

6. **Push rulesets** — Blocking file types, restricting file sizes across the fork network

7. **API-driven ruleset management** — Using REST API to:
   - Audit rulesets across all repos (`GET /repos/{owner}/{repo}/rulesets`)
   - Create standardized rulesets programmatically (`POST /repos/{owner}/{repo}/rulesets`)
   - Import/export rulesets as JSON for consistency across orgs

8. **Ruleset history and auditability** — Reviewing the 180-day changelog, comparing/reverting iterations

9. **Migration strategy** — How to move from branch protection to rulesets
   - Audit → Create parallel rulesets → Evaluate → Activate → Remove legacy rules
   - No automated migration tool exists; must be manual or scripted via API

10. **Custom repository properties for targeting** — Using org-level custom properties to dynamically target repos (e.g., `compliance-level: high` → stricter rules)

---

## Sources

1. GitHub Blog: "GitHub Repository Rules Are Now Generally Available" (July 24, 2023) — https://github.blog/2023-07-24-github-repository-rules-are-now-generally-available/
2. GitHub `ruleset-recipes` repository — https://github.com/github/ruleset-recipes
3. GitHub Docs: "About rulesets" — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
4. GitHub Docs: "Available rules for rulesets" — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
5. GitHub Docs: "Creating rulesets for a repository" — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository
6. GitHub Docs: "Managing rulesets for a repository" — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository
7. GitHub Docs: "Creating rulesets for repositories in your organization" — https://docs.github.com/en/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization
8. GitHub Docs: "Managing rulesets for repositories in your organization" (GHEC) — https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization
9. GitHub Docs: "About protected branches" (legacy) — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
10. GitHub Docs: REST API — Repository Rules — https://docs.github.com/en/rest/repos/rules
11. GitHub Docs: REST API — Organization Rules — https://docs.github.com/en/rest/orgs/rules
12. GitHub Docs: "Governing how people use repositories in your enterprise" — https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-repositories-in-your-enterprise/governing-how-people-use-repositories-in-your-enterprise
13. GitHub Changelog: "Repository Rules are generally available" (July 24, 2023) — https://github.blog/changelog/2023-07-24-repository-rules-are-generally-available/
