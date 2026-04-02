# 10 - Dormant User Management

In this lab you will identify inactive users in your GitHub Enterprise Cloud organization, generate dormant user reports, and design a license reclamation workflow to optimize seat costs.

> Duration: 15-20 minutes

References:
- [Viewing and managing a user's SAML access to your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/user-management/managing-users-in-your-enterprise/viewing-and-managing-a-users-saml-access-to-your-enterprise)
- [Managing dormant users](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/managing-dormant-users)
- [Viewing people in your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise)
- [About enterprise managed users](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/understanding-iam-for-enterprises/about-enterprise-managed-users)
- [REST API - List organization members](https://docs.github.com/en/rest/orgs/members#list-organization-members)
- [Audit log events for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise)

## 10.1 List organization members with activity

1. Navigate to your organization on GitHub.com and click the **People** tab to view all current members.
2. Observe the information displayed for each member — you can see their **role**, **2FA status**, and **SAML identity** (if SAML SSO is configured).
3. For an enterprise-wide view, navigate to your enterprise account at `https://github.com/enterprises/YOUR-ENTERPRISE`, then click **People** → **Members**.
4. Use the `gh` CLI to list all members of your organization programmatically:

   ```bash
   gh api /orgs/YOUR-ORG/members --paginate \
     --jq '.[] | [.login, .id] | @tsv'
   ```

5. Review the output. Each line shows a member's login and numeric user ID.
6. To include role information, run:

   ```bash
   gh api /orgs/YOUR-ORG/members --paginate \
     --jq '.[] | [.login, .id, .role_name // "member"] | @tsv'
   ```

7. Note that the **People** tab in the enterprise settings includes a **Dormant users** sub-tab — this is the primary UI for identifying inactive users at the enterprise level.

## 10.2 Identify dormant users

1. Navigate to your enterprise account at `https://github.com/enterprises/YOUR-ENTERPRISE`.
2. Click **People** in the left sidebar, then select the **Dormant users** tab.
3. Review the list of dormant users. GitHub considers a user dormant if they have had no qualifying activity in the past **30 days**. This is a trailing 30-day window, not a calendar month.
4. Qualifying activity includes any of the following:
   - Pushing commits
   - Opening or commenting on issues
   - Opening or commenting on pull requests
   - Pull request reviews
   - Wiki edits
   - GitHub Actions workflow runs triggered by the user
   - Signing in to GitHub.com or the enterprise
5. Download the dormant users report as a CSV file:
   - Navigate to **Enterprise** → **People** → **Compliance** → **Export** → **Dormant users**
   - The CSV includes each user's login, email, last activity date, and activity type
6. Open the downloaded CSV and examine the columns. Pay attention to the `last_active` timestamp and the `last_active_action` field.
7. In a small workshop organization, you may see few or no dormant users — this is expected. Focus on understanding the process and the data available.

## 10.3 Script a dormant user report

1. GitHub does not expose a direct "last active" REST API field for organization members. The dormant users report from **Enterprise** settings is the authoritative source. However, you can approximate activity by checking recent public events.
2. Create a script to check recent public events for each organization member:

   ```bash
   # List org members and check their most recent public event
   gh api /orgs/YOUR-ORG/members --paginate \
     --jq '.[].login' | while read user; do
     echo -n "$user: "
     gh api "/users/$user/events/public" \
       --jq '.[0].created_at // "no recent public activity"' 2>/dev/null
   done
   ```

3. Run the script and review the output. Note the limitations:
   - Only public events are returned — private repository activity is not visible
   - API rate limits apply (5,000 requests per hour for authenticated requests)
   - Enterprise Managed User (EMU) accounts may not generate public events
4. For a more reliable approach, use the enterprise audit log API to check login activity:

   ```bash
   # Query the enterprise audit log for recent login events
   # Requires a token with the admin:enterprise scope
   gh api /enterprises/YOUR-ENTERPRISE/audit-log \
     -F phrase='action:user.login' \
     -F per_page=100 \
     --jq '.[] | [.actor, .created_at] | @tsv' | sort -k2 -r | head -20
   ```

5. Compare the audit log results against your member list. Users absent from recent login activity are likely dormant.
6. For production use, combine these approaches into a scheduled script:

   ```bash
   # Example: generate a dormant user candidate report
   echo "login,last_public_event" > dormant-report.csv

   gh api /orgs/YOUR-ORG/members --paginate \
     --jq '.[].login' | while read user; do
     last_event=$(gh api "/users/$user/events/public" \
       --jq '.[0].created_at // "none"' 2>/dev/null)
     echo "$user,$last_event" >> dormant-report.csv
   done

   echo "Report saved to dormant-report.csv"
   cat dormant-report.csv | column -t -s ','
   ```

7. Remember: this script provides an approximation. Always cross-reference with the official **Dormant users** report from the enterprise compliance settings before taking any reclamation action.

## 10.4 Plan a reclamation workflow

1. Discuss with your group: why does dormant user management matter? Consider that each GitHub Enterprise Cloud seat has a per-user license cost. Unused seats represent direct cost that could be reclaimed.
2. Design a monthly reclamation process using these steps:
   - **Step 1 — Report:** Download the dormant users report from **Enterprise** → **People** → **Dormant users** on a monthly cadence (or automate via the API).
   - **Step 2 — Filter:** Exclude service accounts, CI/CD bot accounts, and shared accounts from the dormant list. These accounts may appear inactive but are essential for automation.
   - **Step 3 — Notify:** Send a notification to dormant users (via email or Slack) informing them that their account will be removed in 14 days unless they log in and perform qualifying activity.
   - **Step 4 — Reclaim:** After the 14-day grace period, remove users who are still inactive from the organization.
3. Discuss what happens when you remove a user from an organization:
   - Their private forks of organization repositories become independent repositories
   - Issue and pull request attributions remain intact (they are not reassigned)
   - They lose access to organization repositories, teams, and projects
   - They can be re-invited later if needed
4. For **Enterprise Managed User (EMU)** enterprises, discuss the difference between:
   - **Soft-deprovisioning (suspension):** The user account is suspended via SCIM. It is reversible — re-provisioning restores access and history.
   - **Hard-deprovisioning (permanent suspension):** The account is permanently suspended. A new account must be created if the user returns.
5. Discuss how to automate this workflow using a scheduled GitHub Actions workflow:
   - Use a `schedule` trigger with a cron expression (e.g., monthly on the 1st)
   - Call the enterprise API to fetch the dormant users report
   - Parse the CSV, filter out service accounts, and send notifications
   - Create an issue in an admin repository tracking the reclamation cycle
6. Consider edge cases:
   - Users on extended leave (parental leave, sabbatical) should be excluded
   - Seasonal contributors (e.g., interns, contractors) may appear dormant between engagement periods
   - Accounts used exclusively for code review may have long gaps between activity

## 10.5 Verify your work

1. Confirm that you can navigate to the **People** tab of your organization and view the member list.
2. Confirm that you ran the `gh api /orgs/YOUR-ORG/members` command and received a list of member logins and IDs.
3. Confirm that you explored the **Dormant users** section in the enterprise settings (or understand where to find it if you do not have enterprise owner access).
4. Confirm that you ran at least one of the scripted approaches from section 10.3 and reviewed the output.
5. Discuss with your group: "How would you handle a dormant service account that is used for CI/CD pipelines? Should it be excluded from the dormant analysis, and if so, how would you maintain that exclusion list?"
6. Review your reclamation workflow plan from section 10.4 and verify it includes:
   - [ ] A reporting cadence (monthly recommended)
   - [ ] A notification step with a grace period
   - [ ] An exclusion list for service accounts and bots
   - [ ] A defined process for EMU suspension vs. removal
   - [ ] An automation plan using GitHub Actions or a similar scheduler

> **Note:** Dormant license management is one of the most impactful cost-optimization practices for GitHub Enterprise Cloud. Each unused seat represents a recurring per-user cost. Organizations with hundreds or thousands of members can reclaim significant budget by regularly reviewing and removing dormant users. Establishing an automated, repeatable reclamation workflow ensures that license spend stays aligned with actual usage.
