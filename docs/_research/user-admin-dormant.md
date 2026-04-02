# Research Brief: User Administration & Dormant Users

> **VBD Agenda Items:** 2.5 (Administer users), 2.6 (Manage dormant users)
> **Priority:** P0 (2.5) / P1 (2.6)
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

GitHub Enterprise Cloud (GHEC) provides a comprehensive user lifecycle management system that spans from initial invitation through role assignment, activity monitoring, and eventual offboarding. There are two fundamentally different enterprise models: **enterprises with personal accounts** (where users bring their own GitHub.com accounts) and **Enterprise Managed Users (EMU)** (where the enterprise controls the full user lifecycle from an external identity provider via SCIM) [1][2]. The choice of model dictates how users are provisioned, how dormancy is tracked, and how offboarding is performed.

Dormant user management is a critical cost-optimization and security function. GitHub considers a user dormant if they have not performed any qualifying activity within the past 30 days [3]. Enterprise owners can download a dormant users report from the Compliance tab and use it to identify candidates for license reclamation [3]. For EMU enterprises, dormant user management intersects with SCIM deprovisioning workflows, making it essential that administrators understand the difference between soft-deprovisioning (reversible suspension) and hard-deprovisioning (permanent suspension requiring a new account) [4].

Credential governance rounds out the user administration story. Enterprise owners can enforce PAT lifetime policies, restrict access by token type (classic vs. fine-grained), require approval workflows for fine-grained PATs, manage SSH certificate authorities, and audit authorized credentials per user through the SAML identity panel [5][6]. Together, these capabilities give L300 administrators the tools to maintain a secure, cost-efficient GitHub Enterprise Cloud deployment.

## Key Concepts

### User Lifecycle & Roles

#### Enterprise-Level Roles

GitHub Enterprise Cloud defines the following enterprise-level roles [7]:

| Role | Description |
|------|-------------|
| **Enterprise owner** | Complete control: manage admins, add/remove orgs, enforce policies, manage billing and security settings. Do **not** have access to org settings or content by default — must explicitly join an organization. |
| **Billing manager** | Can view and manage user licenses, usage-based billing, and billing settings only. Cannot access org settings or content (except internal repos in orgs where they are a member). |
| **App manager** | Can view, create, edit, and delete GitHub App registrations owned by the enterprise. Cannot install/uninstall apps on enterprise or org. |
| **Security manager** | (Public preview) Can view security results, manage security configurations, and access security alerts/dashboards across all repos in the enterprise. Has read access to code in all repos and write access to all security alerts. |
| **User (member)** | No administrative access by default. Includes org members and unaffiliated users. |
| **Guest collaborator** | (EMU only) Provisioned by IdP; limited access — cannot see internal repos except in orgs where explicitly added as a member. |
| **Custom roles** | Define custom permission sets for delegated enterprise administration. |

**Key detail:** Enterprise owners do **not** automatically have access to organization content. They must join an organization to access its resources [7]. This is a common misconception worth addressing in L300 content.

#### Organization-Level Roles

Within each organization, users can hold these roles [8]:

- **Organization owner** — Complete admin access to the org
- **Organization member** — Default non-admin role; can create repos and projects
- **Moderator** — Can block/unblock non-member contributors, set interaction limits, hide comments
- **Billing manager** — Manages org billing settings
- **Security manager** — View security alerts and manage security settings across the org
- **GitHub App manager** — Manage GitHub App registrations for the org
- **Outside collaborator** — Access to specific repositories without org membership (called "repository collaborator" in EMU enterprises)

#### Invitation Flow

For enterprises with personal accounts [1]:
1. Enterprise owners can **invite users directly** to the enterprise as unaffiliated users
2. Org owners invite users to specific organizations
3. Enterprise owners can **invite enterprise owners and billing managers** via the enterprise settings
4. Pending invitations are visible in the enterprise People tab under "Invitations"
5. SCIM-provisioned invitations must be cancelled via the IdP, not GitHub UI

For EMU enterprises:
- Users are **provisioned via SCIM** from the IdP — there is no manual invitation flow [2]
- The IdP controls usernames, profile data, org membership, and repository access

#### Viewing & Exporting Members

Enterprise owners can view all members via the **People** tab, which shows [9]:
- Current enterprise members and administrators
- Pending invitations (members, admins, outside collaborators)
- Outside collaborators
- Suspended members (EMU only)
- Dormant users
- Members grouped by role, license type, and deployment

The **membership information report** can be exported as CSV and includes [10]:
- Username and display name
- 2FA status and security level
- Org owner/member status
- Pending org invitations
- Verified domain email addresses
- SAML NameID
- GitHub Enterprise Server usernames (if GitHub Connect configured)

For enterprises with < 1,000 members, the CSV downloads immediately. For ≥ 1,000 members, an email with a download link is sent [10].

**API access:** The GraphQL API provides the `Enterprise` object with `members`, `admins`, and `outsideCollaborators` connections [10]. The `removeEnterpriseMember` mutation can automate offboarding [11].

### Enterprise Managed Users

#### How EMU Works

Enterprise Managed Users (EMU) enables full lifecycle management from an external Identity Provider (IdP) [2]:

- **IdP provisions new user accounts** on GitHub with access to the enterprise
- **Users authenticate via the IdP** (SAML 2.0 or OIDC) to access enterprise resources
- **Usernames, profile data, org membership, and repo access** are controlled from the IdP
- **OIDC** is only supported with Microsoft Entra ID; all other IdPs use SAML [12]
- Managed users **cannot create public content** or collaborate outside the enterprise [2]

#### Partner IdPs (Paved-Path)

GitHub provides "paved-path" applications for these partner IdPs [12]:
- **Microsoft Entra ID** (SAML or OIDC)
- **Okta** (SAML)
- **PingFederate** (SAML)

**Important:** The combination of **Okta and Entra ID** for SSO and SCIM (in either order) is explicitly **not supported** — the SCIM API will return an error [12].

#### SCIM Provisioning

SCIM (System for Cross-domain Identity Management) 2.0 is used for user lifecycle management [12]:

**Key API endpoints for user provisioning:**

| Action | Method | Endpoint |
|--------|--------|----------|
| List provisioned users | `GET` | `/scim/v2/enterprises/{enterprise}/Users` |
| Create a user | `POST` | `/scim/v2/enterprises/{enterprise}/Users` |
| Get a specific user | `GET` | `/scim/v2/enterprises/{enterprise}/Users/{scim_user_id}` |
| Update all user attributes | `PUT` | `/scim/v2/enterprises/{enterprise}/Users/{scim_user_id}` |
| Update individual attribute | `PATCH` | `/scim/v2/enterprises/{enterprise}/Users/{scim_user_id}` |
| Hard-deprovision (permanent) | `DELETE` | `/scim/v2/enterprises/{enterprise}/Users/{scim_user_id}` |

**SCIM token requirements:** A PAT (classic) with `scim:enterprise` scope associated with the enterprise's setup user. GitHub recommends no expiration date on this token [12].

**Rate limits:** Do not assign more than 1,000 users per hour to the SCIM integration, and do not add more than 1,000 users to each group per hour [12].

**Best practices [12]:**
- Ensure the IdP is the **only source of write operations** — do not make ad hoc `POST`/`PUT`/`PATCH`/`DELETE` requests
- Provision users **before** provisioning groups
- Configure **audit log streaming** (data retained for 180 days otherwise)
- Use `scim:enterprise` scope (not `admin:enterprise`) for least-privilege

#### EMU vs. Personal Accounts — Key Differences

| Feature | Personal Accounts | EMU |
|---------|------------------|-----|
| Account creation | User creates their own GitHub.com account | IdP provisions via SCIM |
| Username control | User chooses | IdP assigns (normalized) |
| Profile changes | User controls | IdP controls; cannot change on GitHub |
| Public repos/contributions | Allowed | **Not allowed** |
| Collaboration outside enterprise | Allowed | **Not allowed** |
| Offboarding | Remove from enterprise | Suspend via IdP (SCIM deprovision) |
| Guest collaborator role | Outside collaborator (not provisioned by IdP) | Guest collaborator (provisioned by IdP) |
| Internal repo access | All org members see all internal repos | Same, except guest collaborators only see internal repos in their orgs |

#### Guest Collaborators (EMU Only)

The guest collaborator role provides limited access for vendors and contractors [13]:
- Provisioned by the IdP with the `guest_collaborator` role attribute
- Can be added as org members or repo collaborators
- **Cannot** access internal repos except in orgs where they are explicit members
- The key difference: regular EMU users added to one org can access **all** internal repos enterprise-wide; guest collaborators cannot

Enabling guest collaborators requires updating the IdP application manifest (Entra ID) or profile editor (Okta) with a specific role definition [13].

### Dormant User Management

#### Definition of Dormancy

A user account is considered **dormant** if it has not been active for **30 days** [3]. Only enterprise owners can access dormant user reports.

#### Activities That Count as "Active"

The following activities on enterprise-associated resources mark a user as active [3]:

- Authenticating via SAML SSO
- Creating a repository
- Pushing to an internal repository via HTTPS
- Being added to a repository
- Changing repository visibility
- Creating an issue or pull request
- Commenting on an issue or pull request
- Closing/reopening an issue or pull request
- Applying/removing labels on issues or PRs
- Assigning/unassigning issues or PRs
- Requesting/removing PR review requests
- Creating/editing PR review comments
- Dismissing a PR comment
- Synchronizing a pull request
- Commenting on a commit
- Publishing a release
- Pushing to a wiki
- Starring a repository
- Deleting a repository
- Joining an organization

#### Activities That Do NOT Count as Active

**Critical for L300 admins to understand** [3]:

- **Accessing resources via PAT, SSH key, or GitHub App** — these do NOT count
- **Git operations (push, pull, clone) on private repositories** — these do NOT count
- Any activity on public repos **outside** the enterprise

This means a developer who exclusively uses PATs or SSH keys for CI/CD and Git operations on private repos may appear dormant even though they are actively using GitHub. This is a major gotcha for automated license reclamation.

**Important:** You cannot manually mark a dormant user as active. The user must perform one of the qualifying activities listed above [3].

#### Downloading the Dormant Users Report

1. Navigate to the enterprise account
2. Click **Compliance** at the top of the page
3. Scroll to "Reports"
4. Optionally click **New report** next to "Dormant Users" to generate a fresh report
5. Under "Recent reports," click **Download** next to the desired report [3]

The report is a CSV file that can be used to cross-reference with other systems.

#### Dormant Users in the Enterprise People View

Enterprise owners can also view dormant users directly in the **People** tab of the enterprise settings [9]. A user account is considered dormant if it has not been active for 30 days.

### License Reclamation

#### How Licensing Works

GitHub Enterprise uses a **unique-user licensing model** [14]:
- Each user consumes one license regardless of how many orgs they belong to or how many GHES instances they use
- Outside collaborators with access to private/internal repos consume a license
- Pending invitations to outside collaborators also consume a license
- **Unaffiliated users** (not members of any org, no enterprise owner/billing manager role) do **not** consume a GitHub Enterprise license [7]

#### Reclamation Strategies

**For enterprises with personal accounts:**
1. **Download the dormant users report** to identify inactive users [3]
2. **Remove dormant members from the enterprise** via UI or the `removeEnterpriseMember` GraphQL mutation [11][15]
3. Removing a member removes them from **all organizations** owned by the enterprise
4. **Also remove IdP access** if using SAML SSO — otherwise the user may rejoin via the SAML endpoint [15]
5. If an enterprise member is the **last owner** of an org, the enterprise owner inherits ownership [15]

**For EMU enterprises:**
1. Download the dormant users report [3]
2. Cross-reference with IdP group assignments
3. **Soft-deprovision** via IdP to suspend the user (reversible) [4]
4. Suspended users stop consuming licenses [16]
5. Only use **hard-deprovisioning** when certain the user will not return (irreversible) [4]

**Automation approaches:**
- Use the **GraphQL API** `enterprise.members` connection to list members, combined with the dormant user report CSV, to build automated reclamation workflows
- Use the `removeEnterpriseMember` mutation for personal-account enterprises
- For EMU, drive all changes through the IdP's SCIM integration (never write directly to the SCIM API if using a partner IdP) [12]
- Consider scheduling regular (e.g., monthly) dormant user report generation and review

### User Suspension & Removal

#### Personal Account Enterprises

**Removing a member** [15]:
- Member is removed from **all organizations** owned by the enterprise
- Loses all privileges granted through the enterprise (roles, licenses)
- **Data preservation:** Commits, issues, PRs, comments in org-owned repos are retained
- PATs, SSH keys, and app authorizations can no longer access enterprise resources
- The user's personal GitHub account continues to exist and function outside the enterprise
- If SAML SSO is configured, also remove IdP access to prevent re-entry

**Key API:** `removeEnterpriseMember` GraphQL mutation [11]

**Outside collaborators** cannot be removed via enterprise settings — must be removed from each repo or org individually [15][16].

#### EMU Enterprises

**Soft-deprovisioning** (reversible) [4]:
- Triggered by: `PUT`/`PATCH` setting `active: false`, disabling in Entra ID, unassigning from app in Okta, etc.
- User is **suspended** and loses access
- Username is **obfuscated** to a hash + shortcode
- Email is obfuscated (except with Entra ID, where it remains)
- SCIM identity remains linked (allows reprovisioning)
- Forks of private/internal repos deleted within 24 hours (restored if unsuspended within 90 days)
- Removed from IdP groups and mapped teams
- Resources (comments, issues, etc.) are **retained**

**Hard-deprovisioning** (irreversible) [4]:
- Triggered by: `DELETE` to SCIM endpoint, hard-deletion in Entra ID
- User is **permanently suspended** — cannot be unsuspended
- Username, email, display name all obfuscated/cleared
- **SCIM identity deleted** (no link for reprovisioning)
- **PATs, SSH keys, GPG keys, and app authorizations deleted**
- **User-owned repositories deleted**
- Comments and other contributed resources are retained
- A new account must be provisioned if the person needs access again

**Audit log events for deprovisioning [4]:**

| Event | Soft | Hard |
|-------|------|------|
| `user.suspend` | ✓ | |
| `user.remove_email` | ✓ | ✓ |
| `user.rename` | ✓ | |
| `external_identity.deprovision` | ✓ | ✓ |
| `team.remove_member` | ✓ (if in mapped team) | ✓ (if in mapped team) |
| `org.remove_member` | ✓ (if managed by IdP) | ✓ (if managed by IdP) |

#### Offboarding Best Practices

The recommended approach depends on enterprise type [16]:
- **Personal accounts:** Remove the user from the enterprise account (UI or API). Also remove from IdP if SAML is configured.
- **EMU:** Suspend via the IdP (triggers SCIM deprovision). Cannot fully remove managed users from the enterprise — they show as "suspended."
- For both: the user stops consuming licenses after offboarding [16]
- Removing a user from all organizations is **not sufficient** for enterprises with personal accounts if the unaffiliated users policy is enabled — the user remains in the enterprise as unaffiliated [16]

### Outside Collaborators

#### Definition and License Impact

Outside collaborators are people who have access to one or more org repositories but are not org members [8]. Key characteristics:

- Each outside collaborator with access to private or internal repos **consumes a license** [9]
- Pending invitations to outside collaborators also consume licenses [9]
- They are listed in the enterprise People tab under "Outside collaborators" [9]
- They are **not required to use SAML SSO** to access org resources (for personal-account enterprises) [17]
- If the org requires 2FA, outside collaborators must enable 2FA before accepting invitations [17]
- Outside collaborators **cannot be added to teams** — team membership is restricted to org members [17]

#### EMU: Repository Collaborators

In EMU enterprises, the outside collaborator role is called **repository collaborator** [8]:
- Must be part of the enterprise with a managed user account provisioned from the IdP
- If they don't already consume a license, they will after being granted repo access
- Cannot bypass SSO (managed at enterprise level)
- Subject to enterprise IP allow list and IdP Conditional Access Policy
- **Not** subject to org-level IP allow list

#### Enterprise-Level Management

Enterprise owners can view all outside collaborators in the enterprise People tab [9]. However, for personal-account enterprises, outside collaborators **cannot be removed via enterprise settings** — they must be removed from each repository individually by an org owner [15].

Enterprise owners can **restrict who can invite outside collaborators** via repository management policies [17].

### Credential Management

#### Personal Access Token (PAT) Policies

Enterprise owners can enforce PAT policies independently for fine-grained and classic tokens [5]:

**Access restriction options:**
- **Allow organizations to configure** (default) — each org decides
- **Restrict access** — PATs cannot access enterprise orgs (SSH keys still work). Orgs cannot override.
- **Allow access** — PATs can access enterprise orgs. Orgs cannot override.

**Maximum lifetime policies [5]:**
- Can be set independently for fine-grained and classic tokens
- Fine-grained tokens default to max 366 days
- Classic tokens have no default expiration requirement
- Non-compliant tokens are **blocked at usage time** (not revoked)
- **Exempt administrators** option available (recommended if using SCIM or automation that hasn't migrated to GitHub Apps)
- EMU enterprises: policies apply to user namespaces as well since the enterprise owns user accounts

**Approval policy for fine-grained PATs [5]:**
- **Allow organizations to configure** (default)
- **Require approval** — all orgs must approve each fine-grained PAT
- **Disable approval** — fine-grained PATs work without prior approval

**Important for EMU + SCIM:** The SCIM token must be a PAT (classic) with `scim:enterprise` scope. If you enforce PAT lifetime restrictions, you should **exempt administrators** to avoid breaking SCIM provisioning [5][12].

#### SSH Key and Certificate Management

Enterprise owners can manage SSH access via [6]:

**SSH Certificate Authorities (CAs):**
- Enterprise owners can add SSH CAs under Settings → Authentication security
- When an SSH CA is added, members can use SSH certificates issued by the CA to access org repos
- Enterprise owners can **require SSH certificates** — users cannot authenticate with unsigned SSH keys or HTTPS
- For EMU enterprises, SSH CAs can be configured to allow access to user-owned (namespace) repositories
- CAs uploaded before March 27, 2024 allow non-expiring certificates; newer CAs require expiration
- Enterprise owners can **upgrade** older CAs to reject non-expiring certificates

**Credential audit via SAML identity panel:**
- Enterprise owners can view each member's authorized PATs and SSH keys via People → [user] → SAML identity linked [6]
- Only the last several characters of each token/key are visible
- Credentials can be **revoked** individually (revokes SAML authorization; does not delete the underlying token/key) [6]

**For EMU hard-deprovisioning:** PATs, SSH keys, and GPG keys are **deleted** (not just revoked) [4]. This can affect commit signature verification.

#### 2FA Enforcement

Enterprise owners can require 2FA for all org members, billing managers, and outside collaborators [6]:
- Outside collaborators without 2FA are **removed from the org** and lose access to repo forks
- They can reinstate access within 3 months if they enable 2FA
- Option to require **secure 2FA methods only** (passkeys, security keys, authenticator apps, GitHub Mobile)
- This policy is **not available** for EMU enterprises (authentication is handled by the IdP)

## What to Cover in Workshop (L300)

### Must-Cover Topics (P0)

1. **Enterprise role hierarchy deep-dive** — Demonstrate that enterprise owners do NOT automatically have org access. Show how to join an org and the implications. Walk through custom enterprise roles.
2. **EMU vs. personal accounts decision matrix** — When to choose which, migration considerations, and the impact on collaboration boundaries (EMU users cannot contribute to public repos).
3. **SCIM provisioning walkthrough** — Show the actual SCIM API endpoints, demonstrate user provisioning with `POST /scim/v2/enterprises/{enterprise}/Users`, explain rate limits (1,000 users/hour), and the critical importance of single-source-of-truth for write operations.
4. **Dormant user identification and analysis** — Generate and analyze the dormant users report. Critically: explain that PAT/SSH/GitHub App access and private repo Git operations do NOT count as activity. This is the #1 misconception.
5. **License reclamation workflow** — End-to-end: download dormant report → cross-reference with IdP → remove/suspend users → verify license count. Show both UI and API approaches.
6. **Soft vs. hard deprovisioning** — Detailed comparison with audit log events. Emphasize that hard-deprovision is **irreversible** and deletes keys/tokens/repos.
7. **PAT governance** — Configure enterprise PAT policies (access restriction, lifetime, approval). Demonstrate the admin exemption for SCIM tokens.

### Should-Cover Topics (P1)

8. **Outside collaborator management** — License impact, 2FA implications, the inability to remove via enterprise settings
9. **SSH CA management** — Adding a CA, requiring SSH certificates, upgrading legacy CAs
10. **SAML credential audit** — Viewing and revoking authorized PATs/SSH keys per user
11. **Membership export and reporting** — CSV export, GraphQL API for programmatic access
12. **Guest collaborator configuration** — Entra ID manifest update, Okta profile editor changes, role assignment

## Workshop Exercise Ideas

### Exercise 1: Dormant User Audit & License Optimization (45 min)

**Objective:** Identify dormant users and create a license reclamation plan.

**Steps:**
1. Navigate to the enterprise Compliance tab and generate a new dormant users report
2. Download and analyze the CSV — identify users dormant > 90 days
3. Cross-reference dormant users with the membership export CSV to identify their org roles
4. Use the GraphQL API to query enterprise members:
   ```graphql
   query {
     enterprise(slug: "YOUR-ENTERPRISE") {
       members(first: 100) {
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
5. Draft a reclamation plan: which users to remove, which to contact first, which to leave alone (e.g., service accounts using PATs)
6. For a test user: execute removal via the `removeEnterpriseMember` GraphQL mutation
7. Verify the license count decreased

### Exercise 2: EMU SCIM Provisioning & Deprovisioning Lifecycle (30 min)

**Objective:** Understand the full SCIM lifecycle for a managed user.

**Steps:**
1. Review the SCIM provisioning flow diagram (IdP → SCIM API → GitHub user)
2. Examine a sample `POST /scim/v2/enterprises/{enterprise}/Users` request payload
3. Simulate a soft-deprovision by setting `active: false` via `PATCH`
4. Review the audit log events generated (`user.suspend`, `external_identity.deprovision`)
5. Simulate reprovisioning by setting `active: true`
6. Discuss: when would you use hard-deprovision (`DELETE`) vs. soft-deprovision?
7. Review the username obfuscation behavior and its impact on Git history

### Exercise 3: Enterprise Credential Governance Policy (30 min)

**Objective:** Configure and verify enterprise-wide credential policies.

**Steps:**
1. Navigate to enterprise Policies → Personal access tokens
2. Configure a maximum lifetime of 90 days for fine-grained PATs
3. Restrict classic PAT access to the enterprise
4. Enable approval requirement for fine-grained PATs
5. Exempt enterprise administrators (discuss why: SCIM token requirement)
6. Navigate to Settings → Authentication security and add an SSH CA
7. Enable "Require SSH Certificates" and discuss the impact on HTTPS-based workflows
8. View a member's SAML identity panel and review their authorized credentials
9. Practice revoking a specific credential's SAML authorization

## Sources

1. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise — Managing users in your enterprise (overview)
2. https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/understanding-iam-for-enterprises/about-enterprise-managed-users — About Enterprise Managed Users
3. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/managing-dormant-users — Managing dormant users
4. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/provisioning-user-accounts-with-scim/deprovisioning-and-reinstating-users — Deprovisioning and reinstating users with SCIM
5. https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-personal-access-tokens-in-your-enterprise — Enforcing policies for PATs
6. https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-security-settings-in-your-enterprise — Enforcing security settings policies
7. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/roles-in-an-enterprise — Roles in an enterprise
8. https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization — Roles in an organization
9. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise — Viewing people in your enterprise
10. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/exporting-membership-information-for-your-enterprise — Exporting membership information
11. https://docs.github.com/en/enterprise-cloud@latest/graphql/reference/mutations#removeenterprisemember — GraphQL removeEnterpriseMember mutation
12. https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/provisioning-user-accounts-for-enterprise-managed-users/provisioning-users-with-scim-using-the-rest-api — Provisioning users with SCIM using the REST API
13. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/enabling-guest-collaborators — Enabling guest collaborators
14. https://docs.github.com/en/enterprise-cloud@latest/billing/managing-your-license-for-github-enterprise/about-licenses-for-github-enterprise — About licenses for GitHub Enterprise
15. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/removing-a-member-from-your-enterprise — Removing a member from your enterprise
16. https://docs.github.com/en/enterprise-cloud@latest/admin/concepts/identity-and-access-management/user-offboarding — User offboarding
17. https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-user-access-to-your-organizations-repositories/managing-outside-collaborators/adding-outside-collaborators-to-repositories-in-your-organization — Adding outside collaborators
18. https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-and-managing-a-users-saml-access-to-your-enterprise — Viewing and managing SAML access
