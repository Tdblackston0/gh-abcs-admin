# Research Brief: Audit Log Deep Dive

> **VBD Agenda Items:** 2.3 (Audit account activities)
> **Priority:** P0
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

GitHub Enterprise Cloud provides comprehensive audit logging at both the **enterprise** and **organization** levels, capturing events related to settings changes, access control, user membership, app permissions, repository management, and much more. The audit log is a critical compliance and security tool for enterprise administrators, offering a 180-day retention window in the UI/API for web events and a 7-day retention window for Git events (push, clone, fetch) [1][2][6].

For long-term retention and real-time monitoring, GitHub supports **audit log streaming** to external SIEM and data management platforms including Splunk, Azure Event Hubs, Azure Blob Storage, Amazon S3, Google Cloud Storage, and Datadog [3]. This streaming delivers both audit and Git events as compressed JSON files, enabling enterprises to retain data indefinitely and set up alerts. The REST API and GraphQL API both provide programmatic access to audit log data, with the REST API supporting cursor-based pagination at 1,750 queries/hour rate limits [4][5].

Enterprises adopting **GitHub Enterprise Cloud with data residency** (GHE.com) use dedicated subdomains, meaning API endpoints for audit log access shift to `api.SUBDOMAIN.ghe.com` [15]. All audit log features — streaming, API access, and UI search — remain available on GHE.com, though data is stored in the chosen region (EU, Australia, US, or Japan) [15].

## Key Concepts

### Audit Log Scope & Retention

**Enterprise vs. Organization Audit Logs:**
- The **enterprise audit log** aggregates actions from all organizations owned by the enterprise account. It includes enterprise-level settings changes (`business.*` events), organization membership, repository management, billing, and security events across the entire enterprise [1].
- The **organization audit log** captures events scoped to that specific organization, such as repository changes, team management, webhook configuration, and member access [7].
- With **Enterprise Managed Users (EMU)**, the enterprise audit log also includes user-level events (security log events) that are not included for non-EMU enterprises [8].

**Retention Periods:**
- **Web events (non-Git):** Retained for **180 days** in the UI and API. By default, only the past 3 months are displayed; use the `created` parameter to query older events within the 180-day window [2][6].
- **Git events:** Retained for **7 days** only. These include push, clone, and fetch operations and are only available via API (with `include=git`), export, or streaming — they are **not** included in UI search results [2][6][9].
- **Streaming:** Enables indefinite retention by exporting data to your own storage/SIEM [3].

**Key Retention Recommendation for L300:** Always set up audit log streaming for Git events since the 7-day window is extremely short. For web events, 180 days may be insufficient for many compliance frameworks (SOC 2, HIPAA, etc.), making streaming essential [3].

**IP Address Disclosure:**
- By default, source IP addresses are **not displayed** in audit log events [10].
- Enterprise owners can enable IP address disclosure, which surfaces IPs for both new and existing events across the enterprise and all child organizations [10].
- When using EMU, IP addresses are only shown for interactions with enterprise-owned resources (private/internal repos), not for personal account activity [10].
- `api.request` events without repository context do not include IP addresses [10].

### Audit Log Streaming

**Supported Streaming Endpoints** [3]:
| Provider | Authentication | Notes |
|---|---|---|
| **Amazon S3** | Access keys or OIDC | Supports CloudTrail Lake integration |
| **Azure Blob Storage** | SAS token | Not supported in Azure Government |
| **Azure Event Hubs** | Shared access policy / Connection string | Not supported in Azure Government; ideal for Sentinel integration |
| **Splunk** | HEC token (HTTP Event Collector) | Validates via `<domain>:port/services/collector` |
| **Google Cloud Storage** | Service account JSON key | Requires Storage Object Creator role |
| **Datadog** | API key or client token | Filter by `github.audit.streaming` in Datadog Logs |
| **HTTPS Event Collector** | HEC token | Generic HEC-compatible endpoint |

**Stream Data Format:**
- All streamed audit logs are sent as **compressed JSON files** [3].
- Filename format: `YYYY/MM/HH/MM/<uuid>.json.gz` [3].
- GitHub uses **at-least-once delivery** — some events may be duplicated due to network or system issues [3].

**Stream Buffering & Continuity:**
- If you **pause** a stream, it retains a buffer for **7 days** with no data loss [3].
- If paused for more than 7 days, it resumes from 1 week prior to the current time [3].
- If paused for **3+ weeks**, the stream resets and starts from the current timestamp [3].
- **Datadog exception:** Datadog only accepts logs from up to 18 hours in the past. Pausing a Datadog stream for >18 hours risks data loss [3].

**Multiple Endpoints (Public Preview):**
- You can stream audit logs to **multiple endpoints** simultaneously — e.g., two endpoints of the same type or two different providers [3].

**Health Checks:**
- Every 24 hours, GitHub runs a health check on each stream [3].
- If misconfigured, enterprise owners receive an email notification [3].
- A misconfigured stream must be fixed within **6 days** to avoid events being dropped [3].

**API Request Event Streaming:**
- Enterprise owners can opt-in to stream `api.request` events [3][8].
- This must be explicitly enabled under Audit log → Settings → "Enable API Request Events" [3].
- Only security-relevant API endpoints are included [3].

**Setup Process (General Pattern):**
1. Configure the target endpoint (create S3 bucket, Event Hub, Splunk HEC, etc.)
2. Navigate to Enterprise → Settings → Audit log → Log streaming
3. Select "Configure stream" → Choose provider
4. Enter provider-specific credentials
5. Click "Check endpoint" to verify connectivity
6. Click "Save" [3]

### Audit Log API

**REST API** [4][5]:

| Aspect | Detail |
|---|---|
| **Endpoint** | `GET /enterprises/{enterprise}/audit-log` |
| **Rate limit** | 1,750 queries per hour per user+IP combination |
| **Authentication** | PAT with `read:audit_log` scope, or fine-grained token with "Enterprise administration" read permission |
| **Pagination** | Cursor-based (`after`/`before` parameters) via Link headers |
| **Filtering** | `phrase` query parameter using same syntax as UI search |
| **Include parameter** | `web` (default), `git`, or `all` |
| **Max per_page** | 100 results |
| **Order** | `desc` (default) or `asc` |

**Example REST API Queries:**

```bash
# Get recent audit events
curl -H "Authorization: Bearer TOKEN" \
  "https://api.github.com/enterprises/ENTERPRISE/audit-log?per_page=100"

# Get Git events (push/clone/fetch)
curl -H "Authorization: Bearer TOKEN" \
  "https://api.github.com/enterprises/ENTERPRISE/audit-log?include=git"

# Filter by action and date
curl -H "Authorization: Bearer TOKEN" \
  "https://api.github.com/enterprises/ENTERPRISE/audit-log?phrase=action:repo.create+created:>=2025-01-01"

# Filter by actor
curl -H "Authorization: Bearer TOKEN" \
  "https://api.github.com/enterprises/ENTERPRISE/audit-log?phrase=actor:octocat"
```

**Streaming Configuration API** [4]:

```bash
# List configured streams
GET /enterprises/{enterprise}/audit-log/streams

# Get stream encryption key
GET /enterprises/{enterprise}/audit-log/stream-key

# Create a new stream
POST /enterprises/{enterprise}/audit-log/streams

# Update an existing stream
PUT /enterprises/{enterprise}/audit-log/streams/{stream_id}

# Delete a stream
DELETE /enterprises/{enterprise}/audit-log/streams/{stream_id}
```

**GraphQL API** [5][12]:

The GraphQL API supports querying organization-level audit logs with rich filtering. GraphQL responses can include data for up to **90-120 days** [12].

```graphql
{
  organization(login: "my-org") {
    auditLog(last: 25, query: "actor:octocat") {
      edges {
        node {
          ... on AuditEntry {
            action
            actorLogin
            createdAt
            user {
              name
              email
            }
          }
        }
      }
    }
  }
}
```

**Token Identification:**
- Each audit log entry includes `hashed_token`, `programmatic_access_type`, and `token_scopes` fields [11].
- You can search for events by a specific token using its SHA-256 hash: `hashed_token:"VALUE"` [11].
- This is critical for incident response when a token is compromised [11].

### Event Categories

**Enterprise-Level Event Categories** (selected key categories) [8][9]:

| Category | Description | Example Events |
|---|---|---|
| `business` | Enterprise settings and administration | `business.add_admin`, `business.add_organization`, `business.enable_saml`, `business.enable_two_factor_requirement` |
| `org` | Organization membership and settings | `org.add_member`, `org.remove_member`, `org.update_member` |
| `repo` | Repository lifecycle and settings | `repo.create`, `repo.destroy`, `repo.access`, `repo.rename` |
| `team` | Team management | `team.create`, `team.add_member`, `team.add_repository` |
| `hook` | Webhook management | `hook.create`, `hook.destroy`, `hook.events_changed` |
| `protected_branch` | Branch protection rules | `protected_branch.create`, `protected_branch.update` |
| `enterprise` | Enterprise-level settings | `enterprise.*` events |
| `billing` | Billing and payment | `billing.change_billing_type`, `billing.budget_create` |
| `copilot` | Copilot license and settings management | `copilot.cfb_seat_assignment_created`, `copilot.cfb_seat_cancelled` |
| `actions_cache` | GitHub Actions cache management | `actions_cache.delete` |
| `audit_log_streaming` | Audit log stream configuration | `audit_log_streaming.create`, `audit_log_streaming.update` |
| `code_scanning` | Code scanning alerts and config | `code_scanning.alert_created`, `code_scanning.alert_closed_by_user` |
| `dependabot_alerts` | Dependabot alert configuration | Organization-level Dependabot alert settings |
| `secret_scanning` / `business_secret_scanning` | Secret scanning configuration | Enterprise and org-level secret scanning settings |
| `ip_allow_list` | IP allow list management | `ip_allow_list_entry.create`, `ip_allow_list.enable` |
| `oauth_application` | OAuth app management | `oauth_application.create`, `oauth_application.destroy` |
| `personal_access_token` | Fine-grained PAT management | Token approval/denial events |
| `api` | API request events (streaming only) | `api.request` (must be explicitly enabled) |

**Operation Types** [6][7]:
- `create`, `access`, `modify`, `remove`, `authentication`, `transfer`, `restore`

**Search Query Syntax** [6][7]:

| Qualifier | Example | Description |
|---|---|---|
| `action:` | `action:repo.create` | Filter by specific action |
| `actor:` | `actor:octocat` | Filter by who performed the action |
| `user:` | `user:targetuser` | Filter by affected user |
| `repo:` | `repo:my-org/my-repo` | Filter by repository |
| `created:` | `created:>=2025-01-01` | Filter by date (ISO 8601) |
| `operation:` | `operation:authentication` | Filter by operation type |
| `ip:` | `ip:192.168.1.1` | Filter by IP address (if disclosed) |
| `country:` | `country:US` | Filter by country |

### SIEM Integration

**Common Patterns for Enterprise Admins:**

**Splunk Integration** [3]:
- Stream via Splunk HTTP Event Collector (HEC)
- Configure HTTPS endpoint with SSL verification
- For Splunk Cloud: domain is `http-inputs-<host>`, port 443
- Index the `action` field for fast querying of event types
- Use the Splunk Add-on for GitHub or build custom dashboards on the JSON schema

**Azure Sentinel Integration** [3]:
- Stream to Azure Event Hubs, then use an Event Hubs data connector in Microsoft Sentinel
- Alternatively, stream to Azure Blob Storage for batch ingestion
- Use Sentinel's built-in GitHub audit log connector (if available) or create custom analytics rules
- Key use case: correlate GitHub audit events with Entra ID sign-in logs for end-to-end identity visibility

**Datadog Integration** [3]:
- Stream directly to Datadog using API key or client token
- Filter logs in Datadog using `github.audit.streaming`
- Supported sites: US, US3, US5, EU1, US1-FED, AP1
- **Warning:** Datadog only accepts logs up to 18 hours old — do not pause streams for extended periods

**Amazon S3 + CloudTrail Lake** [3]:
- Stream to S3, then integrate with AWS CloudTrail Lake for unified audit visibility
- Supports OIDC for keyless authentication (no long-lived AWS credentials in GitHub)
- Use the `aws-samples/aws-cloudtrail-lake-github-audit-log` reference architecture

**Best Practices for All SIEM Integrations:**
1. **Enable IP disclosure** before setting up streaming to ensure IP data is present in events [10]
2. **Enable API request events** for security-relevant API endpoint logging [3]
3. **Stream to multiple endpoints** for redundancy (public preview) [3]
4. **Monitor stream health** — fix misconfigured streams within 6 days [3]
5. **Account for at-least-once delivery** — implement deduplication using `_document_id` [3]
6. **Create alerts** for high-severity events: `business.disable_two_factor_requirement`, `repo.destroy`, `org.remove_member`, `business.disable_saml`, `protected_branch.destroy`

### Copilot Audit Events

**What is Logged** [13]:

The `copilot` event category in the audit log tracks **administrative and license management** actions for GitHub Copilot Business and Enterprise subscriptions. It does **not** log individual prompts, completions, or code suggestions.

**Key Copilot Events:**
| Event | Description |
|---|---|
| `copilot.cfb_seat_assignment_created` | A Copilot license was assigned to a user |
| `copilot.cfb_seat_cancelled` | A Copilot license was removed from a user |
| `copilot.cfb_seat_management_changed` | Seat management settings were changed |
| Various policy events | Changes to Copilot-related enterprise policies |

**Agentic Audit Log Events** [14]:
- Filter with `actor:Copilot` to see **agent activity** on the GitHub website (e.g., Copilot creating PRs, modifying files)
- Key fields for agentic events:
  - `actor_is_agent: true` — indicates the actor is an AI agent
  - `agent_session_id` — links events to a specific agent session
  - `user` — the person who initiated the agentic event
- Example: Copilot Workspace or Copilot Coding Agent creates a pull request → logged as `pull_request.create` with `actor:Copilot` [14]

**What is NOT Logged** [13]:
- Client session data (prompts sent to Copilot, suggestions received)
- Copilot code completion accept/reject events
- Local IDE interactions with Copilot

**Custom Telemetry Note:** Some enterprises use custom hooks to send Copilot CLI events to their own logging service for prompt/usage telemetry [13].

### Git Events

**What Git Events are Logged** [2][6]:
- `git.clone` — A repository was cloned
- `git.fetch` — Changes were fetched from a repository
- `git.push` — Changes were pushed to a repository

**Availability and Limitations:**
- Git events are available at the **enterprise level only** [2].
- Retained for only **7 days** (vs. 180 days for web events) [2][6].
- **Not included in UI search results** — you must use the API with `include=git` or `include=all`, or export/stream them [6][9].
- Git events initiated via the **web browser or APIs** (e.g., merging a PR in the UI) are **not** included in Git event exports [2].
- When streaming is enabled, Git events are included in the stream alongside web events [3].
- Git events include token authentication data (`hashed_token`, `programmatic_access_type`) for tracing compromised credentials [11].

**API Access to Git Events:**
```bash
# Get Git events only
curl -H "Authorization: Bearer TOKEN" \
  "https://api.github.com/enterprises/ENTERPRISE/audit-log?include=git&phrase=created:>=2025-01-01"

# Get all events (web + Git)
curl -H "Authorization: Bearer TOKEN" \
  "https://api.github.com/enterprises/ENTERPRISE/audit-log?include=all"
```

**Export via UI:**
Enterprise → Settings → Audit log → "Export Git Events" dropdown → Select date range → Download Results (compressed JSON) [2].

### Data Residency Impact

**GitHub Enterprise Cloud with Data Residency (GHE.com)** [15]:

- Enterprises adopting data residency are hosted on a **dedicated subdomain of GHE.com** (e.g., `octocorp.ghe.com`)
- Available regions: **EU, Australia, US, Japan** [15]
- Data is stored in the chosen geographic region [15]

**Impact on Audit Log Access:**
- **API endpoints shift** to the dedicated subdomain:
  - REST: `https://api.SUBDOMAIN.ghe.com/enterprises/{enterprise}/audit-log`
  - GraphQL: `https://api.SUBDOMAIN.ghe.com/graphql`
  [15][12]
- **All audit log features remain available**: UI search, streaming, API access, Git event export [15]
- **Streaming endpoints** may need to be in the same region or have appropriate cross-region networking configured for compliance
- Enterprise Managed Users (EMU) is **required** with data residency, so the audit log includes user-level security log events [8][15]

**Key Considerations for Workshop:**
- Participants with data residency must use `api.SUBDOMAIN.ghe.com` instead of `api.github.com` for all API examples
- Streaming configuration remains the same, but consider data sovereignty when choosing stream endpoints (e.g., Azure Event Hubs in EU region for EU data residency)
- `gh` CLI works but requires authentication to the GHE.com account [15]

## What to Cover in Workshop (L300)

### Must-Cover Topics
1. **Audit log architecture** — Enterprise vs. org scope, what's logged at each level, 180-day vs. 7-day retention
2. **Streaming setup** — Live demo or walkthrough of configuring at least one streaming endpoint (recommend Azure Event Hubs for Microsoft-leaning audiences, Splunk for broader audiences)
3. **REST API deep dive** — Pagination, filtering with `phrase`, `include=git`, rate limits (1,750/hr), cursor-based pagination
4. **Token forensics** — How to identify events by a compromised token using `hashed_token` search
5. **IP address disclosure** — Enabling, privacy implications, what events include IPs
6. **Copilot audit events** — What's logged (license management, agent activity with `actor:Copilot`), what's NOT logged (prompts/completions)
7. **Git events** — Limited retention (7 days), streaming importance, API access pattern
8. **SIEM integration patterns** — At-least-once delivery, deduplication strategy, health monitoring

### Advanced Topics (L300)
- API request event streaming (opt-in, security-relevant endpoints only)
- Multiple stream endpoints for redundancy
- GraphQL audit log queries for complex cross-org analysis
- Custom alerting rules for high-severity events
- Data residency considerations for API endpoints and stream destinations
- Stream buffering behavior (7-day pause buffer, 3-week reset)
- Using `_document_id` for event deduplication in SIEM pipelines

## Workshop Exercise Ideas

### Exercise 1: Query the Enterprise Audit Log via REST API
**Objective:** Use `curl` or `gh api` to retrieve and filter audit log events.
**Steps:**
1. Authenticate with a PAT that has `read:audit_log` scope
2. Query for all `repo.create` events in the past 30 days
3. Query for Git events (clone/push) using `include=git`
4. Implement cursor-based pagination to retrieve all results
5. Export results to a JSON file and analyze with `jq`

**Key Commands:**
```bash
# Basic query
gh api /enterprises/ENTERPRISE/audit-log?phrase=action:repo.create+created:>=2025-03-01&per_page=100

# Git events
gh api "/enterprises/ENTERPRISE/audit-log?include=git&per_page=50"

# Token forensics — find events by token hash
TOKEN_HASH=$(echo -n "ghp_xxxx" | openssl dgst -sha256 -binary | base64)
gh api "/enterprises/ENTERPRISE/audit-log?phrase=hashed_token:\"$TOKEN_HASH\""
```

### Exercise 2: Set Up Audit Log Streaming
**Objective:** Configure streaming to an Azure Event Hub or Splunk HEC and verify events flow.
**Steps:**
1. Create an Azure Event Hubs namespace and event hub (or Splunk HEC endpoint)
2. Navigate to Enterprise → Settings → Audit log → Log streaming
3. Configure the stream with provider credentials
4. Verify connectivity with "Check endpoint"
5. Trigger a test event (e.g., create a repo) and confirm it appears in the stream destination
6. Enable API request events in Settings
7. Pause and resume the stream to demonstrate buffering behavior

### Exercise 3: Build a Security Alert Dashboard
**Objective:** Create SIEM alerts for critical enterprise events.
**Steps:**
1. Using streamed audit log data in your SIEM (or simulated JSON data)
2. Create alert rules for these high-severity events:
   - `business.disable_two_factor_requirement` — 2FA disabled at enterprise level
   - `repo.destroy` — Repository deleted
   - `protected_branch.destroy` — Branch protection removed
   - `business.disable_saml` — SAML SSO disabled
   - `org.remove_member` — User removed from organization
   - `business.add_admin` / `business.remove_admin` — Enterprise admin changes
3. Set up a dashboard showing event volume by category over time
4. Demonstrate deduplication using `_document_id` field

## Sources

1. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise — Enterprise audit log overview
2. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/exporting-audit-log-activity-for-your-enterprise — Exporting audit log and Git events data
3. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise — Audit log streaming setup and providers
4. https://docs.github.com/en/rest/enterprise-admin/audit-log — REST API endpoints for enterprise audit logs
5. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/using-the-audit-log-api-for-your-enterprise — Using the audit log API (REST + GraphQL)
6. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/searching-the-audit-log-for-your-enterprise — Searching the enterprise audit log
7. https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization — Organization audit log overview
8. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise — Enterprise audit log event reference
9. https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization — Organization audit log event reference
10. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/displaying-ip-addresses-in-the-audit-log-for-your-enterprise — IP address disclosure in audit logs
11. https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/identifying-audit-log-events-performed-by-an-access-token — Token identification in audit logs
12. https://docs.github.com/en/enterprise-cloud@latest/graphql/guides/managing-enterprise-accounts — GraphQL API for enterprise accounts and audit log
13. https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-github-copilot-in-your-organization/reviewing-audit-logs-for-copilot-business — Copilot audit log review
14. https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/agentic-audit-log-events — Agentic audit log events (Copilot agent activity)
15. https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency — Data residency for GitHub Enterprise Cloud
