# Workshop Agenda

## Workshop Overview

**GitHub Admin Training (GitHub Enterprise Cloud)**

| Detail | Value |
|--------|-------|
| **Format** | Workshop — 2-day, Remote delivery |
| **Level** | 300 — Advanced |
| **Duration** | 2 consecutive days, 3 hours/day (6 hours total) |
| **Audience** | Enterprise owners, Organization owners, Repository administrators |

### Target Audience

This workshop is designed for GitHub Enterprise Cloud administrators responsible for configuring, securing, and governing their organization's GitHub environment. Participants should have existing familiarity with GitHub fundamentals and be ready to dive into advanced administrative topics.

### Learning Objectives

By the end of this workshop, participants will be able to:

- Configure repository governance policies including rulesets, required status checks, and templates
- Implement security scanning, push protection, and security-by-default policies
- Manage identity and access through SAML, SCIM, and OIDC integrations
- Administer users, teams, and organizational settings at enterprise scale
- Leverage the GitHub API, webhooks, and gh CLI for automation
- Apply audit logging and dormant user management best practices
- Evaluate deployment strategies, marketplace apps, and third-party integrations

---

## Day 1

### Day 1: Working on GitHub (180 minutes)

| # | Start | Duration | Type | VBD Topics | Content | Resources |
|---|-------|----------|------|------------|---------|-----------|
| 1 | 0:00 | 10 min | Welcome | — | Introduction, objectives, logistics | — |
| 2 | 0:10 | 5 min | Setup | — | Environment verification | [Setup Guide](../labs/setup.md) |
| 3 | 0:15 | 15 min | 📖 Presentation | 1.1 | Repository permissions and settings | [Repository Governance](07-repository-governance.md), [Teams and Permissions](05-teams-permissions.md) |
| 4 | 0:30 | 10 min | 🔬 Lab | 1.1 | Lab 4: GitHub Templates | [Lab 04](../labs/lab04.md) |
| 5 | 0:40 | 20 min | 📖 Presentation | 1.2, 1.3 | Branches, Pull Requests, and Rulesets | [Repository Governance](07-repository-governance.md) |
| 6 | 1:00 | 20 min | 🔬 Lab | 1.2, 1.3 | Lab 3: Repository Rulesets | [Lab 03](../labs/lab03.md) |
| 7 | 1:20 | 10 min | ☕ Break | — | — | — |
| 8 | 1:30 | 15 min | 📖 Presentation | 1.4 | Required status checks deep dive | [Repository Governance](07-repository-governance.md) |
| 9 | 1:45 | 20 min | 🔬 Lab | 1.3, 1.4 | Lab 6: Advanced Repository Rulesets | [Lab 06](../labs/lab06.md) |
| 10 | 2:05 | 15 min | 📖 Presentation | 1.5 | Security in the cloud | [Security and Compliance](08-security-compliance.md), [Security by Default](11-security-by-default-policies.md) |
| 11 | 2:20 | 25 min | 🔬 Lab | 1.5 | Lab 7: Security Scanning and Push Protection | [Lab 07](../labs/lab07.md) |
| 12 | 2:45 | 10 min | 📖 Presentation | 1.6, 1.7, 1.8 | User privacy, Licenses, Marketplace overview | [User Privacy](26-user-privacy-data-residency.md), [Licenses](19-licenses-billing.md), [Marketplace](20-github-marketplace-apps.md) |
| 13 | 2:55 | 5 min | Discussion | — | Day 1 wrap-up, Q&A, preview Day 2 | — |

### Day 1 Summary

- **Total time:** 180 minutes (3 hours)
- **Presentation time:** ~75 minutes
- **Lab time:** ~75 minutes
- **Break:** 10 minutes
- **Welcome/Wrap-up:** 20 minutes
- **Labs completed:** 4 (Lab 3, Lab 4, Lab 6, Lab 7)

---

## Day 2

### Day 2: Integrations, Admin, API, and Advanced Topics (180 minutes)

| # | Start | Duration | Type | VBD Topics | Content | Resources |
|---|-------|----------|------|------------|---------|-----------|
| 1 | 0:00 | 5 min | Welcome | — | Day 2 kickoff, recap Day 1 | — |
| 2 | 0:05 | 15 min | 📖 Presentation | 2.1 | Integrations and authentication (SAML, SCIM, OIDC) | [IAM](03-identity-access-management.md), [EMU](04-enterprise-managed-users.md) |
| 3 | 0:20 | 10 min | 📖 Presentation | 2.2 | Enterprise site administration and policies | [Enterprise Hierarchy](01-enterprise-hierarchy.md), [Policy Inheritance](06-policy-inheritance.md) |
| 4 | 0:30 | 15 min | 🔬 Lab | 2.2 | Lab 15: Copilot Governance Configuration | [Lab 15](../labs/lab15.md) |
| 5 | 0:45 | 15 min | 📖 Presentation | 2.4, 2.5, 2.7 | Org settings, user admin, organizations and teams | [Org Strategies](02-organization-strategies.md), [Teams](05-teams-permissions.md), [User Admin](21-user-administration.md) |
| 6 | 1:00 | 20 min | 🔬 Lab | 2.5, 2.7 | Lab 9: User and Team Administration | [Lab 09](../labs/lab09.md) |
| 7 | 1:20 | 10 min | ☕ Break | — | — | — |
| 8 | 1:30 | 10 min | 📖 Presentation | 2.3, 2.6 | Audit log and dormant user management | [Audit Log](22-audit-log-deep-dive.md), [User Admin](21-user-administration.md) |
| 9 | 1:40 | 20 min | 🔬 Lab | 2.3 | Lab 8: Audit Log Exploration | [Lab 08](../labs/lab08.md) |
| 10 | 2:00 | 10 min | 📖 Presentation | 2.8, 2.11 | GitHub API and webhooks | [Scripts](24-scripts-automation.md), [Integrations](27-integrations-status-api.md) |
| 11 | 2:10 | 15 min | 🔬 Lab | 2.8 | Lab 5: GitHub API | [Lab 05](../labs/lab05.md) |
| 12 | 2:25 | 10 min | 📖 Presentation | 2.9, 2.10, 2.12, 2.13, 2.14 | 3rd party integrations, deployment, automation, repo health | [Deployment](23-deployment-strategies.md), [Unhealthy Repos](25-unhealthy-repos-git-history.md) |
| 13 | 2:35 | 15 min | 🔬 Lab | 2.12 | Lab 13: Scripts and gh CLI Automation | [Lab 13](../labs/lab13.md) |
| 14 | 2:50 | 10 min | Wrap-up | — | Knowledge check, assessment, next steps, resources | [Knowledge Checks](KNOWLEDGE-CHECKS.md), [Assessment](POST-WORKSHOP-ASSESSMENT.md) |

### Day 2 Summary

- **Total time:** 180 minutes (3 hours)
- **Presentation time:** ~70 minutes
- **Lab time:** ~85 minutes
- **Break:** 10 minutes
- **Welcome/Wrap-up:** 15 minutes
- **Labs completed:** 5 (Lab 5, Lab 8, Lab 9, Lab 13, Lab 15)

---

## Self-Paced Extension Labs

The following labs cover VBD topics that were addressed during presentations but where in-session lab time did not allow full hands-on practice. Participants should complete these labs after the workshop to reinforce the concepts covered and gain additional practical experience.

| Lab | Title | VBD Topics | Duration | Description |
|-----|-------|------------|----------|-------------|
| Lab 1 | Webhooks and Events | 2.11 | 5-10 min | Configure and test repository webhooks |
| Lab 2 | Actions Settings | 2.4 | 5-10 min | Configure GitHub Actions permissions |
| Lab 10 | Dormant User Management | 2.6 | 15-20 min | Identify and manage inactive users |
| Lab 11 | GitHub Apps and Marketplace | 1.8, 2.1 | 15-20 min | Install and configure GitHub Apps |
| Lab 12 | Deployments and Environments | 2.10 | 20-25 min | Set up deployment environments and protection rules |
| Lab 14 | Unhealthy Repos | 2.13, 2.14 | 20-25 min | Diagnose and remediate repo health issues |

---

## VBD Topic Coverage Matrix

The following matrix maps every VBD topic to its coverage across the workshop, including presentation references, in-session labs, and self-paced extension labs.

### Day 1 Topics

| VBD Topic | Description | Day | Slot | Presentation Docs | In-Session Lab | Extension Lab |
|-----------|-------------|-----|------|--------------------|----------------|---------------|
| 1.1 | Repository permissions and settings | Day 1 | #3, #4 | [Repository Governance](07-repository-governance.md), [Teams and Permissions](05-teams-permissions.md) | Lab 4 | — |
| 1.2 | Branches and Pull Requests | Day 1 | #5, #6 | [Repository Governance](07-repository-governance.md) | Lab 3 | — |
| 1.3 | Rulesets | Day 1 | #5, #6, #9 | [Repository Governance](07-repository-governance.md) | Lab 3, Lab 6 | — |
| 1.4 | Required status checks | Day 1 | #8, #9 | [Repository Governance](07-repository-governance.md) | Lab 6 | — |
| 1.5 | Security in the cloud | Day 1 | #10, #11 | [Security and Compliance](08-security-compliance.md), [Security by Default](11-security-by-default-policies.md) | Lab 7 | — |
| 1.6 | User privacy | Day 1 | #12 | [User Privacy](26-user-privacy-data-residency.md) | — | — |
| 1.7 | Licenses | Day 1 | #12 | [Licenses](19-licenses-billing.md) | — | — |
| 1.8 | Marketplace | Day 1 | #12 | [Marketplace](20-github-marketplace-apps.md) | — | Lab 11 |

### Day 2 Topics

| VBD Topic | Description | Day | Slot | Presentation Docs | In-Session Lab | Extension Lab |
|-----------|-------------|-----|------|--------------------|----------------|---------------|
| 2.1 | Integrations and authentication | Day 2 | #2 | [IAM](03-identity-access-management.md), [EMU](04-enterprise-managed-users.md) | — | Lab 11 |
| 2.2 | Enterprise site administration | Day 2 | #3, #4 | [Enterprise Hierarchy](01-enterprise-hierarchy.md), [Policy Inheritance](06-policy-inheritance.md) | Lab 15 | — |
| 2.3 | Audit log | Day 2 | #8, #9 | [Audit Log](22-audit-log-deep-dive.md) | Lab 8 | — |
| 2.4 | Org settings (Actions) | Day 2 | #5 | [Org Strategies](02-organization-strategies.md) | — | Lab 2 |
| 2.5 | User admin | Day 2 | #5, #6 | [User Admin](21-user-administration.md), [Teams](05-teams-permissions.md) | Lab 9 | — |
| 2.6 | Dormant user management | Day 2 | #8 | [User Admin](21-user-administration.md) | — | Lab 10 |
| 2.7 | Organizations and teams | Day 2 | #5, #6 | [Org Strategies](02-organization-strategies.md), [Teams](05-teams-permissions.md) | Lab 9 | — |
| 2.8 | GitHub API | Day 2 | #10, #11 | [Scripts](24-scripts-automation.md) | Lab 5 | — |
| 2.9 | 3rd party integrations | Day 2 | #12 | [Integrations](27-integrations-status-api.md) | — | — |
| 2.10 | Deployment strategies | Day 2 | #12 | [Deployment](23-deployment-strategies.md) | — | Lab 12 |
| 2.11 | Webhooks | Day 2 | #10 | [Integrations](27-integrations-status-api.md) | — | Lab 1 |
| 2.12 | Automation and scripting | Day 2 | #12, #13 | [Scripts](24-scripts-automation.md) | Lab 13 | — |
| 2.13 | Repo health | Day 2 | #12 | [Unhealthy Repos](25-unhealthy-repos-git-history.md) | — | Lab 14 |
| 2.14 | Git history and remediation | Day 2 | #12 | [Unhealthy Repos](25-unhealthy-repos-git-history.md) | — | Lab 14 |
