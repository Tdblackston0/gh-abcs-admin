# Research Brief: User Privacy & Data Residency

> **VBD Agenda Items:** 1.6 (User privacy)
> **Priority:** P1
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

GitHub Enterprise Cloud provides a comprehensive set of privacy controls, data residency options, and compliance certifications designed for organizations with strict regulatory requirements. Since the launch of GitHub Enterprise Cloud with data residency, enterprises can now choose where their code and data are stored — with the EU, Australia, US, and Japan available as hosting regions [1]. This represents a significant shift for organizations that previously had to choose between GitHub's cloud platform and self-hosting GitHub Enterprise Server to meet data sovereignty mandates.

GitHub processes personal data in compliance with the GDPR, the EU-U.S. Data Privacy Framework (DPF), and the Swiss-U.S. DPF, with GitHub B.V. (Netherlands) serving as the Data Controller for EEA/UK users [2]. Enterprise accounts benefit from a Data Protection Agreement (DPA) that governs how GitHub acts as a Data Processor on behalf of the organization, which is the Data Controller for its users' data [2]. The platform provides enterprise owners with granular audit logging, IP address disclosure controls, audit log streaming to external SIEM systems, and membership export capabilities — all critical for demonstrating compliance and responding to data subject requests.

For L300 workshop attendees, the key takeaway is that GitHub's privacy architecture operates at three distinct tiers: (1) platform-level privacy commitments governed by GitHub's Privacy Statement and DPA, (2) enterprise-level controls that admins configure (data residency region, IP disclosure, audit streaming, repository policies), and (3) user-level settings that individual developers manage (profile visibility, cookie preferences, 2FA). Understanding how these tiers interact — especially in Enterprise Managed Users (EMU) environments where the organization controls user accounts — is essential for architects designing compliant GitHub deployments.

## Key Concepts

### Data Residency

**Current Availability:**
GitHub Enterprise Cloud with data residency is available in four regions [1]:
- **EU** (European Union)
- **Australia**
- **US** (United States)
- **Japan**

GitHub plans to offer data residency in additional regions in the future [1].

**How It Works:**
Enterprises with data residency are hosted on a dedicated subdomain of **GHE.com** (e.g., `octocorp.ghe.com`), separate from the main GitHub.com platform [1]. This deployment model uses **Enterprise Managed Users** exclusively — user accounts are provisioned via SCIM and authenticated via SAML or OIDC through the organization's identity provider [1].

**What Data Stays In-Region:**
The following data is stored within the chosen region [3]:
- **Customer content:** Repositories (name and source code), user-generated content (PRs, comments, file paths, raw URLs), structured/blob storage
- **Organization-identifying data:** GitHub Actions data and logs, business continuity and disaster recovery (BCDR) data
- **Person-identifying data:** Email addresses, usernames, first/last names, IP addresses

**What Data May Be Stored Outside the Region:**
Some data may be stored outside the chosen region [3]:
- **Pseudonymized telemetry/logs:** User IDs, GUIDs, unsalted hashes (that alone do not identify a person without additional information)
- **Billing and plan administration data:** Contact info, billing/purchase/payment/license information
- **Support and feedback data:** Support requests, case notes, phone conversations, chat sessions
- **GitHub Copilot data:** Data and logs for GitHub Copilot usage
- **Secret scanning data:** Validity checks and extended metadata checks (if enabled)

**Data Transfers:**
GitHub documents reasons for data transfers out of the enterprise's region but does not send notifications when transfers occur. TLS certificate information for the enterprise's GHE.com subdomain is sent to certificate authorities (CAs) and the certificate transparency (CT) ecosystem, some of which may be outside the enterprise's region [3].

**Key Limitations:**
- Public repositories are not available in EMU enterprises; only internal and private repositories are supported [1]
- API requests must target the enterprise's dedicated GHE.com URL (e.g., `api.octocorp.ghe.com`) [1]
- Some GitHub Copilot features may be unavailable on GHE.com [1]
- Managed user accounts cannot interact with resources outside their enterprise [1]

### GDPR & Data Processing

**GitHub's GDPR Stance:**
GitHub processes personal data in compliance with the GDPR, ensuring a lawful basis for each processing activity. The lawful bases include [2]:
- **Contractual Necessity:** Processing required to fulfill GitHub Terms of Service
- **Legal Obligation:** Processing necessary to comply with applicable laws
- **Legitimate Interests:** Processing for securing services, communication, and improvement (only when not overridden by data protection rights)
- **Consent:** Processing when the user has explicitly consented

**Data Controller vs. Data Processor:**
- When an organization provides a GitHub account to an employee/student, the **organization is the Data Controller** and GitHub is the **Data Processor** [2]
- GitHub functions as Data Controller only for specific processing activities clearly defined in the Data Protection Agreement [2]
- The standard Data Protection Agreement is available at [github.com/customer-terms/github-data-protection-agreement](https://github.com/customer-terms/github-data-protection-agreement) [2]

**Data Subject Rights (GDPR):**
Users have the following rights under GDPR [2]:
- Right to access data collected about them
- Right to rectify or update inaccurate/incomplete personal data
- Right to erase or limit processing under specific conditions
- Right to object to processing
- Right to withdraw consent
- Right to data portability (receive data in structured, machine-readable format)

To exercise these rights, users contact `privacy@github.com`. The Data Protection Officer is reachable at `dpo@github.com` [2].

**Data Subject Requests (DSR) for Data Residency Enterprises:**
If GitHub receives a DSR from a managed user pertaining to a data residency enterprise, GitHub redirects the data subject to the enterprise (the Data Controller). GitHub cooperates with the enterprise and provides necessary means to respond [3].

**International Data Transfers:**
GitHub relies on Standard Contractual Clauses (SCCs) published by the European Commission for transfers to countries without an adequacy decision [2]. GitHub also participates in the EU-U.S. Data Privacy Framework, the UK Extension, and the Swiss-U.S. DPF, certified with the U.S. Department of Commerce [2].

**GitHub Entities:**
- **GitHub, Inc.** — 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, United States [2]
- **GitHub B.V.** — Prins Bernhardplein 200, Amsterdam 1097JB, The Netherlands [2]

### Data Export Capabilities

**Enterprise Membership CSV Export:**
Enterprise owners can export aggregated membership information as a CSV report [4]:
- Username and display name
- Two-factor authentication status and 2FA configuration security level
- Whether the user is an organization owner or member
- Pending invitations
- Optionally: verified domain email addresses, SAML NameID, GitHub Enterprise Server usernames (if GitHub Connect is configured), Visual Studio subscription info

Export method: Navigate to Enterprise → People → "CSV Report" button. Enterprises with <1,000 members get an immediate download; ≥1,000 members receive an email with a download link [4].

**Audit Log Export:**
Enterprise owners can export audit log data in **JSON** or **CSV** format [5]:
- Covers events from the last **180 days** (Git events retained for 7 days)
- Supports filtered exports using search qualifiers
- Export key fields include: `action`, `actor`, `user`, `actor_location.country_code`, `org`, `repo`, `created_at`, `data.email`
- Git events can be exported separately as compressed JSON, filtered by date range

**Audit Log API:**
The REST API and GraphQL API can be used to programmatically retrieve audit log events [6]:
- REST API: Enterprise audit log endpoints
- GraphQL API: Enterprise audit log queries
- Webhooks: Real-time event notification alternative

**Audit Log Streaming:**
For continuous export, audit logs can be streamed to external data management systems [7]:
- **Supported destinations:** Amazon S3, Azure Blob Storage, Azure Event Hubs, Datadog, Google Cloud Storage, Splunk
- Streams export **both audit events and Git events** across the entire enterprise
- Streamed as compressed JSON files (`YYYY/MM/HH/MM/<uuid>.json.gz`)
- Supports **multiple endpoints** simultaneously (public preview)
- Uses at-least-once delivery (some events may be duplicated)
- Paused streams retain a buffer for 7 days; streams paused >3 weeks restart from current timestamp
- Authentication options include access keys and OpenID Connect (OIDC) for AWS S3
- Health checks run every 24 hours; misconfigured streams must be fixed within 6 days

**Organization Membership Export:**
Organization owners can also export membership information for individual organizations [4].

**Dormant Users Report:**
Enterprise owners can download a dormant users report from the Compliance section, identifying users inactive for 30+ days [8].

### IP & Access Logging

**Audit Log IP Address Disclosure:**
By default, GitHub **does not display** source IP addresses in audit log events [9]. Enterprise owners can opt in:
- Navigate to Enterprise → Settings → Audit log → Settings tab → "Enable source IP disclosure" [9]
- Once enabled, IP addresses appear for **new and existing events** in both enterprise and organization audit logs [9]
- Enterprise owners are responsible for meeting legal obligations related to viewing/storing IP addresses [9]

**What Events Include IP Addresses:**
IP addresses are shown when a member interacts with enterprise-owned resources (internal/private repositories, associated issues, PRs, actions, projects) [9]. IPs are **not** displayed for:
- Authentication to GitHub.com (for non-EMU enterprises)
- Interactions with personal account resources
- Interactions with public repositories
- `api.request` events without repository context
- Events where the actor differs from the person who performed the action
- Bot or automated system actions [9]

**SAML Session & Credential Management:**
Enterprise owners can view and revoke per-user [10]:
- **Linked SAML identities** (SSO identity linked to a GitHub account)
- **Active SAML sessions** (browser sessions)
- **Authorized credentials** (personal access tokens and SSH keys authorized for SAML-protected resources)

Only the last several characters of tokens/keys are visible. Revoking a credential removes the SAML authorization but does not delete the underlying token or SSH key [10].

**Audit Log Event Details:**
Each audit log entry includes [6]:
- Enterprise/organization where the action occurred
- The actor (user) who performed the action
- The affected user
- Repository context
- Country where the action took place
- Date and time
- SAML SSO and SCIM identity of the actor
- Authentication method (for non-web-UI actions)
- Optionally, source IP address (if enabled)

### Compliance Certifications

**SOC 2 Type II:**
GitHub maintains SOC 2 Type II compliance, audited annually. SOC 2 reports cover security, availability, processing integrity, confidentiality, and privacy trust service criteria. Reports are available under NDA from GitHub's sales team or through the GitHub Trust Center [11].

**ISO/IEC 27001:**
GitHub is certified under ISO/IEC 27001, the international standard for information security management systems (ISMS). This certification covers GitHub's information security policies, risk assessment processes, and security controls [11].

**FedRAMP:**
GitHub holds a FedRAMP Authorization (Tailored LI-SaaS) for GitHub Enterprise Cloud, enabling use by U.S. federal agencies [11].

**EU-U.S. Data Privacy Framework (DPF):**
GitHub has certified with the U.S. Department of Commerce under the EU-U.S. DPF, the UK Extension to the EU-U.S. DPF, and the Swiss-U.S. DPF. GitHub is subject to FTC enforcement jurisdiction [2].

**Additional Frameworks:**
GitHub's compliance program also covers:
- CSA STAR (Cloud Security Alliance)
- PCI DSS (for payment processing)
- GDPR compliance (as both Data Controller and Data Processor)

**Accessing Compliance Reports:**
Enterprise customers can request compliance reports through their GitHub account team or via the [GitHub Trust Center](https://github.com/security) [11].

### Enterprise Privacy Controls

**Repository Management Policies (Enterprise Level):**
Enterprise owners can enforce the following privacy-related policies across all organizations [12]:
- **Base repository permissions:** Set default access level (none, read, write, admin) for all org members
- **Repository creation restrictions:** Control who can create repos and which types (public, private, internal); block creation of user namespace repos for EMU enterprises
- **Repository visibility changes:** Restrict who can change visibility (members with admin access, org owners, or enterprise owners only)
- **Forking of private/internal repositories:** Allow or disallow forking, including restricting fork destinations
- **Outside collaborators:** Control who can invite external collaborators (members, org owners, or enterprise owners)
- **Repository deletion and transfer:** Restrict to org owners or allow members with admin permissions
- **Deploy keys:** Allow or restrict creation of deploy keys
- **Default branch naming:** Enforce a default branch name across all organizations

**Enterprise Managed Users (EMU) Controls:**
In EMU environments, the enterprise has additional privacy controls [1]:
- User accounts are fully managed by the organization's IdP
- Users can only interact with enterprise resources (complete isolation from public GitHub.com)
- No public repositories — only internal and private
- Enterprise owners can block user namespace repository creation
- User provisioning and deprovisioning controlled via SCIM

**Organization-Level Security Settings:**
Organization owners can manage [13]:
- Security configurations applied to repositories at scale
- Dependabot access to private/internal dependencies
- GitHub Advanced Security feature enablement (secret scanning, code scanning)
- Access controls for GitHub Advanced Security features per repository

**Audit & Compliance Settings:**
- IP address disclosure in audit logs (opt-in per enterprise or per organization) [9]
- Audit log streaming to external SIEM/analytics platforms [7]
- Dormant user reports from the Compliance section [8]

**Cookie & Tracking Controls:**
GitHub provides cookie consent mechanisms [14]:
- Essential cookies only by default in applicable jurisdictions
- Non-essential cookie consent banners
- Respect for Do Not Track (DNT) signals
- Global Privacy Control (GPC) support — GitHub does not share/sell data when GPC is detected
- Cookie settings management link in page footers on enterprise marketing pages

### GitHub Subprocessors

GitHub maintains a public list of authorized subprocessors [15]. Key third-party subprocessors include:

| Subprocessor | Processing Description | Location |
|---|---|---|
| Amazon Web Services (AWS) | Cloud hosted infrastructure, data hosting, AI inference | United States |
| Microsoft (Azure) | Cloud hosted infrastructure, data hosting, AI inference | United States, Canada |
| Google Cloud Platform (GCP) | Cloud hosted infrastructure, AI inference | United States, Belgium, Singapore |
| Cloudflare | Content delivery service | United States |
| Fastly | Content delivery service | United States |
| Elasticsearch, Inc. | Cloud hosted infrastructure | United States |
| OpenAI | AI inference and AI services | United States |
| Anthropic PBC | AI inference and AI services | United States |
| xAI | AI inference and AI services | United States |
| Fireworks AI | AI inference and AI services | US, Iceland, Germany |
| Zendesk | Customer support ticketing | United States |
| Twilio (SendGrid) | SMS for 2FA | United States |
| NexMo/Vonage | SMS for 2FA | United States |
| FullStory, Inc. | Customer support ticketing analysis | United States |
| Oracle America, Inc. | Cloud hosted infrastructure | United States |

**GitHub Subsidiaries acting as subprocessors [15]:**
- GitHub Australia Pty Ltd (Australia)
- GitHub BV (Netherlands)
- GitHub Canada ULC (Canada)
- GitHub Germany GmbH (Germany)
- GitHub India Pty Ltd (India)
- npm Inc (United States)
- Semmle Inc (United States)

**Subprocessor Change Notification:**
GitHub publishes the names of any new subprocessors at least **30 days in advance** of authorization. Users can subscribe to notifications about subprocessor list updates [15].

### Personal Data GitHub Stores

**Directly Provided [2]:**
- Account data: GitHub handle, name, email address, password, payment/transaction info
- User content and files: Code, inputs, text, documents, images, feedback
- Profile information: Photo, additional emails, job title, biography
- Demographic information (optional): Ethnicity, gender
- Payment information: Name, billing address, payment details
- Support data: Code, text, multimedia files from support requests

**Automatically Collected [2]:**
- Service usage information: IP address, device info, session details, request timestamps, device type/ID, OS and app version, contribution-related info
- Website usage data: Referring site, visit timestamps, pages viewed, links clicked
- Geolocation information: Regional geolocation (inferred from IP)
- Cookie data: Session management, authentication, preferences (see Cookies section)

**From Third Parties [2]:**
- Information shared by other users (issues, comments mentioning you)
- Publicly available sources (public GitHub repositories)
- Linked third-party services (Google auth, etc.)
- Vendors, partners, and affiliates

**Data Retention:**
GitHub retains personal data as long as the account is active and as needed for contractual obligations, legal compliance, dispute resolution, and agreement enforcement [2].

**Private Repository Access:**
GitHub personnel do not access private repository information without consent except for: security purposes, automated/manual vulnerability scanning, support requests, maintaining service integrity, or legal compliance. GitHub provides notice of private repository access unless prohibited by law [2].

## What to Cover in Workshop (L300)

### Must-Cover Topics
1. **Data Residency Architecture:** Explain the GHE.com model, available regions (EU, AU, US, JP), what stays in-region vs. what doesn't, and how this differs from standard GitHub.com hosting. Walk through the data storage boundaries table from [3].
2. **DPA and GDPR Compliance Flow:** Diagram the Data Controller (customer) → Data Processor (GitHub) relationship. Explain how DSRs flow through the system, especially in EMU environments.
3. **Audit Log Deep Dive:** Demonstrate enabling IP disclosure, exporting audit logs (JSON/CSV), and configuring audit log streaming to Azure Event Hubs or Splunk. Show the audit log API.
4. **Enterprise Privacy Policy Enforcement:** Walk through Enterprise → Policies → Member Privileges and demonstrate enforcing repository visibility, forking, and outside collaborator policies.
5. **Subprocessor Awareness:** Review the subprocessor list and explain implications for customers with strict data processing chain requirements.

### Advanced Topics (L300)
6. **Comparing Data Residency vs. GHES:** When should a customer choose GHE.com data residency over self-hosted GHES? Decision matrix based on compliance, feature availability, and operational overhead.
7. **Audit Log Streaming Architecture:** Design a production audit log pipeline using streaming to Azure Event Hubs → Azure Sentinel for security analytics.
8. **EMU Privacy Implications:** How managed user accounts change the privacy equation — the enterprise controls everything, users have no personal account access on the platform.
9. **Compliance Documentation Requests:** How to obtain SOC 2 Type II reports, ISO 27001 certificates, and FedRAMP authorization packages.

### Topics to Flag but Not Deep-Dive
10. **GitHub Copilot Data Processing:** Note that Copilot data may be stored outside the data residency region; point attendees to Copilot-specific privacy documentation.
11. **Cookie Compliance:** Briefly mention GitHub's cookie consent framework and GPC support.

## Workshop Exercise Ideas

### Exercise 1: Data Residency Decision Matrix
**Duration:** 20 minutes
**Scenario:** Present attendees with three fictional customer profiles (EU financial services company, Australian government agency, US healthcare startup) each with different regulatory requirements. Have them map each customer to the appropriate GitHub deployment model (GitHub.com, GHE.com with data residency in specific region, or GHES) and justify their recommendation by referencing the data storage boundaries from [3]. Attendees should identify which data stays in-region and flag data categories that may leave the region.

### Exercise 2: Audit Log Streaming & SIEM Integration
**Duration:** 30 minutes
**Hands-on lab:** Configure audit log streaming from a GitHub Enterprise Cloud trial to an Azure Blob Storage account or Splunk HEC endpoint. Then:
1. Enable IP address disclosure in the enterprise audit log
2. Configure a streaming endpoint (Azure Blob Storage with SAS token)
3. Trigger several auditable events (create repo, change visibility, add outside collaborator)
4. Query the streamed data in the destination to find the events, verify IP addresses are present
5. Discuss: How would you build alerting for suspicious activity (e.g., repository visibility changed from private to internal)?

### Exercise 3: GDPR Data Subject Request Simulation
**Duration:** 25 minutes
**Scenario:** A developer who recently left the company submits a GDPR Article 17 (Right to Erasure) request. Walk through the process:
1. Identify all data associated with the user via the Enterprise → People panel and SAML identity view
2. Export the membership CSV report to document the user's access history
3. Review audit log entries for the user's activity
4. Revoke the user's SAML sessions and authorized credentials
5. Deprovision the user via SCIM (EMU) or remove from enterprise
6. Document what data GitHub retains (and why — legal obligations, service integrity) vs. what is deleted
7. Discuss: What is the enterprise's responsibility vs. GitHub's? Reference the DSR flow from [3].

## Sources

1. GitHub Docs — "About GitHub Enterprise Cloud with data residency"
   https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency

2. GitHub — "GitHub General Privacy Statement" (Effective February 1, 2024)
   https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

3. GitHub Docs — "About storage of your data with data residency"
   https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-storage-of-your-data-with-data-residency

4. GitHub Docs — "Exporting membership information for your enterprise"
   https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/exporting-membership-information-for-your-enterprise

5. GitHub Docs — "Exporting audit log activity for your enterprise"
   https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/exporting-audit-log-activity-for-your-enterprise

6. GitHub Docs — "About the audit log for your enterprise"
   https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/about-the-audit-log-for-your-enterprise

7. GitHub Docs — "Streaming the audit log for your enterprise"
   https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise

8. GitHub Docs — "Managing dormant users"
   https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/managing-dormant-users

9. GitHub Docs — "Displaying IP addresses in the audit log for your enterprise"
   https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/displaying-ip-addresses-in-the-audit-log-for-your-enterprise

10. GitHub Docs — "Viewing and managing a user's SAML access to your enterprise"
    https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-and-managing-a-users-saml-access-to-your-enterprise

11. GitHub Security — Trust Center
    https://github.com/security

12. GitHub Docs — "Enforcing repository management policies in your enterprise"
    https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise

13. GitHub Docs — "Managing security and analysis settings for your organization"
    https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-security-and-analysis-settings-for-your-organization

14. GitHub Docs — "GitHub Cookies"
    https://docs.github.com/en/site-policy/privacy-policies/github-cookies

15. GitHub Docs — "GitHub Subprocessors"
    https://docs.github.com/en/site-policy/privacy-policies/github-subprocessors

16. GitHub — "Data Protection Agreement"
    https://github.com/customer-terms/github-data-protection-agreement

17. GitHub Docs — "GitHub Enterprise Cloud with data residency (category page)"
    https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency

18. EU-U.S. Data Privacy Framework
    https://www.dataprivacyframework.gov/
