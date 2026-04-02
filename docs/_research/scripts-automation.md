# Research Brief: Scripts & Automation

> **VBD Agenda Items:** 2.12 (Scripts and automation)
> **Priority:** P1
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

GitHub Enterprise Cloud administration at scale demands automation. Manual operations across hundreds of repositories, thousands of users, and complex compliance requirements are unsustainable. GitHub provides a layered automation ecosystem: the **gh CLI** for interactive and scriptable operations, **REST and GraphQL APIs** for programmatic access, **webhooks** for event-driven automation, **GitHub Actions** for scheduled and triggered workflows, and **GitHub Apps** for long-lived integrations with fine-grained permissions.

For GHEC administrators, the critical automation use cases include: bulk repository management (creation, archival, settings enforcement), user lifecycle management (onboarding, offboarding, role changes), compliance reporting (audit log streaming, license usage, security posture), and policy enforcement (branch protection, code security configurations). The choice of automation tool depends on the use case: gh CLI for ad-hoc admin tasks and shell scripts, REST API for CRUD operations and bulk changes, GraphQL for complex reporting queries, webhooks for real-time event reactions, and GitHub Actions for scheduled administrative workflows.

This brief covers each layer of the automation stack with practical code examples at L300 depth, focusing on GHEC enterprise administration patterns. All examples use current API versions and tool releases as of April 2026.

## Key Concepts

### gh CLI for Administration

The GitHub CLI (`gh`) is preinstalled on all GitHub-hosted runners and supports direct authentication with GitHub Enterprise Cloud via `gh auth login --hostname <hostname>` [1]. For enterprise environments, authentication can use the `GH_ENTERPRISE_TOKEN` environment variable for scripting and `GH_HOST` to set a default host [1].

#### Key Admin Commands

**Organization management:**
```bash
# List all repos in an organization (JSON output for scripting)
gh repo list my-org --limit 1000 --json name,visibility,isArchived

# Create a repo with specific settings
gh repo create my-org/new-repo --private --template my-org/template-repo

# Clone all org repos for auditing
gh repo list my-org --limit 500 --json nameWithOwner -q '.[].nameWithOwner' | \
  xargs -I {} gh repo clone {}
```

**Repository administration:**
```bash
# Bulk-update repo settings via API through gh
gh api repos/my-org/my-repo -X PATCH \
  -f default_branch=main \
  -F has_wiki=false \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=true

# Archive repositories in bulk
gh repo list my-org --archived=false --json name -q '.[].name' | \
  while read repo; do
    gh repo archive "my-org/$repo" --yes
  done

# List repo collaborators with permissions
gh api repos/my-org/my-repo/collaborators --paginate \
  --jq '.[] | [.login, .role_name] | @tsv'
```

**Using `gh api` for admin endpoints:**
```bash
# Get organization settings (requires admin:org scope)
gh api orgs/my-org --jq '{
  default_permission: .default_repository_permission,
  two_factor: .two_factor_requirement_enabled,
  members_can_create_repos: .members_can_create_repositories,
  members_can_fork_private: .members_can_fork_private_repositories
}'

# List org members with roles
gh api orgs/my-org/members --paginate \
  --jq '.[] | [.login, .site_admin] | @tsv'

# Get enterprise audit log
gh api /enterprises/my-enterprise/audit-log \
  -F phrase='action:repo.create' \
  -F per_page=100 \
  --paginate
```

#### gh CLI Extensions for Admin

Extensions are custom commands distributed as repositories with the `gh-extension` topic. They extend the CLI's capabilities for specialized admin tasks [2].

```bash
# Install an extension
gh extension install mislav/gh-branch-clean
gh extension install github/gh-net

# Create a custom admin extension
gh extension create --precompiled=go gh-org-audit

# List installed extensions
gh extension list
```

Notable admin-relevant extensions discoverable at `https://github.com/topics/gh-extension` [2]:
- **gh-dash** — Dashboard for PRs and issues across repos
- **gh-poi** — Clean up local branches safely
- **gh-branch-clean** — Delete merged branches at scale
- **gh-net** — Network diagnostic tool for GitHub

#### Scripting Best Practices with gh CLI

```bash
# Use --json + --jq for machine-readable output
gh repo list my-org --json name,visibility,pushedAt \
  --jq '.[] | select(.visibility == "PUBLIC") | .name'

# Programmatic issue creation (non-interactive mode)
gh issue create --title "My Title" --body "Issue description"

# Disable interactive prompts in scripts
gh pr list --json number,title,mergeStateStatus
```

The `--json` flag with `--jq` filtering makes gh CLI output scriptable without additional parsing tools [2].

### REST API Admin Patterns

The GitHub REST API uses standard HTTP verbs and returns JSON. Authentication uses personal access tokens, GitHub App tokens, or OAuth tokens with the `Authorization: Bearer <token>` header [3]. The current API version header is `X-GitHub-Api-Version: 2026-03-10` [4].

#### Bulk Repository Operations

```bash
# List all organization repos with pagination
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/orgs/my-org/repos?type=all&per_page=100&page=1"

# Create repository with specific settings
curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/orgs/my-org/repos" \
  -d '{
    "name": "new-repo",
    "private": true,
    "visibility": "internal",
    "has_wiki": false,
    "delete_branch_on_merge": true,
    "allow_squash_merge": true,
    "squash_merge_commit_title": "PR_TITLE"
  }'

# Update organization settings
curl -L -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/orgs/my-org" \
  -d '{
    "default_repository_permission": "read",
    "members_can_create_public_repositories": false,
    "members_can_create_private_repositories": true,
    "members_can_fork_private_repositories": false,
    "two_factor_requirement_enabled": true,
    "web_commit_signoff_required": true
  }'
```

The organization update endpoint supports fine-grained permissions control including `members_can_create_internal_repositories` for GHEC organizations [4].

#### User Management & Membership

```bash
# List organization members
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/orgs/my-org/members?per_page=100"

# Set organization membership role
curl -L -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/orgs/my-org/memberships/username" \
  -d '{"role": "admin"}'

# Remove a member
curl -L -X DELETE \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/orgs/my-org/members/username"
```

#### Enterprise Audit Log API

The audit log API for enterprises has a dedicated rate limit of 1,750 queries per hour per user and IP. It supports searching with the `phrase` parameter and filtering by `include` (web, git, or all events) [5].

```bash
# Query enterprise audit log for repo creation events
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/enterprises/my-enterprise/audit-log?phrase=action:repo.create&per_page=100"

# Query for specific user actions
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/enterprises/my-enterprise/audit-log?phrase=actor:octocat&include=all"
```

The audit log retains events for 180 days, with Git events retained for 7 days [6]. Audit log streaming can send data to Azure Blob Storage, Azure Event Hubs, Amazon S3, Splunk, Google Cloud Storage, or Datadog [5].

#### Pagination

REST API responses are paginated (default 30 items, max 100 per page). Use the `Link` header to navigate pages [7]:

```bash
# Link header example
# link: <https://api.github.com/repositories/1300192/issues?page=2>; rel="next",
#        <https://api.github.com/repositories/1300192/issues?page=515>; rel="last"
```

Using Octokit.js for automatic pagination [7]:
```javascript
import { Octokit } from "octokit";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const allRepos = await octokit.paginate("GET /orgs/{org}/repos", {
  org: "my-org",
  per_page: 100,
  headers: { "X-GitHub-Api-Version": "2026-03-10" },
});
console.log(`Total repos: ${allRepos.length}`);
```

### GraphQL API

GitHub's GraphQL API allows fetching precisely the data you need in a single request, replacing multiple REST calls [3]. The single endpoint is `POST https://api.github.com/graphql` [8].

#### When to Use GraphQL vs REST

| Scenario | Recommended API | Reason |
|----------|----------------|--------|
| Fetch nested data (org → repos → branches) | GraphQL | Single request vs. N+1 REST calls [3] |
| Simple CRUD operations | REST | Simpler, familiar HTTP verbs [3] |
| Complex reporting queries | GraphQL | Request only needed fields [8] |
| Bulk mutations (create/update) | REST | GraphQL mutations are more verbose [3] |
| Enterprise-wide queries | GraphQL | Enterprise object traversal [9] |
| Webhooks + reactions | REST | Webhooks deliver REST-shaped payloads |

#### Admin-Relevant GraphQL Queries

**Organization members and repositories:**
```graphql
query OrgOverview($org: String!) {
  organization(login: $org) {
    membersWithRole(first: 100) {
      totalCount
      nodes {
        login
        name
        organizationVerifiedDomainEmails(login: $org)
      }
    }
    repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
        visibility
        isArchived
        defaultBranchRef { name }
        branchProtectionRules(first: 5) {
          nodes {
            pattern
            requiresApprovingReviews
            requiredApprovingReviewCount
          }
        }
      }
    }
  }
}
```

**Enterprise query (GHEC):**
```graphql
query EnterpriseOverview($slug: String!) {
  enterprise(slug: $slug) {
    organizations(first: 100) {
      totalCount
      nodes {
        login
        membersWithRole { totalCount }
        repositories { totalCount }
      }
    }
    members(first: 100) {
      totalCount
      nodes {
        ... on EnterpriseUserAccount {
          login
          organizations(first: 10) {
            nodes { login }
          }
        }
      }
    }
  }
}
```

**Using GraphQL via gh CLI:**
```bash
gh api graphql -F org='my-org' -f query='
  query($org: String!) {
    organization(login: $org) {
      repositories(first: 100) {
        totalCount
        nodes { name visibility isArchived }
      }
    }
  }
' --jq '.data.organization.repositories'
```

#### GraphQL Pagination (Cursor-Based)

```graphql
query PaginatedRepos($org: String!, $cursor: String) {
  organization(login: $org) {
    repositories(first: 100, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        visibility
      }
    }
  }
}
```

GraphQL uses cursor-based pagination with `pageInfo.hasNextPage` and `pageInfo.endCursor`, which is more reliable than offset-based REST pagination for large datasets [8].

### Webhooks

Webhooks deliver HTTP POST payloads to a configured URL when subscribed events occur on GitHub. They can be configured at the repository, organization, or enterprise level [10].

#### Setup and Configuration

Webhooks require:
1. A **payload URL** — the server endpoint receiving events
2. A **content type** — `application/json` or `application/x-www-form-urlencoded`
3. A **secret** — for signature verification
4. **Event subscriptions** — specific events to listen for

```bash
# Create an organization webhook via REST API
curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/orgs/my-org/hooks" \
  -d '{
    "name": "web",
    "active": true,
    "events": ["repository", "member", "team", "organization"],
    "config": {
      "url": "https://my-server.example.com/webhooks",
      "content_type": "json",
      "secret": "my-webhook-secret",
      "insecure_ssl": "0"
    }
  }'
```

#### Admin-Relevant Webhook Events

Key events for GHEC administration [11]:
- **`organization`** — member added/removed, org renamed
- **`repository`** — created, deleted, archived, visibility changed
- **`member`** — added, removed, edited
- **`team`** — created, deleted, member added/removed
- **`branch_protection_rule`** — created, edited, deleted
- **`branch_protection_configuration`** — disabled
- **`membership`** — added, removed from team
- **`org_block`** — blocked/unblocked user

#### Webhook Security (Signature Verification)

GitHub signs webhook payloads using HMAC-SHA256 with your secret token. The signature is delivered in the `X-Hub-Signature-256` header [12]. **Always verify signatures** to ensure payloads are from GitHub and untampered.

**Python verification:**
```python
import hashlib
import hmac

def verify_signature(payload_body, secret_token, signature_header):
    """Verify that the payload was sent from GitHub by validating SHA256."""
    if not signature_header:
        raise HTTPException(status_code=403, detail="x-hub-signature-256 header is missing!")
    hash_object = hmac.new(
        secret_token.encode('utf-8'),
        msg=payload_body,
        digestmod=hashlib.sha256
    )
    expected_signature = "sha256=" + hash_object.hexdigest()
    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(status_code=403, detail="Request signatures didn't match!")
```

**JavaScript verification:**
```javascript
async function verifySignature(secret, header, payload) {
    let parts = header.split("=");
    let sigHex = parts[1];
    let encoder = new TextEncoder();
    let algorithm = { name: "HMAC", hash: { name: 'SHA-256' } };
    let keyBytes = encoder.encode(secret);
    let key = await crypto.subtle.importKey(
        "raw", keyBytes, algorithm, false, ["sign", "verify"]
    );
    let sigBytes = hexToBytes(sigHex);
    let dataBytes = encoder.encode(payload);
    return await crypto.subtle.verify(algorithm.name, key, sigBytes, dataBytes);
}
```

**TypeScript with Octokit:**
```typescript
import { Webhooks } from "@octokit/webhooks";
const webhooks = new Webhooks({ secret: process.env.WEBHOOK_SECRET });

const handleWebhook = async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const body = await req.text();
  if (!(await webhooks.verify(body, signature))) {
    res.status(401).send("Unauthorized");
    return;
  }
  // Process the verified webhook payload
};
```

Critical security points [12]:
- Always use `X-Hub-Signature-256` (SHA-256), not the legacy `X-Hub-Signature` (SHA-1)
- **Never** use plain `==` comparison — use constant-time comparison functions like `hmac.compare_digest` or `crypto.timingSafeEqual`
- Store the webhook secret securely (never hardcode or commit to repos)
- Payloads are capped at 25 MB [11]

### GitHub Actions for Admin Tasks

GitHub Actions workflows can run on a schedule (`cron`), making them ideal for recurring administrative tasks. The gh CLI is preinstalled on all GitHub-hosted runners [13].

#### Scheduled Admin Workflow Patterns

**Stale branch cleanup:**
```yaml
name: Stale Branch Cleanup
on:
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 6:00 UTC
  workflow_dispatch: {}

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Delete stale branches
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          STALE_DATE=$(date -d '90 days ago' --iso-8601)
          gh api repos/${{ github.repository }}/branches --paginate \
            --jq ".[] | select(.name != \"main\") | .name" | \
          while read branch; do
            LAST_COMMIT_DATE=$(gh api repos/${{ github.repository }}/commits/$branch \
              --jq '.commit.committer.date')
            if [[ "$LAST_COMMIT_DATE" < "$STALE_DATE" ]]; then
              echo "Deleting stale branch: $branch (last commit: $LAST_COMMIT_DATE)"
              gh api repos/${{ github.repository }}/git/refs/heads/$branch -X DELETE
            fi
          done
```

**Organization compliance report:**
```yaml
name: Compliance Report
on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8:00 UTC

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Generate compliance report
        env:
          GH_TOKEN: ${{ secrets.ORG_ADMIN_TOKEN }}
        run: |
          echo "## Daily Compliance Report" > report.md
          echo "Generated: $(date -u)" >> report.md
          echo "" >> report.md

          # Check 2FA enforcement
          ORG_INFO=$(gh api orgs/my-org)
          TWO_FA=$(echo "$ORG_INFO" | jq -r '.two_factor_requirement_enabled')
          echo "### 2FA Enforcement: $TWO_FA" >> report.md

          # Count repos by visibility
          echo "### Repository Visibility" >> report.md
          gh api orgs/my-org/repos --paginate -q '.[] | .visibility' | \
            sort | uniq -c | while read count vis; do
              echo "- $vis: $count" >> report.md
            done

          # Check for repos without branch protection on main
          echo "### Repos Missing Branch Protection on main" >> report.md
          gh repo list my-org --json name --limit 500 -q '.[].name' | \
          while read repo; do
            if ! gh api repos/my-org/$repo/branches/main/protection 2>/dev/null; then
              echo "- $repo" >> report.md
            fi
          done

      - name: Create issue with report
        env:
          GH_TOKEN: ${{ secrets.ORG_ADMIN_TOKEN }}
        run: |
          gh issue create \
            --repo my-org/admin-reports \
            --title "Compliance Report $(date +%Y-%m-%d)" \
            --body-file report.md \
            --label "compliance,automated"
```

**Open issues tracking with GraphQL in Actions [13]:**
```yaml
name: Report remaining open issues
on:
  schedule:
    - cron: '20 8 * * *'
jobs:
  track_pr:
    runs-on: ubuntu-latest
    steps:
      - run: |
          numOpenIssues="$(gh api graphql -F owner=$OWNER -F name=$REPO -f query='
            query($name: String!, $owner: String!) {
              repository(owner: $owner, name: $name) {
                issues(states:OPEN){
                  totalCount
                }
              }
            }
          ' --jq '.data.repository.issues.totalCount')"
          echo 'NUM_OPEN_ISSUES='$numOpenIssues >> $GITHUB_ENV
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OWNER: ${{ github.repository_owner }}
          REPO: ${{ github.event.repository.name }}
      - run: |
          gh issue create --title "Issue report" \
            --body "$NUM_OPEN_ISSUES issues remaining" \
            --repo $GITHUB_REPOSITORY
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Workflow Dispatch for Admin Triggers

The REST API supports triggering workflows programmatically via `workflow_dispatch` events [14]:

```bash
# Trigger an admin workflow via API
curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/repos/my-org/admin-tools/actions/workflows/cleanup.yml/dispatches" \
  -d '{"ref": "main", "inputs": {"target_org": "my-org", "dry_run": "true"}}'
```

### GitHub Apps

GitHub Apps are the recommended way to build long-lived integrations. They offer fine-grained permissions, higher rate limits, act as their own identity (not tied to a user), and support both webhook-driven and API-driven patterns [15].

#### Key Advantages for Admin Automation

- **Fine-grained permissions** — request only the permissions needed (e.g., "Administration" for org settings, "Members" for membership management) [15]
- **Installation access tokens** — short-lived tokens scoped to specific repositories or organizations
- **Webhook subscriptions** — built-in webhook support for event-driven automation
- **Higher rate limits** — 5,000 requests/hour per installation (vs. 5,000/hour per user for PATs)
- **Act independently** — server-to-server authentication without a user context [15]

#### GitHub App Authentication Flow

```javascript
// 1. Generate a JWT from the App's private key
// 2. Use JWT to request an installation access token
// 3. Use installation token for API calls

const { createAppAuth } = require("@octokit/auth-app");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: process.env.INSTALLATION_ID,
  },
});

// Now use octokit with installation-scoped permissions
const { data: repos } = await octokit.repos.listForOrg({ org: "my-org" });
```

#### Probot Framework

Probot is a framework for building GitHub Apps in Node.js. It handles webhook verification, authentication, and provides an Octokit client [16].

```javascript
// A Probot app that enforces branch protection on new repos
export default (app) => {
  app.on("repository.created", async (context) => {
    const { repository } = context.payload;
    context.log.info(`New repo created: ${repository.full_name}`);

    // Enforce branch protection on the default branch
    await context.octokit.repos.updateBranchProtection({
      owner: repository.owner.login,
      repo: repository.name,
      branch: repository.default_branch,
      required_status_checks: { strict: true, contexts: [] },
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
      },
      restrictions: null,
    });

    context.log.info(`Branch protection applied to ${repository.full_name}`);
  });

  app.on("member.added", async (context) => {
    const { member, organization } = context.payload;
    context.log.info(`${member.login} added to ${organization.login}`);
    // Could trigger onboarding workflows, send notifications, etc.
  });
};
```

Probot provides `context.octokit` which is an authenticated Octokit client that can make both REST and GraphQL calls [16].

### actions/github-script

The `actions/github-script` action (current major version: **v8**, using Node 24 runtime) provides a pre-authenticated Octokit client directly in workflow steps [17]. It passes `github`, `context`, `core`, `glob`, `io`, `exec`, and `require` to your script.

#### Version History

| Version | Runtime | Key Change |
|---------|---------|------------|
| v8 | Node 24 | Requires runner v2.327.1+ [17] |
| v7 | Node 20 | REST API previews removed [17] |
| v6 | Node 16 | Runtime update |
| v5 | Node 12→16 | `github.rest.*` namespace for REST methods [17] |

#### Admin Automation Patterns

**Auto-label and comment on issues:**
```yaml
on:
  issues:
    types: [opened]

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v8
        with:
          script: |
            // Add triage label
            github.rest.issues.addLabels({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: ['Triage']
            })

            // Post welcome comment
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '👋 Thanks for reporting! Our team will triage this shortly.'
            })
```

**Run GraphQL queries in github-script [17]:**
```yaml
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v8
        with:
          script: |
            const query = `query($owner:String!, $name:String!) {
              repository(owner:$owner, name:$name){
                branchProtectionRules(first: 10) {
                  nodes {
                    pattern
                    requiresApprovingReviews
                    requiredApprovingReviewCount
                    requiresStatusChecks
                  }
                }
              }
            }`;
            const result = await github.graphql(query, {
              owner: context.repo.owner,
              name: context.repo.repo
            });
            console.log(JSON.stringify(result, null, 2));
```

**Use output for cross-step data [17]:**
```yaml
steps:
  - uses: actions/github-script@v8
    id: get-repos
    with:
      result-encoding: string
      retries: 3
      script: |
        const repos = await github.paginate(github.rest.repos.listForOrg, {
          org: 'my-org',
          per_page: 100
        });
        return repos.map(r => r.name).join(',');
  - run: echo "Repos - ${{ steps.get-repos.outputs.result }}"
```

**Run external scripts [17]:**
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/github-script@v8
    with:
      script: |
        const script = require('./scripts/admin-check.js')
        await script({github, context, core})
```

**Security note:** Always pass inputs via `env` vars rather than inline expressions to prevent script injection [17]:
```yaml
- uses: actions/github-script@v8
  env:
    TITLE: ${{ github.event.pull_request.title }}
  with:
    script: |
      const title = process.env.TITLE;
      if (title.startsWith('octocat')) {
        console.log("PR title starts with 'octocat'");
      }
```

## What to Cover in Workshop (L300)

### Essential Topics
1. **gh CLI scripting patterns** — Using `gh api` with `--paginate`, `--jq`, and `--template` for admin reporting. Demonstrate bulk operations across org repos.
2. **REST vs GraphQL decision framework** — When to use each API, with concrete examples of the same task implemented both ways. Show the N+1 problem that GraphQL solves.
3. **Webhook security** — Live demo of HMAC-SHA256 signature verification. Explain why constant-time comparison matters (timing attacks).
4. **Scheduled Actions for compliance** — Build a workflow that runs daily to check branch protection, 2FA status, and repo visibility. Output results as an issue or to a Slack channel.
5. **GitHub Apps vs PATs** — Permission model comparison, token lifetime, rate limits. Why GitHub Apps are preferred for production automation.
6. **Enterprise audit log API** — Querying audit logs programmatically, streaming to external SIEM systems (Splunk, Azure Sentinel). Cover the 1,750 queries/hour rate limit.
7. **actions/github-script v8** — Using the pre-authenticated Octokit client for inline API calls in workflows. Cover security best practices for script injection prevention.

### Advanced Topics
- Building custom gh CLI extensions for org-specific admin tasks
- Probot app development for webhook-driven policy enforcement
- GraphQL cursor-based pagination for large enterprise queries
- Audit log streaming configuration via the REST API
- Fine-grained PATs vs classic tokens — scoping and lifecycle management

## Workshop Exercise Ideas

### Exercise 1: Organization Health Check Script
**Duration:** 30 minutes | **Difficulty:** L300

Build a shell script using `gh` CLI that audits an organization:
- Lists all repos missing branch protection on the default branch
- Identifies repos with no CODEOWNERS file
- Reports repos that haven't been pushed to in 90+ days
- Outputs results as a formatted markdown report

```bash
#!/usr/bin/env bash
# org-health-check.sh — Audit organization repository health
set -euo pipefail
ORG="${1:?Usage: org-health-check.sh <org-name>}"

echo "# Organization Health Report: $ORG"
echo "Generated: $(date -u)"
echo ""

echo "## Repos Without Branch Protection on Default Branch"
gh repo list "$ORG" --json name,defaultBranchRef --limit 500 \
  -q '.[].name' | while read -r repo; do
    if ! gh api "repos/$ORG/$repo/branches/$(gh repo view "$ORG/$repo" --json defaultBranchRef -q '.defaultBranchRef.name')/protection" 2>/dev/null >/dev/null; then
      echo "- ❌ $repo"
    fi
done

echo ""
echo "## Stale Repos (no push in 90+ days)"
STALE=$(date -d '90 days ago' +%Y-%m-%dT%H:%M:%SZ)
gh repo list "$ORG" --json name,pushedAt --limit 500 \
  -q ".[] | select(.pushedAt < \"$STALE\") | \"- ⏰ \(.name) (last push: \(.pushedAt))\""
```

### Exercise 2: Webhook Receiver with Signature Verification
**Duration:** 45 minutes | **Difficulty:** L300

Build a minimal webhook receiver that:
- Validates `X-Hub-Signature-256` using HMAC-SHA256
- Handles `repository.created` events to enforce org policies
- Logs all events for audit purposes
- Returns appropriate HTTP status codes

### Exercise 3: Scheduled Compliance Workflow with github-script
**Duration:** 30 minutes | **Difficulty:** L300

Create a GitHub Actions workflow that runs on a weekly schedule:
- Uses `actions/github-script@v8` to query the GraphQL API
- Fetches all org repos and checks branch protection rules
- Creates a GitHub Issue with a compliance summary
- Tags repos that need attention

```yaml
name: Weekly Compliance Check
on:
  schedule:
    - cron: '0 9 * * 1'
  workflow_dispatch: {}

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v8
        with:
          script: |
            const query = `query($org: String!, $cursor: String) {
              organization(login: $org) {
                repositories(first: 100, after: $cursor) {
                  pageInfo { hasNextPage endCursor }
                  nodes {
                    name
                    visibility
                    isArchived
                    defaultBranchRef { name }
                    branchProtectionRules(first: 5) {
                      totalCount
                    }
                  }
                }
              }
            }`;

            let cursor = null;
            let issues = [];
            let hasNext = true;
            while (hasNext) {
              const result = await github.graphql(query, {
                org: context.repo.owner,
                cursor
              });
              const repos = result.organization.repositories;
              for (const repo of repos.nodes) {
                if (!repo.isArchived && repo.branchProtectionRules.totalCount === 0) {
                  issues.push(`- ⚠️ **${repo.name}** (${repo.visibility}) — no branch protection`);
                }
              }
              hasNext = repos.pageInfo.hasNextPage;
              cursor = repos.pageInfo.endCursor;
            }

            if (issues.length > 0) {
              const body = `## Weekly Compliance Report\n\n### Repos Without Branch Protection\n${issues.join('\n')}`;
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: `Compliance Report ${new Date().toISOString().split('T')[0]}`,
                body,
                labels: ['compliance', 'automated']
              });
            }
```

## Sources

1. https://cli.github.com/manual/ — GitHub CLI manual, authentication, Enterprise support
2. https://docs.github.com/en/github-cli/github-cli/creating-github-cli-extensions — Creating gh CLI extensions
3. https://docs.github.com/en/rest/overview/about-githubs-apis — Comparing REST and GraphQL APIs
4. https://docs.github.com/en/rest/orgs/orgs — REST API: Organizations endpoint
5. https://docs.github.com/en/enterprise-cloud@latest/rest/enterprise-admin/audit-log — Enterprise Audit Log REST API
6. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/about-the-audit-log-for-your-enterprise — About the audit log for your enterprise
7. https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api — REST API pagination
8. https://docs.github.com/en/graphql/overview/about-the-graphql-api — About the GraphQL API
9. https://docs.github.com/en/enterprise-cloud@latest/graphql/reference/queries — GraphQL query reference (enterprise, organization)
10. https://docs.github.com/en/webhooks/about-webhooks — About webhooks
11. https://docs.github.com/en/webhooks/webhook-events-and-payloads — Webhook events and payloads
12. https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries — Validating webhook deliveries (signature verification)
13. https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-github-cli-in-workflows — Using GitHub CLI in workflows
14. https://docs.github.com/en/rest/actions/workflows — REST API: Actions workflows (dispatch)
15. https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps — About creating GitHub Apps
16. https://probot.github.io/docs/hello-world/ — Probot: Hello World guide
17. https://github.com/actions/github-script — actions/github-script repository (v8, usage patterns)
18. https://docs.github.com/en/rest/repos/repos — REST API: Repositories endpoint
