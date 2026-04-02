# Knowledge Checks

These questions validate understanding of key concepts from each workshop module. Questions test comprehension and application, not memorization. Use during or after each day's sessions to reinforce learning and identify areas that need further discussion.

## How to Use

- Present 2-3 questions at the end of each major topic block
- Allow participants to discuss in small groups before answering
- Use the collapsed answer key section at the bottom for verification
- Focus on understanding and practical application

---

## Day 1

### Repository Permissions and Settings (1.1)

**Q1.1.1:** Your organization has 200 developers. You want all members to be able to read any repository but only push to repos they're explicitly granted access to. What base permission should you set?

- A) No permission
- B) Read
- C) Write
- D) Admin

**Q1.1.2:** A team lead asks you to create a role that can manage branch protection rules but cannot delete the repository. Which approach is correct?

- A) Give them the Admin role
- B) Create a custom repository role with the "edit repository rules" permission
- C) Add them as a repository collaborator with Write access
- D) This is not possible in GitHub Enterprise Cloud

**Q1.1.3:** An organization member with Read access reports they cannot view Actions workflow logs on a private repository. What is the most likely cause?

- A) GitHub Actions is disabled for the repository
- B) The organization has restricted Actions log visibility to users with Write access or higher
- C) Actions logs are always visible to all members
- D) The user needs to enable Actions in their personal settings

### Branches, PRs, and Rulesets (1.2, 1.3)

**Q1.2.1:** What is the recommended modern approach for protecting branches in GitHub Enterprise Cloud?

- A) Branch protection rules (Settings → Branches)
- B) Repository rulesets (Settings → Rules → Rulesets)
- C) CODEOWNERS file
- D) Required status checks only

**Q1.2.2:** You need to enforce branch protection on all repositories across your organization, including future repos. Which approach achieves this?

- A) Configure branch protection rules on each repository individually
- B) Create an organization-level ruleset targeting all repositories
- C) Use a GitHub Actions workflow to enforce protections
- D) Set branch protection in the enterprise policy

**Q1.2.3:** A developer wants to know why they can push directly to `main` in one repository but not another, even though both have rulesets. What should you check?

- A) Whether the developer has Admin access on one of the repos
- B) Whether one ruleset is set to "Evaluate" mode instead of "Active" mode
- C) Whether the developer is using SSH vs HTTPS
- D) Both A and B could explain this behavior

### Required Status Checks (1.4)

**Q1.4.1:** A developer reports they cannot merge their PR even though all CI checks have passed. The PR shows "Review required." What is the most likely cause?

- A) A bug in GitHub
- B) The ruleset requires pull request reviews before merging
- C) The developer doesn't have write access
- D) Status checks are misconfigured

**Q1.4.2:** What happens when you configure a required status check that has never run on a branch?

- A) The check is automatically skipped
- B) The branch cannot receive pull requests
- C) PRs targeting that branch will be blocked until the check reports a status
- D) GitHub automatically creates a passing check

**Q1.4.3:** Your team uses a monorepo with multiple CI workflows. Only the `frontend-tests` workflow is relevant for changes in the `src/frontend/` directory. How can you avoid blocking PRs that only touch backend code?

- A) Remove `frontend-tests` as a required check
- B) Use path-based filters in the workflow and configure the check as required with "Do not require" when not applicable
- C) Create separate repositories for frontend and backend
- D) Have developers manually bypass the check

### Security in the Cloud (1.5)

**Q1.5.1:** Your security team wants to prevent developers from accidentally pushing AWS access keys to any repository. Which GitHub feature should you enable?

- A) Code scanning with CodeQL
- B) Dependabot alerts
- C) Secret scanning with push protection
- D) Repository rulesets

**Q1.5.2:** What is the difference between secret scanning alerts and push protection?

- A) Alerts notify after a secret is pushed; push protection blocks the push before it happens
- B) They are the same feature with different names
- C) Push protection only works with GitHub Actions secrets
- D) Alerts only work on public repositories

**Q1.5.3:** A Dependabot alert shows a critical vulnerability in a transitive dependency. What does "transitive" mean?

- A) The vulnerability is in your code
- B) The vulnerability is in a package your direct dependency depends on
- C) The vulnerability only affects production environments
- D) The vulnerability has been automatically fixed

**Q1.5.4:** Your organization wants to roll out code scanning with CodeQL across 300 repositories. What is the most efficient approach?

- A) Manually add CodeQL workflow files to each repository
- B) Use default setup to enable CodeQL at the organization level for all eligible repositories
- C) Create a GitHub App that adds CodeQL to each repo
- D) Ask each team to configure their own scanning

### User Privacy, Licenses, and Marketplace (1.6, 1.7, 1.8)

**Q1.6.1:** An organization member in the EU asks about data residency. Where can GitHub Enterprise Cloud data be stored?

- A) Only in the US
- B) Only in the EU
- C) GitHub offers data residency options; GHEC with data residency allows choosing EU or other regions
- D) Data is stored wherever the user is located

**Q1.7.1:** How does GitHub Enterprise Cloud count billable seats?

- A) Every user who visits the organization's repos
- B) Every member and outside collaborator consuming a seat, including dormant users
- C) Only users who push code
- D) Based on the number of repositories

**Q1.7.2:** Your finance team notices the seat count increased by 20 after adding outside collaborators to a private repository. Is this expected?

- A) No — outside collaborators do not consume seats
- B) Yes — outside collaborators on private/internal repos consume a billable seat
- C) Only if the collaborators have Write access or higher
- D) Only if the collaborators accepted the invitation

---

## Day 2

### Integrations and Authentication (2.1)

**Q2.1.1:** Your enterprise uses Microsoft Entra ID (formerly Azure AD). You want users to be provisioned and deprovisioned automatically when they join or leave the company. Which combination of protocols should you configure?

- A) SAML SSO only
- B) SAML SSO + SCIM provisioning
- C) OAuth only
- D) Personal access tokens

**Q2.1.2:** What is the key difference between a GitHub App and an OAuth App?

- A) GitHub Apps use fine-grained permissions and are installed on specific repos; OAuth Apps act on behalf of a user
- B) They are the same thing
- C) OAuth Apps are more secure
- D) GitHub Apps can only be used with GitHub Actions

**Q2.1.3:** A developer needs to authenticate their CI/CD pipeline with GitHub. They currently use a personal access token (classic). What would you recommend as a more secure alternative?

- A) Use a fine-grained personal access token scoped to specific repos
- B) Create a GitHub App and use installation tokens
- C) Store the classic PAT in a GitHub Actions secret
- D) Both A and B are improvements, but B is the most secure for CI/CD

### Enterprise Administration and Policies (2.2, 2.4)

**Q2.2.1:** An enterprise owner sets a policy to "Enforce" repository visibility as "Private and Internal only" at the enterprise level. What happens when an org admin tries to create a public repository?

- A) They can override the enterprise policy
- B) They are blocked — the enterprise policy is enforced
- C) The repository is created as internal instead
- D) They receive a warning but can proceed

**Q2.2.2:** Your enterprise has three organizations: `eng`, `data-science`, and `marketing`. You want `eng` to use GitHub Actions freely but restrict `marketing` to only approved actions. How should you configure this?

- A) Set the enterprise policy to "Allow all actions" and manually restrict `marketing`
- B) Set the enterprise policy to "Allow select actions" and allow `eng` to override at the org level
- C) This requires separate enterprise accounts
- D) Set the enterprise policy to "Not set" (no policy), then configure each org individually

**Q2.4.1:** You want to standardize Actions workflow permissions across all organizations in your enterprise. Where should you configure this?

- A) In each repository's settings
- B) In each organization's settings
- C) In the enterprise policy settings (Settings → Policies → Actions)
- D) In a `.github` repository

### User Administration and Teams (2.5, 2.6, 2.7)

**Q2.5.1:** You have 500 users but suspect many are inactive. Which metric does GitHub use to determine if a user is "dormant"?

- A) No commits in the last 30 days
- B) No login activity, no Git operations, and no web activity in a configurable period
- C) No pull requests in the last 90 days
- D) The user hasn't changed their password

**Q2.5.2:** You need to offboard a contractor who has access to sensitive repositories. Which steps should you take to ensure complete access revocation?

- A) Remove them from the organization only
- B) Remove them from the organization, revoke any active SAML sessions, and review their PATs and SSH keys
- C) Change the repository visibility to private
- D) Ask the contractor to delete their GitHub account

**Q2.7.1:** Your organization uses Microsoft Entra ID groups synced via SCIM. You want team membership to mirror AD groups. What feature enables this?

- A) Manual team membership management
- B) Team synchronization (IdP sync)
- C) CODEOWNERS file
- D) Enterprise Managed Users is the only way

**Q2.7.2:** A nested team structure has `platform` as a parent team and `platform-backend` as a child team. If `platform` has Write access to a repo, what access does `platform-backend` inherit?

- A) No access — child teams don't inherit permissions
- B) Write access — child teams inherit parent permissions and can have additional permissions
- C) Read access only
- D) Admin access

### Audit Log (2.3)

**Q2.3.1:** You need to investigate who changed the base permission of an organization from "Read" to "Write" last Tuesday. Where do you look and what event do you search for?

- A) Git log → search for permission changes
- B) Organization audit log → search for `org.update_member_repository_permission` events
- C) Repository insights → search for access changes
- D) Enterprise audit log → search for `repo.access` events

**Q2.3.2:** Your compliance team wants to stream audit log events to their SIEM in real-time. Which audit log feature supports this?

- A) Exporting audit log as CSV
- B) Audit log streaming to supported endpoints (S3, Splunk, Azure Event Hubs, etc.)
- C) GitHub webhooks for audit events
- D) Polling the REST API every 5 minutes

**Q2.3.3:** You need to prove to an auditor that no one bypassed branch protections on the `main` branch in the last 90 days. Which audit log events should you query?

- A) `git.push` events
- B) `protected_branch.policy_override` and related bypass events
- C) `repo.update` events
- D) This information is not available in the audit log

### API and Webhooks (2.8, 2.11)

**Q2.8.1:** You need to retrieve a list of all repositories in your organization along with their last commit date. Which API approach is most efficient?

- A) REST API with pagination — one request per repo
- B) GraphQL API — single query with nested fields for repos and commits
- C) GitHub CLI with `gh repo list`
- D) Both B and C are efficient approaches

**Q2.8.2:** Your automation script is hitting GitHub API rate limits. Which strategies can help reduce rate limit consumption?

- A) Use conditional requests with `If-None-Match` / ETags
- B) Switch from REST to GraphQL to reduce the number of requests
- C) Authenticate with a GitHub App installation token for higher limits
- D) All of the above

**Q2.11.1:** A webhook you configured is receiving a `401 Unauthorized` response. What should you check first?

- A) The webhook URL is correct
- B) The webhook secret is correctly configured on both sides
- C) The repository exists
- D) GitHub is experiencing an outage

**Q2.11.2:** You want to ensure that incoming webhook payloads are genuinely from GitHub and haven't been tampered with. What mechanism does GitHub provide for this?

- A) IP allowlisting only
- B) HMAC signature verification using the webhook secret (`X-Hub-Signature-256` header)
- C) OAuth token in the payload
- D) SSL/TLS is sufficient — no additional verification needed

### Deployment, Automation, and Repo Health (2.10, 2.12, 2.13, 2.14)

**Q2.10.1:** You want to require manual approval before deploying to production. Which GitHub feature should you configure?

- A) Branch protection rules
- B) Environment protection rules with required reviewers
- C) CODEOWNERS file
- D) Repository rulesets

**Q2.10.2:** Your team has `staging` and `production` environments. You want deployments to production to only occur after a successful staging deployment. How can you enforce this?

- A) Use environment protection rules with a deployment branch policy
- B) Add a manual approval step in the Actions workflow
- C) Configure the production environment to require the staging deployment workflow to succeed first
- D) All of the above can contribute, but C with workflow dependencies is the most direct approach

**Q2.12.1:** You want to automate the creation of 50 repositories with standardized settings. Which approach is best?

- A) Create them manually one by one
- B) Use `gh repo create` in a shell script with the GitHub CLI
- C) Use the GitHub web UI with a template repository
- D) Ask GitHub support to create them

**Q2.14.1:** A repository has grown to 8 GB due to accidentally committed binary files. What tool can help clean the Git history to reduce the size?

- A) `git rebase`
- B) `git-filter-repo` or BFG Repo-Cleaner
- C) `git reset --hard`
- D) Delete and recreate the repository

### Copilot Governance (2.15)

**Q2.15.1:** Your enterprise has set a Copilot policy to "Disabled" at the enterprise level, but an organization admin enables Copilot for their org. Which level takes precedence?

- A) Organization policy overrides enterprise policy
- B) Enterprise policy overrides organization policy
- C) The most recently changed policy takes precedence
- D) Users can choose which policy to follow

**Q2.15.2:** You want to prevent GitHub Copilot from using specific repositories as context when generating suggestions. How should you configure this?

- A) Delete the repositories
- B) Set the repositories to private visibility
- C) Configure content exclusion rules in enterprise/organization Copilot settings
- D) Disable Copilot for all users in the organization

---

## Answer Key

<details>
<summary>Click to reveal answers</summary>

### Day 1 Answers

| Question | Answer | Explanation |
|----------|--------|-------------|
| Q1.1.1 | B | Read base permission allows viewing all repos; push requires explicit team/collaborator access |
| Q1.1.2 | B | Custom repository roles allow granular permission assignment without full admin |
| Q1.1.3 | B | Organizations can restrict Actions log visibility; Read access alone may not be sufficient depending on org settings |
| Q1.2.1 | B | Repository rulesets are the modern replacement, supporting org-level enforcement and bypass lists |
| Q1.2.2 | B | Organization-level rulesets can target all current and future repositories with a single configuration |
| Q1.2.3 | D | Both admin bypass and "Evaluate" mode (which logs but does not enforce) could explain the behavior |
| Q1.4.1 | B | Required reviews are separate from status checks; both must pass before merging |
| Q1.4.2 | C | PRs are blocked until the required check reports a status — GitHub does not auto-pass missing checks |
| Q1.4.3 | B | Path-based workflow filters combined with "Do not require" for non-applicable checks avoids unnecessary blocking |
| Q1.5.1 | C | Secret scanning with push protection prevents secrets from being pushed to the repository |
| Q1.5.2 | A | Alerts are reactive (post-push notification); push protection is proactive (blocks the push) |
| Q1.5.3 | B | Transitive dependencies are indirect — packages that your direct dependencies depend on |
| Q1.5.4 | B | Default setup enables CodeQL at scale from the organization security settings page |
| Q1.6.1 | C | GHEC with data residency allows enterprise customers to select their storage region |
| Q1.7.1 | B | Billable seats include all members and outside collaborators consuming a license, regardless of activity level |
| Q1.7.2 | B | Outside collaborators on private/internal repos each consume a billable seat |

### Day 2 Answers

| Question | Answer | Explanation |
|----------|--------|-------------|
| Q2.1.1 | B | SAML handles authentication (SSO); SCIM automates user lifecycle (provisioning/deprovisioning) |
| Q2.1.2 | A | GitHub Apps are installed per-repo with fine-grained permissions; OAuth Apps act as the authenticated user |
| Q2.1.3 | D | Fine-grained PATs and GitHub App tokens both improve on classic PATs; Apps are most secure for CI/CD |
| Q2.2.1 | B | Enterprise-level "Enforce" policies cannot be overridden by organization admins |
| Q2.2.2 | D | Setting "Not set" at the enterprise level allows each org to configure their own Actions policy |
| Q2.4.1 | C | Enterprise policy settings cascade to all organizations as the centralized control point |
| Q2.5.1 | B | Dormancy considers multiple signals: login, Git operations, and web activity over a configurable period |
| Q2.5.2 | B | Complete offboarding requires org removal, SAML session revocation, and reviewing tokens/keys |
| Q2.7.1 | B | Team sync maps IdP groups to GitHub teams, automating membership based on directory groups |
| Q2.7.2 | B | Child teams inherit parent team permissions and can have additional permissions granted |
| Q2.3.1 | B | The organization audit log tracks permission changes with specific event names like `org.update_member_repository_permission` |
| Q2.3.2 | B | Audit log streaming provides near-real-time delivery to SIEM endpoints like S3, Splunk, and Azure Event Hubs |
| Q2.3.3 | B | Branch protection bypass events are recorded in the audit log and can be queried for compliance |
| Q2.8.1 | D | GraphQL is most efficient for nested data retrieval; `gh` CLI wraps it conveniently for scripting |
| Q2.8.2 | D | ETags, GraphQL, and GitHub App tokens all help manage rate limits effectively |
| Q2.11.1 | B | A 401 error on webhook delivery typically indicates a secret mismatch between sender and receiver |
| Q2.11.2 | B | GitHub signs payloads with HMAC-SHA256 using the webhook secret; verify via the `X-Hub-Signature-256` header |
| Q2.10.1 | B | Environment protection rules support required reviewers, wait timers, and branch restrictions for deployments |
| Q2.10.2 | D | Combining environment rules, workflow gates, and deployment dependencies provides layered enforcement |
| Q2.12.1 | B | GitHub CLI scripting with `gh repo create` is the most efficient and repeatable approach for bulk creation |
| Q2.14.1 | B | `git-filter-repo` and BFG Repo-Cleaner are purpose-built tools for rewriting Git history to remove large files |
| Q2.15.1 | B | Enterprise-level Copilot policies override organization-level settings; enterprise "Disabled" cannot be overridden by org admins |
| Q2.15.2 | C | Content exclusion rules in enterprise/organization Copilot settings prevent specific repositories from being used as context |

</details>
