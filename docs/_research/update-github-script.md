# Research Brief: actions/github-script Update

> **VBD Agenda Items:** 2.8 (The GitHub API), 2.12 (Scripts and automation)
> **Priority:** P0 (lab05 uses outdated v6)
> **Researched:** April 2026
> **Status:** Ready for lab05 update

## Overview

`actions/github-script` is at **v8.0.0** (released September 2024). lab05 and its workflow
`use-github-apis.yml` are pinned to **v6**, which runs Node 16 (EOL September 2023). The
upgrade path is straightforward: **v6 → v7 (Node 20) → v8 (Node 24)**. The scripting API
(`github.rest.*`, `github.graphql()`, `github.paginate()`) is **unchanged** across all three
versions — only the Node.js runtime and underlying dependency versions changed.

**Recommendation:** Update to **v7** as the primary target. v7 uses Node 20 (LTS, stable,
universally supported on all runners). v8 (Node 24) is a viable alternative but requires
runner ≥ v2.327.1, which may not be available on all GHES instances used in workshops.

## Version History

| Version | Release Date | Node.js | @actions/github | @octokit/core | Key Changes |
|---------|-------------|---------|-----------------|---------------|-------------|
| v6.4.1  | Apr 2023    | 16      | 5.x             | 3.x           | Last v6 release |
| v7.0.0  | Nov 2023    | 20      | 6.x             | 5.x           | Node 20, `base-url` input, `previews` scoped to GraphQL |
| v7.0.1  | Nov 2023    | 20      | 6.x             | 5.x           | Bugfix release |
| v7.1.0  | Sep 2024    | 20      | 6.x             | 5.x           | Dependency updates, improved docs, `exec` examples |
| v8.0.0  | Sep 2024    | 24      | 6.x             | 5.x           | Node 24, requires runner ≥ v2.327.1 |

### Dependency Comparison (v6 vs v7/v8)

| Package | v6 (via @actions/github@5.x) | v7/v8 (via @actions/github@6.x) |
|---------|------------------------------|----------------------------------|
| `@octokit/core` | ^3.6.0 | ^5.0.1 |
| `@octokit/plugin-rest-endpoint-methods` | ^5.13.0 | ^10.0.0 |
| `@octokit/plugin-paginate-rest` | ^2.17.0 | ^9.0.0 |
| `@octokit/plugin-retry` | _(not included)_ | ^6.0.1 |
| `@octokit/plugin-request-log` | _(not included)_ | ^4.0.0 |

## Breaking Changes (v6 → v7)

### 1. Node.js Runtime: 16 → 20

- v6 runs `using: node16`; v7 runs `using: node20` [1]
- Node 16 reached EOL September 2023 — GitHub deprecated Node 16 actions [2]
- **Impact on lab05:** None. The scripts use standard JS (no Node 16-specific APIs)

### 2. `previews` Input Scoped to GraphQL Only

- In v6, the `previews` input applied to both REST and GraphQL API calls
- In v7, `previews` only applies to GraphQL calls — REST API previews were permanently promoted [3]
- **Impact on lab05:** None. lab05 does not use the `previews` input

### 3. New `base-url` Input

- v7 added a `base-url` input for connecting to GitHub Enterprise Server instances [4]
- Example: `base-url: https://my.ghes.com/api/v3`
- **Impact on lab05:** None (but useful for GHES-based workshops)

### 4. Octokit Version Bump

- `@octokit/core` jumped from 3.x to 5.x
- `@octokit/plugin-rest-endpoint-methods` jumped from 5.x to 10.x
- The **user-facing API is identical** — `github.rest.*` methods have the same signatures
- Built-in retry support added via `@octokit/plugin-retry`

### 5. JSDoc Type Support

- v7 exposes an `async-function` TypeScript declaration for better IDE support in external script files [5]
- Enables JSDoc annotations for type hints when using `require('./script.js')` pattern

## Breaking Changes (v7 → v8)

### 1. Node.js Runtime: 20 → 24

- v8 runs `using: node24` [1]
- Requires runner version ≥ v2.327.1 [6]
- **Impact on lab05:** None. Standard JS patterns work across Node 20 and 24

## Migration Guide (lab05-specific)

### Step 1: Update Version Tags

The only required change is updating `@v6` → `@v7` in all `uses:` lines.

**Files to update:**
1. `labs/lab05.md` — 2 instances (lines 22, 46)
2. `.github/workflows/use-github-apis.yml` — 3 instances (lines 16, 41, and the step students add)

### Step 2: Remove Unnecessary `github-token` Input

The `github-token` input defaults to `${{ github.token }}` and can be omitted unless a
custom token is needed. This simplifies the lab code. (Optional but recommended for clarity.)

### Step 3: Update Reference Links

The lab references `https://octokit.github.io/rest.js/v18` (line 15 of lab05.md) which is
outdated. Update to the current Octokit REST.js documentation URL.

### Step 4: Consider Security Best Practice for Input Passing

v7+ README recommends using `env` vars instead of inline expressions to avoid script
injection. While lab05 uses `${{fromJSON(...)}}` inline, this is safe in the controlled lab
context. A note about the best practice could be added.

## Code Examples

### Before (v6) — lab05 REST API Step

```yaml
      - uses: actions/github-script@v6
        id: close-issue
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          script: |
            const result = await github.rest.issues.update({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: ${{fromJSON(steps.create-issue.outputs.result).number}},
              state: 'closed'
            })
            console.log(result)
```

### After (v7) — lab05 REST API Step

```yaml
      - uses: actions/github-script@v7
        id: close-issue
        with:
          script: |
            const result = await github.rest.issues.update({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: ${{fromJSON(steps.create-issue.outputs.result).number}},
              state: 'closed'
            })
            console.log(result)
```

> **Changes:** `@v6` → `@v7`, removed explicit `github-token` (uses default)

### Before (v6) — lab05 GraphQL Step

```yaml
      - uses: actions/github-script@v6
        id: labels-result
        with:
          script: |
            const query = `query($owner:String!, $name:String!) {
              repository(owner:$owner, name:$name){
                labels (last:100) {
                  nodes {
                    name,
                    color,
                    issues(last:100) {
                      nodes {
                        number
                      }
                    }
                  }
                }
              }
            }`;
            const variables = {
              owner: context.repo.owner,
              name: context.repo.repo
            }
            const result = await github.graphql(query, variables)
            console.log(result.repository.labels.nodes)
```

### After (v7) — lab05 GraphQL Step

```yaml
      - uses: actions/github-script@v7
        id: labels-result
        with:
          script: |
            const query = `query($owner:String!, $name:String!) {
              repository(owner:$owner, name:$name){
                labels (last:100) {
                  nodes {
                    name,
                    color,
                    issues(last:100) {
                      nodes {
                        number
                      }
                    }
                  }
                }
              }
            }`;
            const variables = {
              owner: context.repo.owner,
              name: context.repo.repo
            }
            const result = await github.graphql(query, variables)
            console.log(result.repository.labels.nodes)
```

> **Changes:** `@v6` → `@v7` only. Script body is identical.

### Before (v6) — Workflow File Create Issue Step

```yaml
      - uses: actions/github-script@v6
        id: create-issue
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          script: |
            const result = await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Issue auto-created from workflow run ${{github.run_id}}',
              body: '👋 Thank you! We appreciate your contribution to this project.',
              labels: ["training"]
            })
            console.log(result)
            return result.data
```

### After (v7) — Workflow File Create Issue Step

```yaml
      - uses: actions/github-script@v7
        id: create-issue
        with:
          script: |
            const result = await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Issue auto-created from workflow run ${{github.run_id}}',
              body: '👋 Thank you! We appreciate your contribution to this project.',
              labels: ["training"]
            })
            console.log(result)
            return result.data
```

> **Changes:** `@v6` → `@v7`, removed explicit `github-token` (uses default)

### Bonus: Common Admin Patterns with github-script v7

#### Org-level: List Repos with Specific Topics

```yaml
      - uses: actions/github-script@v7
        with:
          script: |
            const repos = await github.paginate(github.rest.repos.listForOrg, {
              org: 'my-org',
              type: 'all'
            })
            const filtered = repos.filter(r => r.topics.includes('production'))
            console.log(`Found ${filtered.length} production repos`)
            return filtered.map(r => r.full_name)
```

#### Org-level: Add User to Team

```yaml
      - uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.ORG_ADMIN_TOKEN }}
          script: |
            await github.rest.teams.addOrUpdateMembershipForUserInOrg({
              org: 'my-org',
              team_slug: 'developers',
              username: 'octocat',
              role: 'member'
            })
```

#### Repo Setup: Configure Branch Protection

```yaml
      - uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.updateBranchProtection({
              owner: context.repo.owner,
              repo: context.repo.repo,
              branch: 'main',
              required_status_checks: { strict: true, contexts: ['ci'] },
              enforce_admins: true,
              required_pull_request_reviews: {
                required_approving_review_count: 1
              },
              restrictions: null
            })
```

#### Using Retries (new in v7)

```yaml
      - uses: actions/github-script@v7
        with:
          retries: 3
          retry-exempt-status-codes: 400,401,404
          script: |
            const { data: org } = await github.rest.orgs.get({
              org: 'my-org'
            })
            console.log(`${org.login} has ${org.public_repos} public repos`)
```

## lab05 Specific Changes

### Summary of All Required Edits

| File | Line(s) | Change | Required? |
|------|---------|--------|-----------|
| `labs/lab05.md` | 22 | `@v6` → `@v7` | ✅ Yes |
| `labs/lab05.md` | 46 | `@v6` → `@v7` | ✅ Yes |
| `labs/lab05.md` | 25 | Remove `github-token: ${{secrets.GITHUB_TOKEN}}` | 🔶 Recommended |
| `labs/lab05.md` | 15 | Update octokit REST.js docs link from v18 | 🔶 Recommended |
| `.github/workflows/use-github-apis.yml` | 16 | `@v6` → `@v7` | ✅ Yes |
| `.github/workflows/use-github-apis.yml` | 19 | Remove `github-token: ${{secrets.GITHUB_TOKEN}}` | 🔶 Recommended |
| `.github/workflows/use-github-apis.yml` | 41 | `@v6` → `@v7` | ✅ Yes |
| `tests/fixtures/lab-expectations.json` | ~75 | Update expected version from v6 to v7 | ✅ Yes |
| `tests/fixtures/known-issues.json` | ~90, ~143 | Close KI-008 / KI-013 entries | ✅ Yes |

### ESM vs CJS

**No change.** `actions/github-script` uses CommonJS (`require()`) in all versions including
v8. The `require` proxy wrapper is provided to scripts for loading external modules. There is
no migration to ESM. External script files should continue to use `module.exports`.

### v7 vs v8 Decision

| Criteria | v7 | v8 |
|----------|----|----|
| Node.js version | 20 (LTS until Oct 2026) | 24 (Current) |
| Runner compatibility | All modern runners | Requires ≥ v2.327.1 |
| GHES compatibility | All supported GHES | May need GHES runner update |
| API surface | Identical | Identical |
| Stability | 2+ years in production | ~1.5 years in production |

**Recommendation for VBD:** Use **v7** for maximum compatibility across workshop environments.
Mention v8 as the latest version in instructor notes.

## Sources

1. [actions/github-script README — Breaking Changes](https://github.com/actions/github-script#breaking-changes)
2. [GitHub Blog — Node 16 deprecation in Actions](https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/)
3. [GitHub Blog — REST API preview promotions](https://github.blog/changelog/2021-10-14-rest-api-preview-promotions/)
4. [actions/github-script v7.0.0 release notes](https://github.com/actions/github-script/releases/tag/v7.0.0) — PR #429 adds `base-url`
5. [actions/github-script v7.0.0 release notes](https://github.com/actions/github-script/releases/tag/v7.0.0) — PR #402 exposes async-function type
6. [actions/github-script v8.0.0 release notes](https://github.com/actions/github-script/releases/tag/v8.0.0) — Requires runner v2.327.1
7. [actions/github-script action.yml (main branch)](https://raw.githubusercontent.com/actions/github-script/main/action.yml) — `using: node24`
8. [actions/github-script package.json (main branch)](https://raw.githubusercontent.com/actions/github-script/main/package.json) — `@actions/github@^6.0.0`
9. [@actions/github@6.0.0 on npm](https://registry.npmjs.org/@actions/github/6.0.0) — depends on `@octokit/core@^5.0.1`
10. [@actions/github@5.1.1 on npm](https://registry.npmjs.org/@actions/github/5.1.1) — depends on `@octokit/core@^3.6.0`
11. [actions/github-script releases page](https://github.com/actions/github-script/releases) — Full version history
