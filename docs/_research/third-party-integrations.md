# Research Brief: 3rd Party Integrations (Status & Checks API)

> **VBD Agenda Items:** 2.9 (Integrate 3rd party tests and results)
> **Priority:** P1
> **Researched:** April 2026
> **Status:** Ready for content creation

---

## Overview

GitHub provides two complementary mechanisms for external systems to report the results of CI/CD tests, code quality scans, and other automated analyses back to commits and pull requests: the **Commit Status API** (the original, simpler approach) and the **Checks API** (the modern, richer approach). Both mechanisms surface results directly in the pull request UI and can be enforced as merge requirements through **branch protection rules** or **repository rulesets** [1][2][3].

The Commit Status API allows any authenticated user or integration with write permissions to set `error`, `failure`, `pending`, or `success` states on a specific commit SHA, identified by a **context** string (e.g., `continuous-integration/jenkins`). The Checks API, available exclusively to **GitHub Apps**, extends this with rich features: line-level annotations, detailed output summaries with Markdown, re-run capabilities, and interactive "requested actions" buttons in the PR Checks tab [4][5]. GitHub Actions natively generates **check runs** (not commit statuses) when workflows execute [2].

For GHEC administrators, understanding both APIs is critical because: (a) many legacy and external CI tools still use the Commit Status API; (b) the Checks API is the recommended path forward for new integrations; and (c) required status checks in branch protection and rulesets can enforce either type, with the option to pin checks to a specific GitHub App source for security [3][6].

---

## Key Concepts

### Commit Status API

The Commit Status API is the original mechanism for reporting build/test results to GitHub. It is simpler than the Checks API but less feature-rich [1].

**Core concepts:**

- **States:** Each status has one of four states: `error`, `failure`, `pending`, or `success` [1]
- **Context:** A string that identifies the source of the status (e.g., `continuous-integration/jenkins`, `security/brakeman`). Multiple contexts can exist per commit [1]
- **Combined status:** GitHub computes an overall status for a commit by evaluating all status contexts. The combined state follows these rules: if any context is `failure`, the combined state is `failure`; if any is `pending`, the combined state is `pending`; otherwise `success` [1]
- **Permissions:** Anyone with write permissions to a repository can set the state for any status check [2]

**API endpoints:**

```bash
# Create a commit status
# POST /repos/{owner}/{repo}/statuses/{sha}
curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/statuses/SHA \
  -d '{
    "state": "success",
    "target_url": "https://ci.example.com/1000/output",
    "description": "Build has completed successfully",
    "context": "continuous-integration/jenkins"
  }'

# Get the combined status for a specific ref
# GET /repos/{owner}/{repo}/commits/{ref}/status
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/commits/REF/status

# List commit statuses for a ref
# GET /repos/{owner}/{repo}/commits/{ref}/statuses
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/commits/REF/statuses
```

**Key fields in a status object [1]:**

| Field | Description |
|-------|-------------|
| `state` | `error`, `failure`, `pending`, or `success` |
| `target_url` | URL linking to the full build output |
| `description` | Short human-readable description (max 140 chars) |
| `context` | Unique identifier string for this status (e.g., `ci/jenkins`) |

> **L300 Note:** Statuses are immutable — each POST creates a *new* status entry. The combined status endpoint aggregates by taking the latest status per unique context string [1].

**Sources:** [1] https://docs.github.com/en/rest/commits/statuses

---

### Check Runs & Check Suites

The Checks API is the modern replacement for commit statuses, offering richer reporting capabilities. It is **only available to GitHub Apps** — OAuth apps and authenticated users can view but not create check runs [4][5].

**Core concepts:**

- **Check Suite:** A collection of check runs created by a single GitHub App for a specific commit. GitHub automatically creates a check suite when code is pushed to a repository [5]
- **Check Run:** An individual test/analysis within a check suite. Each run has a `status` and, when completed, a `conclusion` [4][5]
- **Annotations:** Check runs can attach annotations to specific lines of code, visible in both the Checks tab and the Files Changed tab of a PR [4]
- **Requested Actions:** Check runs can include action buttons (e.g., "Fix this") that trigger webhooks back to the GitHub App [5]
- **Retention:** GitHub retains checks data for 400 days. After archival (400 + 10 days), data is permanently deleted. Required checks that are archived must be re-run before merging [2]

**Check run statuses and conclusions [2]:**

| Status | Description | Actions Only? |
|--------|-------------|:---:|
| `queued` | Check run has been queued | No |
| `in_progress` | Check run is in progress | No |
| `completed` | Check run completed (has conclusion) | No |
| `pending` | Concurrency limit reached | Yes |
| `waiting` | Waiting for deployment protection rule | Yes |
| `requested` | Created but not queued | Yes |

| Conclusion | Description |
|------------|-------------|
| `success` | Completed successfully |
| `failure` | Check run failed |
| `neutral` | Completed with neutral result (treated as success for dependents) |
| `cancelled` | Cancelled before completion |
| `timed_out` | Check run timed out |
| `action_required` | Required actions upon completion |
| `skipped` | Skipped (treated as success for dependents) |
| `stale` | Marked stale by GitHub (took too long — > 14 days incomplete) |

**API endpoints:**

```bash
# Create a check run (GitHub App only)
# POST /repos/{owner}/{repo}/check-runs
curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <APP-TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/check-runs \
  -d '{
    "name": "mighty_readme",
    "head_sha": "ce587453ced02b1526dfb4cb910479d431683101",
    "status": "in_progress",
    "external_id": "42",
    "started_at": "2018-05-04T01:14:52Z",
    "output": {
      "title": "Mighty Readme report",
      "summary": "There are 0 failures, 2 warnings, and 1 notice.",
      "text": "You may have misspelled words on lines 2 and 4."
    }
  }'

# Update a check run with conclusion and annotations
# PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}
curl -L -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <APP-TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/check-runs/CHECK_RUN_ID \
  -d '{
    "name": "mighty_readme",
    "status": "completed",
    "conclusion": "success",
    "completed_at": "2018-05-04T01:14:52Z",
    "output": {
      "title": "Mighty Readme report",
      "summary": "There are 0 failures, 2 warnings, and 1 notice.",
      "annotations": [
        {
          "path": "README.md",
          "annotation_level": "warning",
          "title": "Spell Checker",
          "message": "Check your spelling for '\''banaas'\''.",
          "start_line": 2,
          "end_line": 2
        }
      ]
    }
  }'

# List check runs for a specific ref
# GET /repos/{owner}/{repo}/commits/{ref}/check-runs
```

**Annotations (max 50 per API request) [4]:**

| Field | Required | Description |
|-------|:---:|-------------|
| `path` | ✓ | File path (e.g., `src/main.js`) |
| `start_line` | ✓ | Starting line number |
| `end_line` | ✓ | Ending line number |
| `annotation_level` | ✓ | `notice`, `warning`, or `failure` |
| `message` | ✓ | Description (max 64 KB) |
| `title` | | Annotation title (max 255 chars) |

**Permissions required [4]:**
- Creating/updating check runs: `checks:write` (GitHub App only)
- Reading check runs: `checks:read` or `repo` scope (any token type)

> **L300 Note:** The 50-annotation-per-request limit can be worked around by making multiple update calls to the same check run — annotations are appended, not replaced [4]. GitHub Actions is further limited to 10 warning + 10 error annotations per step [4].

**Sources:** [4] https://docs.github.com/en/rest/checks/runs, [5] https://docs.github.com/en/rest/guides/using-the-rest-api-to-interact-with-checks, [2] https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks

---

### Required Status Checks

Required status checks prevent merging until specified checks or commit statuses pass. They can be configured through **branch protection rules** or **repository rulesets** [3][6].

#### Branch Protection Rules

- Configured per-branch or with `fnmatch` patterns (e.g., `*release*`) [6]
- Only one branch protection rule can apply at a time per branch [6]
- Admins can bypass by default (unless "Do not allow bypassing the above settings" is enabled) [6]
- Required status checks must have `successful`, `skipped`, or `neutral` status before merge [6]

#### Repository Rulesets (Recommended for GHEC)

- Multiple rulesets can apply simultaneously (layered) [3]
- Support bypass lists with roles, teams, or GitHub Apps [3]
- Available at repository and **organization level** for GHEC [3]
- Can pin a required check to a **specific GitHub App source** for security: "If the status is set by any other person or integration, merging won't be allowed" [3]

**Strict vs. Loose mode [3][6]:**

| Mode | Behavior | Trade-off |
|------|----------|-----------|
| **Strict** | Branch must be up to date with base before merging | More builds, but guaranteed no integration issues |
| **Loose** | Branch does not need to be up to date | Fewer builds, but risk of incompatible changes post-merge |

**Configuration via the API (branch protection):**

```bash
# Update branch protection with required status checks
# PUT /repos/{owner}/{repo}/branches/{branch}/protection
curl -L -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["continuous-integration/jenkins", "ci/build"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": null,
    "restrictions": null
  }'
```

> **L300 Note:** When configuring required checks in rulesets, you can select a specific app as the expected source. The app must be installed in the repository with `statuses:write` permission, must have recently submitted a check run, and must be associated with a pre-existing required status check [3].

> **Important for Actions:** If you use branch protection rules that require specific status checks, make sure job names are unique across all workflows. Using the same job name in multiple workflows causes ambiguous status check results and can block merging [6].

**Sources:** [3] https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets, [6] https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

---

### CI/CD Integration Patterns

External CI/CD tools integrate with GitHub using one of two patterns:

#### Pattern 1: Commit Status API (Legacy/Universal)

Used by most traditional CI tools. The CI server receives a webhook for push/PR events, runs builds, and reports results back via the Status API.

**How Jenkins integrates [1]:**
1. Jenkins receives a webhook notification on push
2. Jenkins sets commit status to `pending` with context `continuous-integration/jenkins`
3. Jenkins runs the build
4. Jenkins sets commit status to `success` or `failure` with a `target_url` pointing to the Jenkins build output

**Common context strings:**
- `continuous-integration/jenkins` — Jenkins
- `continuous-integration/travis-ci/pr` — Travis CI
- `ci/circleci: build` — CircleCI
- `codeclimate` — Code Climate
- `security/snyk` — Snyk security scanning

#### Pattern 2: Checks API (Modern / GitHub App)

Used by GitHub Apps and newer integrations. Requires creating a GitHub App with `checks:write` permission.

**Typical flow [5]:**
1. Code pushed → GitHub creates a `check_suite` event (action: `requested`)
2. GitHub App receives the webhook and creates one or more check runs via `POST /repos/{owner}/{repo}/check-runs`
3. As analysis progresses, the app updates check runs with status changes and output
4. On completion, the app sets `conclusion` and optionally adds annotations and action buttons
5. User can re-run checks from the PR UI, triggering a new `check_run` webhook

#### Pattern 3: GitHub Actions Workflows (Native)

GitHub Actions workflows automatically generate check runs when executed. Each workflow job becomes a check run with the job's `name` as the check name. This is the simplest integration pattern for teams already using GitHub [2].

**How Azure DevOps Pipelines integrates:**
- The [Azure Pipelines GitHub App](https://github.com/marketplace/azure-pipelines) uses the Checks API
- Reports detailed pipeline status as check runs
- Supports required status checks in branch protection

**Sources:** [1] https://docs.github.com/en/rest/commits/statuses, [5] https://docs.github.com/en/rest/guides/using-the-rest-api-to-interact-with-checks, [2] https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks

---

### GitHub Actions as CI

GitHub Actions is the native CI/CD platform that generates check runs automatically [2].

**Key integration points:**

- Each workflow **job** appears as a separate check run, named by the `name:` field of the job [2]
- Workflows can be required as status checks by adding the job name (formatted as `Workflow Name / Job Name`) to branch protection rules [6]
- The `GITHUB_TOKEN` is automatically available in workflows, scoped to the repository [7]
- Skipped jobs report as "Success" and will not block merging even when required [2]

**Example: Using a workflow as a required check:**

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  build-and-test:  # This becomes the check name: "CI / build-and-test"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
```

Then in branch protection, require the status check: `CI / build-and-test`

**Reporting commit statuses from Actions:**

```yaml
# Use gh CLI to create commit statuses from within a workflow
- name: Report external status
  run: |
    gh api repos/${{ github.repository }}/statuses/${{ github.sha }} \
      -f state="success" \
      -f target_url="https://example.com/results" \
      -f description="Custom analysis passed" \
      -f context="custom/analysis"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Skipping and requesting checks [2]:**
- Skip all checks for a commit by adding `skip-checks: true` as a commit trailer
- Request checks with `request-checks: true` trailer
- Use `--cleanup=verbatim` with `git commit` to preserve trailer formatting

**Sources:** [2] https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks, [7] https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-github-cli-in-workflows, [6] https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

---

### Status Badges

Status badges display the current pass/fail state of a workflow as an embeddable image, typically shown in a repository's README [8].

**Badge URL format:**

```
https://github.com/OWNER/REPOSITORY/actions/workflows/WORKFLOW-FILE/badge.svg
```

**Optional parameters [8]:**

| Parameter | Example | Purpose |
|-----------|---------|---------|
| `branch` | `?branch=feature-1` | Show status for a specific branch |
| `event` | `?event=push` | Show status for runs triggered by a specific event |

**Markdown example:**

```markdown
![CI](https://github.com/octocat/my-repo/actions/workflows/ci.yml/badge.svg)
![CI (main)](https://github.com/octocat/my-repo/actions/workflows/ci.yml/badge.svg?branch=main)
```

> **Note:** Workflow badges in private repositories are not accessible externally — they cannot be embedded on external sites [8].

**Sources:** [8] https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/monitoring-workflows/adding-a-workflow-status-badge

---

### Deployment Status API

The Deployment API provides a mechanism to track deployments through GitHub, decoupling deployment requests from the actual deployment execution [9][10].

**Core concepts:**

- **Deployment:** A request to deploy a specific ref (branch, SHA, tag). Creating a deployment dispatches a `deployment` webhook event [9]
- **Deployment Status:** External services mark deployments with states: `error`, `failure`, `inactive`, `in_progress`, `queued`, `pending`, or `success` [10]
- **Environments:** Deployments target named environments (e.g., `production`, `staging`, `qa`). GitHub tracks the active deployment per environment [9]
- **Auto-merge:** By default, `auto_merge` is true — GitHub attempts to merge the default branch into the requested ref if it's behind [9]
- **Required contexts:** The `required_contexts` parameter on deployment creation specifies which commit status contexts must be `success` before the deployment proceeds. Pass an empty array to bypass checks entirely [9]

**API endpoints:**

```bash
# Create a deployment
# POST /repos/{owner}/{repo}/deployments
curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/deployments \
  -d '{
    "ref": "topic-branch",
    "environment": "production",
    "description": "Deploy request from hubot",
    "payload": "{\"deploy\": \"migrate\"}"
  }'

# Create a deployment status
# POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses
curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/deployments/DEPLOYMENT_ID/statuses \
  -d '{
    "state": "success",
    "log_url": "https://example.com/deployment/42/output",
    "description": "Deployment finished successfully.",
    "environment": "production",
    "environment_url": "https://staging.example.com"
  }'
```

**Deployment sequence diagram [9]:**

```
+---------+             +--------+            +-----------+        +-------------+
| Tooling |             | GitHub |            | 3rd Party |        | Your Server |
+---------+             +--------+            +-----------+        +-------------+
     |  Create Deployment   |                       |                     |
     |--------------------->|                       |                     |
     |  Deployment Created  |                       |                     |
     |<---------------------|                       |                     |
     |                      |   Deployment Event    |                     |
     |                      |---------------------->|                     |
     |                      |                       |     SSH+Deploys     |
     |                      |                       |-------------------->|
     |                      |   Deployment Status   |                     |
     |                      |<----------------------|                     |
     |                      |                       |   Deploy Completed  |
     |                      |                       |<--------------------|
     |                      |   Deployment Status   |                     |
     |                      |<----------------------|                     |
```

**Branch protection integration:** The "Require deployments to succeed before merging" rule ensures changes are successfully deployed to specific environments (e.g., staging) before the branch can be merged [3][6].

> **L300 Note:** When you set a deployment state to `success`, all prior non-transient, non-production deployments in the same repository and environment become `inactive` automatically. Set `auto_inactive: false` to prevent this behavior [9].

**Sources:** [9] https://docs.github.com/en/rest/deployments/deployments, [10] https://docs.github.com/en/rest/deployments/statuses

---

## Commit Status API vs. Checks API — Comparison

| Feature | Commit Status API | Checks API |
|---------|:-:|:-:|
| **Authentication** | Any token with `repo` or `repo:status` scope | GitHub App only (`checks:write`) |
| **States** | `error`, `failure`, `pending`, `success` | Rich status + conclusion model |
| **Line annotations** | ✗ | ✓ (up to 50 per request) |
| **Rich output (Markdown)** | ✗ | ✓ (`title`, `summary`, `text`) |
| **Re-run from UI** | ✗ | ✓ |
| **Action buttons** | ✗ | ✓ (requested actions) |
| **Images in output** | ✗ | ✓ |
| **PR Checks tab** | ✗ (shown in conversation only) | ✓ (dedicated tab) |
| **Generated by Actions** | ✗ | ✓ (automatically) |
| **Ease of integration** | Simple (single POST) | More complex (GitHub App setup) |

**Sources:** [1] https://docs.github.com/en/rest/commits/statuses, [4] https://docs.github.com/en/rest/checks/runs, [2] https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks

---

## What to Cover in Workshop (L300)

### Must-Cover Topics

1. **Both APIs side-by-side:** Demonstrate creating commit statuses AND check runs for the same commit, showing the different UI experiences in the PR view. Emphasize the Checks tab vs. the status icons in the conversation view [1][4]

2. **GitHub App creation for checks:** Walk through registering a GitHub App with `checks:write` permission, subscribing to `check_suite` and `check_run` webhook events, and authenticating as an installation [5][11]

3. **Annotations deep-dive:** Show how annotations map to specific file lines in the PR diff, including `notice`, `warning`, and `failure` levels. Demonstrate the 50-per-request limit and the append behavior on update [4]

4. **Required checks configuration — Branch Protection vs. Rulesets:** Compare the two approaches. Highlight Rulesets' advantages for GHEC: org-level enforcement, layered rules, and the ability to pin checks to a specific GitHub App [3][6]

5. **External CI integration patterns:** Demonstrate how a Jenkins-style CI system would POST commit statuses, and how a modern GitHub App–based CI would create check runs. Show the webhook → process → report-back loop [1][5]

6. **Deployment API integration:** Show the deployment lifecycle from request to status updates, demonstrating how the Deployments Environments UI tracks active deployments and how "Require deployments to succeed" works as a merge gate [9][10][3]

7. **Actions as required checks:** Show how to name workflow jobs for use as required status checks, and the `skip-checks: true` commit trailer [2][6]

### Advanced Topics for L300

- **Check run requested actions:** Adding "Fix this" buttons to check runs that trigger `check_run.requested_action` webhooks [5]
- **Audit log entries:** How check configurations appear in the organization audit log [5]
- **Security considerations:** Pinning required checks to a specific GitHub App source vs. "any source" — preventing unauthorized status spoofing [3]
- **Merge queues with status checks:** How merge queues re-validate status checks against the latest base branch [6]
- **Combined status edge cases:** How the combined status endpoint resolves conflicts when multiple tools report on the same context [1]

---

## Workshop Exercise Ideas

### Exercise 1: Create Commit Statuses via the API (30 min)

**Objective:** Use `curl` and the GitHub CLI to simulate an external CI tool reporting build status.

**Steps:**
1. Create a feature branch and push a commit
2. Use the REST API to set a `pending` commit status with context `ci/custom-build`
3. Observe the yellow pending indicator on the PR
4. Update the status to `success` with a `target_url` pointing to a mock build log
5. Configure the branch protection rule to require `ci/custom-build`
6. Attempt to merge without the status — observe the block
7. Re-apply the `success` status and merge

```bash
# Step 2: Set pending status
gh api repos/OWNER/REPO/statuses/$(git rev-parse HEAD) \
  -f state="pending" \
  -f description="Build is running..." \
  -f context="ci/custom-build" \
  -f target_url="https://ci.example.com/build/42"

# Step 4: Update to success
gh api repos/OWNER/REPO/statuses/$(git rev-parse HEAD) \
  -f state="success" \
  -f description="Build passed!" \
  -f context="ci/custom-build" \
  -f target_url="https://ci.example.com/build/42/output"
```

### Exercise 2: Build a Custom Check Run with Annotations (45 min)

**Objective:** Create a GitHub App that reports check runs with line-level annotations.

**Steps:**
1. Register a GitHub App with `checks:write` permission (or use a pre-configured lab app)
2. Use the app's installation token to create a check run in `in_progress` state
3. Update the check run to `completed` with `conclusion: "failure"` and annotations pointing to specific lines in a deliberately flawed file
4. Observe the annotations in both the Checks tab and Files Changed tab
5. Add a "Fix this" requested action button and discuss the webhook flow

```bash
# Create check run with annotations
gh api repos/OWNER/REPO/check-runs \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -f name="code-quality" \
  -f head_sha="$(git rev-parse HEAD)" \
  -f status="completed" \
  -f conclusion="failure" \
  -f "output[title]=Code Quality Report" \
  -f "output[summary]=Found 2 issues in README.md" \
  -f "output[annotations][][path]=README.md" \
  -f "output[annotations][][start_line]=2" \
  -f "output[annotations][][end_line]=2" \
  -f "output[annotations][][annotation_level]=warning" \
  -f "output[annotations][][message]=Possible typo detected"
```

### Exercise 3: Rulesets with Required Checks and Deployment Gates (30 min)

**Objective:** Configure an organization-level ruleset that requires both CI checks and successful deployments.

**Steps:**
1. Create an Actions workflow that runs tests (becomes a check run)
2. Create a repository ruleset requiring that workflow's check to pass
3. Pin the required check to the "GitHub Actions" app source
4. Add a "Require deployments to succeed" rule for a `staging` environment
5. Create a deployment and deployment status via the API
6. Demonstrate the full merge gate: CI must pass AND staging deployment must succeed
7. Show bypass permissions for specific teams/roles

---

## Sources

1. https://docs.github.com/en/rest/commits/statuses — REST API endpoints for commit statuses
2. https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks — About status checks (types, conclusions, retention)
3. https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets — Available rules for rulesets
4. https://docs.github.com/en/rest/checks/runs — REST API endpoints for check runs
5. https://docs.github.com/en/rest/guides/using-the-rest-api-to-interact-with-checks — Using the REST API to interact with checks
6. https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches — About protected branches
7. https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-github-cli-in-workflows — Using GitHub CLI in workflows
8. https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/monitoring-workflows/adding-a-workflow-status-badge — Adding a workflow status badge
9. https://docs.github.com/en/rest/deployments/deployments — REST API endpoints for deployments
10. https://docs.github.com/en/rest/deployments/statuses — REST API endpoints for deployment statuses
11. https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-ci-checks-with-a-github-app — Building CI checks with a GitHub App
12. https://docs.github.com/en/rest/checks/suites — REST API endpoints for check suites
