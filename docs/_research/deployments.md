# Research Brief: Deployment Strategies

> **VBD Agenda Items:** 2.10 (Deploy with GitHub)
> **Priority:** P1
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

GitHub Actions provides a mature, integrated deployment platform built around **environments**, **protection rules**, and **OIDC-based cloud authentication**. Environments serve as named deployment targets (e.g., `production`, `staging`, `qa`) that can be gated with required reviewers, wait timers, branch/tag restrictions, and custom deployment protection rules powered by GitHub Apps [1]. This system allows organizations to enforce separation of duties, auditability, and automated compliance checks before any code reaches production.

For GitHub Enterprise Cloud (GHEC) administrators, the deployment story extends beyond individual repositories. Enterprise-level policies govern which Actions and reusable workflows are permitted, how self-hosted runners are scoped, default `GITHUB_TOKEN` permissions, and artifact/log retention periods [7]. Combined with OIDC federation — which replaces long-lived cloud credentials with short-lived, job-scoped tokens — GHEC admins can build a deployment pipeline that is both secure by default and auditable end-to-end [3].

The L300 audience should understand not just *how* to configure these features, but *why* each control exists, how they compose together, and the enterprise governance model that ties them to organizational policy. This brief covers the full deployment surface: environments, protection rules, OIDC, custom gates, deployment tracking, and enterprise policies.

---

## Key Concepts

### GitHub Environments

Environments are named deployment targets configured at the repository level under **Settings → Environments** [1]. Each environment can hold:

- **Environment secrets** — encrypted values available only to jobs referencing that environment, and only after all protection rules pass [2]. On self-hosted runners, environment secrets should be treated with the same security level as repository/organization secrets since runners are not isolated containers [2].
- **Environment variables** — non-secret configuration values accessible via the `vars` context [2].
- **Protection rules** — required reviewers, wait timers, deployment branch/tag restrictions, admin bypass controls, and custom GitHub App gates (see next section) [1][2].
- **Deployment branch and tag policies** — restrict which refs can deploy to an environment. Options: no restriction, protected branches only, or selected branches/tags with name patterns using `File.fnmatch` syntax [2].

Key behaviors:
- Environment names are case-insensitive and limited to 255 characters [1].
- Running a workflow that references a non-existent environment **auto-creates** it with no protection rules [1].
- Environments can be configured via the UI or the REST API (endpoints for environments, secrets, variables, and branch policies) [1].
- Up to **6 required reviewers** can be assigned; only **one** must approve for the job to proceed [1][2].
- The **"Prevent self-review"** option blocks the user who triggered the workflow from approving it, enforcing separation of duties [1][2].
- **Availability:** Environments are available for all plans on public repos. Private/internal repos require GitHub Pro, GitHub Team, or GitHub Enterprise. Some protection rules (wait timers, required reviewers) require paid plans for private repos [1][2].

When a workflow job references an environment, GitHub automatically creates a **deployment object** and corresponding **deployment status objects**, which track the job's progress and are available via REST API, GraphQL API, and webhooks [1].

**New capability — `deployment: false`:** Jobs can reference an environment for its secrets and variables without creating a deployment record, using `deployment: false` in the environment configuration [6]. This is useful for CI/test jobs that need environment-scoped secrets but should not pollute deployment history. Note: custom deployment protection rules (GitHub Apps) are **incompatible** with `deployment: false` — the job will fail immediately [6].

### Deployment Protection Rules

Protection rules are the enforcement layer for environments. They can be **built-in** or **custom** [2]:

#### Built-in Rules

| Rule | Description | Availability |
|------|-------------|--------------|
| **Required reviewers** | Up to 6 people/teams must approve (only 1 needed). Optional self-review prevention. Jobs wait up to 30 days, then auto-fail. | Public repos (all plans); private repos (Enterprise) [2] |
| **Wait timer** | Delay between 1 and 43,200 minutes (30 days). Does not count toward billable time. | Public repos (all plans); private repos (Enterprise) [2] |
| **Deployment branches/tags** | Restrict deployments to specific refs via name patterns. | All public repos; private repos on Pro/Team+ [2] |
| **Admin bypass control** | By default, admins can bypass protection rules. This can be disabled per environment. | Public repos (all plans); private repos (Enterprise) [1][2] |

#### Custom Deployment Protection Rules (GitHub Apps)

Custom rules are powered by GitHub Apps and enable third-party integration for automated deployment gating [5]:

- A GitHub App subscribes to the `deployment_protection_rule` webhook event [5].
- When a workflow job references an environment with the custom rule enabled, GitHub sends a `POST` request to the App with the `deployment_protection_rule` payload [5].
- The App validates the request, performs its checks (e.g., querying Datadog, ServiceNow, Honeycomb), then calls the REST API to **approve** or **reject** the deployment [5].
- Apps can also post **status reports** (up to 10 per deployment, Markdown-formatted, max 1024 chars) without approving/rejecting [5].
- **Maximum 6 deployment protection rules** per environment, though any number of Apps can be installed on a repository [2].
- Custom rules can be published to the **GitHub Marketplace** for discovery [5].

**Required App permissions:** `Actions: Read-only`, `Deployments: Read and write` [5].

**Use cases for custom gates** [6]:
- ITSM / change management validation (e.g., ServiceNow ticket approved)
- Observability / health checks (e.g., Datadog, Honeycomb metrics)
- Code quality / security scan gates
- Compliance verification before production deployments

### OIDC for Cloud Deployments

OIDC (OpenID Connect) is the **recommended approach** for authenticating GitHub Actions workflows with cloud providers, replacing long-lived stored credentials [3]. This is a critical topic for L300 administrators.

#### How It Works

1. An OIDC trust relationship is established between the cloud provider and GitHub's OIDC provider (`https://token.actions.githubusercontent.com`) [3].
2. When a workflow job runs, GitHub's OIDC provider auto-generates a JWT containing claims about the workflow identity (repo, branch, environment, actor, etc.) [3].
3. The workflow presents this JWT to the cloud provider, which validates the claims against its trust policy [3].
4. The cloud provider issues a **short-lived access token** scoped to a single job [3].

#### Benefits [3]
- **No cloud secrets stored in GitHub** — eliminates credential duplication.
- **Granular control** — cloud provider's IAM controls who/what can assume roles.
- **Automatic credential rotation** — tokens expire after each job.

#### Key JWT Claims [8]

| Claim | Description |
|-------|-------------|
| `sub` | Subject — encodes repo, branch/tag/environment (e.g., `repo:octo-org/octo-repo:environment:prod`) |
| `aud` | Audience — defaults to repo owner URL; customizable |
| `iss` | Issuer — `https://token.actions.githubusercontent.com` |
| `repository` | Full repo name (e.g., `octo-org/octo-repo`) |
| `repository_owner` | Organization name |
| `repository_visibility` | `public`, `private`, or `internal` |
| `environment` | Environment name (when job references one) |
| `job_workflow_ref` | Ref path to reusable workflow (if applicable) |
| `runner_environment` | `github-hosted` or `self-hosted` |
| `ref` | Git ref that triggered the run |
| `workflow` | Workflow name |
| `repo_property_*` | Custom properties (public preview) [3][8] |

#### Subject Claim Formats [8]

The `sub` claim format varies by context:
- **Environment:** `repo:ORG/REPO:environment:ENV-NAME`
- **Branch:** `repo:ORG/REPO:ref:refs/heads/BRANCH`
- **Tag:** `repo:ORG/REPO:ref:refs/tags/TAG`
- **Pull request:** `repo:ORG/REPO:pull_request`

The `sub` claim is customizable at the organization level via REST API, allowing organizations to include additional claims like `repository_id` or `repository_visibility` [8].

#### Cloud Provider Configuration

**Azure** [4]:
- Create a Microsoft Entra ID application and service principal.
- Add **federated credentials** with subject matching the GitHub OIDC subject claim.
- Recommended audience: `api://AzureADTokenExchange`.
- Use the `azure/login` action with `client-id`, `tenant-id`, `subscription-id`.
- Workflow requires `permissions: id-token: write`.

```yaml
permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

**AWS** [9]:
- Add GitHub as an OIDC identity provider in IAM with provider URL `https://token.actions.githubusercontent.com` and audience `sts.amazonaws.com`.
- Configure IAM role trust policy with `StringEquals` or `StringLike` conditions on `sub` claim.
- Use the `aws-actions/configure-aws-credentials` action with `role-to-assume`.

```json
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:octo-org/octo-repo:environment:prod"
  }
}
```

**GCP** [10]:
- Create a Workload Identity Pool and Provider with issuer `https://token.actions.githubusercontent.com`.
- Grant the service account `roles/iam.workloadIdentityUser`.
- Use the `google-github-actions/auth` action with `workload_identity_provider` and `service_account`.

#### Repository Custom Properties as OIDC Claims (Public Preview) [3][8]

Organization and enterprise admins can include **repository custom properties** as claims in OIDC tokens, prefixed with `repo_property_`. This enables **attribute-based access control (ABAC)** — e.g., a custom property `team=platform` results in a `repo_property_team` claim, allowing cloud trust policies to gate access based on repository metadata rather than per-repo configuration.

#### OIDC for Dependabot [3]

Dependabot now supports OIDC authentication for private registries hosted on AWS CodeArtifact, Azure DevOps Artifacts, or JFrog Artifactory, eliminating static credentials for dependency updates.

### Custom Deployment Gates

Custom deployment gates extend the built-in protection rules by integrating third-party systems [5][6]:

**Architecture:**
1. Create a GitHub App with `Deployments: Read and write` permission and subscribe to `deployment_protection_rule` webhook [5].
2. Install the App on repositories and enable it per environment [5].
3. When a deployment reaches a gated environment, GitHub sends a webhook POST to the App [5].
4. The App authenticates via JWT → installation token, evaluates its conditions, then calls `POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule` with `state: approved` or `state: rejected` [5].

**Marketplace examples** mentioned in docs: Datadog, Honeycomb, ServiceNow [6].

**Limitations:**
- Max 6 protection rules per environment [2].
- Custom rules require deployment objects — incompatible with `deployment: false` [6].
- Custom deployment protection rules are in **public preview** [2][5].

### Deployment Tracking

GitHub provides multiple surfaces for deployment visibility [11]:

**Deployments Page** (repo main page → sidebar → Deployments):
- Currently active deployments across environments.
- Full deployment history with commit links, workflow logs, and deployment URLs.
- Filtering by environment, status, and other qualifiers.
- Pin up to 10 environments to the top of the history.
- Source PR and branch links for each deployment.

**Deployment REST API** [12]:
- `GET /repos/{owner}/{repo}/deployments` — list deployments with filters (sha, ref, task, environment).
- `POST /repos/{owner}/{repo}/deployments` — create a deployment (ref, environment, payload, auto_merge, required_contexts).
- Deployment statuses: `error`, `failure`, `pending`, `in_progress`, `queued`, `success` [12].
- Setting state to `success` automatically marks prior non-transient deployments in the same environment as `inactive` [12].

**Webhooks:**
- `deployment` event — fired when new deployments are created [12].
- `deployment_status` event — fired when deployment status changes [12].

**Integrations:**
- Microsoft Teams and Slack integrations for deployment notifications [6].
- Custom apps can consume deployment/status webhooks for dashboards and alerting [6].

**Concurrency controls** [6]:
- Use `concurrency` groups to ensure only one deployment per environment is in progress.
- `cancel-in-progress: true` cancels pending deployments when a new one starts.

### Enterprise Deployment Policies

GHEC enterprise owners have broad policy controls that affect deployments [7]:

| Policy Area | Enterprise Controls |
|-------------|-------------------|
| **Actions enablement** | Enable/disable GitHub Actions per organization [7] |
| **Allowed actions** | Restrict to enterprise actions only, add verified creators, pin to commit SHAs [7] |
| **Runner scope** | Disable repository-level self-hosted runners enterprise-wide [7] |
| **GITHUB_TOKEN permissions** | Set default to read-only enterprise-wide (default for enterprises created after Feb 2023) [7] |
| **Fork PR workflows** | Require approval for outside collaborators; control secret/token access [7] |
| **Artifact/log retention** | 1–400 days for private repos; 1–90 for public [7] |
| **Cache settings** | Max retention up to 365 days; storage limit up to 10,000 GB/repo [7] |
| **Required workflows** | Enforce via **Repository Rulesets** (migrated from Actions Required Workflows in Oct 2023) [13] |

**Key L300 point:** Enterprise policies act as **maximums** — organization admins can set stricter limits but cannot exceed enterprise settings [7]. Repository admins are further constrained by organization settings. This creates a three-tier governance model: Enterprise → Organization → Repository.

**Workflow permissions:** Enterprises created on or after February 2, 2023, default to **read-only** `GITHUB_TOKEN` permissions. This is a security-first default that L300 admins should understand and maintain [7].

---

## What to Cover in Workshop (L300)

Given the advanced audience, focus on **architecture decisions, governance, and security hardening** rather than basic "how to create an environment" tutorials:

1. **Environment topology design** — How to structure environments across repos for multi-tier applications (dev → staging → canary → production). When to use `deployment: false` for CI environments.

2. **OIDC deep-dive (critical)** — Walk through the full token exchange flow. Show how to configure Azure federated credentials, AWS IAM trust policies, and GCP Workload Identity. Demonstrate subject claim customization and the new `repo_property_*` custom claims for ABAC.

3. **Protection rule composition** — How required reviewers + wait timers + custom gates compose. The 6-rule-per-environment limit. Admin bypass controls and when to disable them.

4. **Custom deployment gates** — Build a simple GitHub App that gates production deployments on an external health check. Show the webhook → approval API flow.

5. **Enterprise policy governance** — The three-tier policy model (enterprise → org → repo). How to enforce commit SHA pinning, restrict runner scope, and lock down `GITHUB_TOKEN` permissions.

6. **Concurrency and rollback patterns** — Using concurrency groups to prevent parallel deployments. Blue/green and canary patterns using environment-per-slot or matrix strategies.

7. **Deployment observability** — Using the Deployments API and webhooks to build dashboards. Teams/Slack integration. Audit log entries for deployment approvals.

8. **Required workflows via Repository Rulesets** — How required workflows migrated from Actions to Rulesets, and how to enforce CI/CD gates at the org level.

---

## Workshop Exercise Ideas

### Exercise 1: Multi-Environment OIDC Pipeline

**Objective:** Configure a complete deployment pipeline with OIDC authentication to Azure.

- Create three environments: `development`, `staging`, `production`.
- Configure deployment branch restrictions: `development` = all branches, `staging` = `main` only, `production` = `release/*` tags only.
- Add required reviewers (2 people) and a 5-minute wait timer on `production`.
- Set up Azure federated credentials with subject claims scoped to each environment.
- Build a workflow that deploys to all three environments sequentially using OIDC (no stored credentials).
- **Verify:** Show that a feature branch cannot deploy to `staging`; show that OIDC tokens are scoped per environment.

### Exercise 2: Custom Deployment Gate with Health Checks

**Objective:** Build a GitHub App that gates production deployments on application health.

- Create a minimal GitHub App that subscribes to `deployment_protection_rule`.
- The App checks a mock health endpoint and auto-approves if healthy, rejects if unhealthy.
- Install the App on a repository and enable it on the `production` environment.
- Trigger a deployment and observe the approval flow.
- Post status reports with Markdown-formatted health check results.
- **Verify:** Show the status report in the GitHub UI; show rejection when the health endpoint is down.

### Exercise 3: Enterprise Policy Lockdown

**Objective:** Configure enterprise-level deployment governance for a GHEC organization.

- At the enterprise level: restrict actions to enterprise + verified marketplace creators, require commit SHA pinning, set `GITHUB_TOKEN` to read-only.
- Demonstrate that an organization admin cannot override the enterprise maximum.
- Create an organization-level Repository Ruleset that requires a CI workflow to pass before merging.
- Configure environment-level protections and show the three-tier governance flow.
- **Verify:** Attempt to use a non-pinned action and show the policy block; attempt to bypass a required reviewer without admin privileges.

---

## Sources

1. GitHub Docs — Managing environments for deployment: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment
2. GitHub Docs — Deployments and environments reference: https://docs.github.com/en/actions/reference/deployments-and-environments
3. GitHub Docs — About security hardening with OpenID Connect: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect
4. GitHub Docs — Configuring OpenID Connect in Azure: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-azure
5. GitHub Docs — Creating custom deployment protection rules: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/creating-custom-deployment-protection-rules
6. GitHub Docs — Deploying with GitHub Actions: https://docs.github.com/en/actions/concepts/use-cases/deploying-with-github-actions
7. GitHub Docs — Enforcing policies for GitHub Actions in your enterprise: https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise
8. GitHub Docs — OpenID Connect reference: https://docs.github.com/en/actions/reference/openid-connect-reference
9. GitHub Docs — Configuring OpenID Connect in Amazon Web Services: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
10. GitHub Docs — Configuring OpenID Connect in Google Cloud Platform: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-google-cloud-platform
11. GitHub Docs — Viewing deployment history: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/viewing-deployment-history
12. GitHub Docs — REST API endpoints for deployments: https://docs.github.com/en/rest/deployments/deployments
13. GitHub Blog — Required Workflows moving to Repository Rules: https://github.blog/changelog/2023-05-04-github-actions-required-workflows-will-move-to-repository-rules/
14. Microsoft Learn — Deploy to Azure infrastructure with GitHub Actions: https://learn.microsoft.com/en-us/azure/developer/github/deploy-to-azure
