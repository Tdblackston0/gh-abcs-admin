# Research Brief: GHAS → Standalone Security Products

> **VBD Agenda Items:** 1.5 (Security in the cloud)
> **Priority:** P0 (affects 36 references across 12 docs)
> **Researched:** April 2026
> **Status:** Ready for content updates

## Overview

On **March 4, 2025**, GitHub announced that GitHub Advanced Security (GHAS) would be restructured into two standalone security products, effective **April 1, 2025** [1]. The unified "GHAS" bundle was replaced by:

1. **GitHub Secret Protection** — $19/active committer/month
2. **GitHub Code Security** — $30/active committer/month

These products are now available individually on **GitHub Team** and **GitHub Enterprise Cloud** plans (previously GHAS was Enterprise Cloud–only) [1]. Existing GHAS customers retain their bundled license until renewal, at which point they transition to the new SKUs [1].

**Why it matters for this repo:** 36 references across 12 docs use the old unified "GitHub Advanced Security" name or abbreviation "GHAS" in ways that now need to differentiate between the two products, or at minimum acknowledge the product split.

## Product Breakdown

### GitHub Secret Protection

**Price:** $19/active committer/month [1]

**Includes** [2][3]:

| Feature | Description |
|---------|-------------|
| Secret scanning alerts (user) | Detect tokens/credentials checked into repos |
| Push protection | Block commits containing secrets before push |
| Copilot secret scanning (AI detection) | AI-powered detection of unstructured secrets (passwords) with low false-positive rate |
| Custom patterns | Define org-specific secret patterns |
| Delegated bypass for push protection | Approval workflow for who can bypass push protection |
| Delegated alert dismissal | Governance controls for alert dismissal |
| Security campaigns (for secrets) | Remediate exposed secrets at scale (public preview) [7] |
| Security overview | Org-wide risk distribution dashboard |

**Free features (all plans, public repos):** Secret scanning alerts for partners, push protection for users [2].

**How to enable:** Organization Settings → Security configurations, or enterprise-level policies under Policies → Advanced Security [5][6].

### GitHub Code Security

**Price:** $30/active committer/month [1]

**Includes** [2][3]:

| Feature | Description |
|---------|-------------|
| Code scanning (CodeQL) | SAST — find vulnerabilities in your own code |
| CodeQL CLI | Run CodeQL locally, upload results to GitHub |
| Copilot Autofix | AI-generated fixes for code scanning alerts |
| Security campaigns (for code scanning) | Fix security debt at scale with developer collaboration [7] |
| Custom auto-triage rules for Dependabot | Automate alert triage (ignore, snooze, trigger updates) |
| Dependency review | Full impact analysis of dependency changes in PRs |
| Third-party security findings | Integration with third-party SARIF tools |
| Security overview | Org-wide risk distribution dashboard |

**Free features (all plans, public repos):** Code scanning, CodeQL CLI, Copilot Autofix, dependency review [2].

**How to enable:** Organization Settings → Security configurations, or enterprise-level policies under Policies → Advanced Security [5][6].

### What's Still Called "Advanced Security"?

The term **"GitHub Advanced Security" is NOT deprecated** — it has been redefined. Per GitHub's official FAQ:

> "GitHub Advanced Security (GHAS) encompasses GitHub's application security products comprising GitHub Secret Protection and GitHub Code Security." [4]

Specifically:

| Context | Correct Usage |
|---------|---------------|
| **Umbrella brand** | "GitHub Advanced Security" is the umbrella brand for the two products |
| **Enterprise policy page** | Still labeled "Advanced Security" in Settings → Policies → Advanced Security [5] |
| **Volume/subscription billing** | You can still "Buy Advanced Security" which bundles both SKUs [6] |
| **Certification** | Still called "GitHub Advanced Security Certification" [3] |
| **Azure DevOps** | Still called "GitHub Advanced Security for Azure DevOps (GHAzDO)" [3] |
| **Individual purchase** | Use "GitHub Secret Protection" and "GitHub Code Security" when referring to the specific products |
| **Feature descriptions** | Always specify which product a feature belongs to (e.g., "push protection, part of GitHub Secret Protection") |

**Key insight:** "GHAS" is now a **parent category**, not a product you buy directly (on metered billing). Customers purchase Secret Protection and/or Code Security. On volume/subscription billing, there's still a combined "Advanced Security" license option [6].

### GitHub Code Quality (Public Preview)

Enterprise policies now also reference **"GitHub Code Quality"** as a third product (public preview) alongside Secret Protection and Code Security [5]. This is a new code-quality analysis feature separate from the security products. Workshop content should note its existence but focus on Secret Protection and Code Security as the GA products.

## Terminology Migration Guide

Use this table when updating the 36 references across this repo:

| Old Term | New Term / Replacement | Notes |
|----------|----------------------|-------|
| "GitHub Advanced Security (GHAS)" as a single product | "GitHub Advanced Security products (GitHub Secret Protection and GitHub Code Security)" | When introducing GHAS for the first time in a doc |
| "GHAS" (abbreviation, generic) | Keep "GHAS" but define on first use: "GitHub Advanced Security (GHAS) — comprising GitHub Secret Protection and GitHub Code Security" | GHAS is still a valid umbrella abbreviation |
| "Enable GHAS" | "Enable GitHub Secret Protection and GitHub Code Security" | Be specific about which product(s) |
| "GHAS licensing" | "GitHub Secret Protection ($19/committer/mo) and GitHub Code Security ($30/committer/mo) licensing" | Clarify the two SKUs and prices |
| "GHAS features" (generic list including secret scanning + code scanning) | Split into two lists under their respective products | Avoid mixing Secret Protection and Code Security features |
| "GHAS license per active committer" | "Licensed per unique active committer (90-day window) per product" | Same model but now per-product |
| "GitHub Advanced Security suite" | "GitHub's Advanced Security products" | Plural, not a single suite |
| "GHAS-enabled repository" | "Repository with Secret Protection and/or Code Security enabled" | More precise |

### When NOT to change "Advanced Security"

- **Enterprise policy settings** — The UI still says "Advanced Security" [5]
- **GHAzDO references** — Azure DevOps product name is unchanged [3]
- **Certification references** — Still "GitHub Advanced Security Certification" [3]
- **Volume billing** — The combined license is still called "Advanced Security" [6]

## Licensing Changes Summary

| Aspect | Before (Pre-April 2025) | After (April 2025+) |
|--------|------------------------|---------------------|
| **Product structure** | Single "GHAS" bundle | Two standalone products: Secret Protection + Code Security |
| **Pricing** | Single per-committer price | $19/committer/mo (Secret Protection) + $30/committer/mo (Code Security) |
| **Plan availability** | Enterprise Cloud only | **Team** and Enterprise Cloud [1] |
| **Billing models** | Volume/subscription | Volume/subscription **and** metered (pay-as-you-go) [6] |
| **Can buy separately** | No (all-or-nothing bundle) | Yes — buy either or both independently [1] |
| **Active committer definition** | 90-day window, any commit to GHAS-enabled repo | Unchanged — 90-day window per product [6] |
| **GitHub Enterprise Server** | Volume/subscription only | Volume/subscription + metered (via GitHub Connect, GHES 3.13+) [6] |

## Enterprise Admin Changes

### Policy Settings (Enterprise → Policies → Advanced Security)

The enterprise policy page now has **granular controls** per product [5]:

1. **GHAS Availability** — Allow/disallow for all orgs, or per-org with per-product granularity (Secret Protection, Code Security, Code Quality)
2. **Repository admin enablement** — Separate toggles for whether repo admins can enable/disable Secret Protection, Code Security (and Code Quality), or the combined Advanced Security
3. **AI detection in secret scanning** — Dedicated policy toggle
4. **Copilot Autofix** — Dedicated policy toggle (requires Code Security to be enabled)
5. **Dependabot alerts** — Allow/disallow repo admin control

### Security Configurations (Organization-level)

Organizations now use **security configurations** to enable features at scale [8]:

- Collections of enablement settings applied to repositories
- Can specify Secret Protection features and Code Security features independently
- Global settings control organization-level defaults

### Billing & Licensing Page

- Volume/subscription: "Buy Advanced Security" button still exists in licensing page [6]
- Metered billing: Estimated billing changes shown via modal when enabling features [6]
- New "Disable Advanced Security" option for enterprise owners (prevents re-enablement) [6]
- Active committer counts now reported separately under "Secret Protection repositories" and "Code Security repositories" [6]

## Security Campaigns & Copilot Autofix

### Security Campaigns

Security campaigns are part of **GitHub Code Security** (for code scanning alerts) [2][7]. As of April 2026, campaigns for **secret scanning alerts** are also available in **public preview** under GitHub Secret Protection [7].

Key capabilities:
- Group related security alerts for developer collaboration
- Named point of contact per campaign
- Copilot Autofix auto-triggered for code scanning alerts
- Alerts assignable to users with write access **or to Copilot cloud agent** for automatic PR generation [7]
- REST API endpoints available for campaign management [7]

### Copilot Autofix

- **For code scanning:** Part of **GitHub Code Security** — suggests fixes for CodeQL/SARIF alerts [2]
- **For secret scanning:** Not applicable (secrets require revocation, not code fixes)
- Free for public repositories [2]
- Enterprise policy toggle available for Copilot Autofix enablement [5]

## Impact on Workshop Content

### Summary of Changes Needed

| File | References | Primary Change Needed |
|------|-----------|----------------------|
| `docs/08-security-compliance.md` | 6 (lines 9, 15, 17, 21, 35, 1098) + 15 GHAS refs | **Major rewrite** — Section "GitHub Advanced Security (GHAS)" needs restructuring into Secret Protection and Code Security subsections. Licensing section must update pricing and SKUs. |
| `docs/09-best-practices-waf.md` | 6 (lines 50, 123, 185, 3155, 3191, 3273) | Update all "Enable GHAS" references to specify which product(s). Update documentation links. |
| `docs/01-enterprise-hierarchy.md` | 4 (lines 36, 131, 585, 680) | Replace "GHAS licensing and deployment" with "Secret Protection and Code Security licensing". Update checklist items. |
| `docs/ADO-to-GitHub-Migration-Business-Case.md` | 4 (lines 150, 160, 162, 550) + many GHAS abbrevs | Update "GitHub Advanced Security (GHAS)" section heading and body. Note the two-product structure. Update pricing. |
| `docs/02-organization-strategies.md` | 3 (lines 61, 513, 551) + 5 GHAS refs | Update "Consolidated GHAS license utilization" → per-product. Note Team plan availability. |
| `docs/ado-to-github-migration-assessment.md` | 3 (lines 157, 439, 594) + 20+ GHAS refs | **Major rewrite** — GHAS vs GHAzDO comparison table needs product-level attribution. Update all "GHAS" to clarify umbrella vs specific product. |
| `docs/10-reference-architecture.md` | 3 (lines 47, 101, 331) + 8 GHAS refs | Update Mermaid diagram: split "GHAS" node into Secret Protection and Code Security. Update feature table. |
| `docs/06-policy-inheritance.md` | 3 (lines 714, 1073, 1154) | Update policy references to mention both products. Update link text. |
| `docs/13-github-onboarding-implementation-plan.md` | 1 (line 292) + 9 GHAS refs | Update "GHAS Policies" section heading. Clarify which product each policy controls. |
| `docs/11-security-by-default-policies.md` | 1 (line 56) | Already partially updated (mentions Secret Protection, Code Security, Code Quality). Verify accuracy. |
| `docs/04-enterprise-managed-users.md` | 1 (line 1258) | Minor — update "GitHub Advanced Security alerts" to "Secret Protection and Code Security alerts" |
| `docs/final-prompt-plan.md` | 1 (line 294) | Update "GHAS overview" reference |

### Specific Content Patterns to Fix

1. **"GitHub Advanced Security (GHAS) suite"** — Replace with "GitHub Advanced Security products (GitHub Secret Protection and GitHub Code Security)"
2. **Feature lists mixing secret scanning + code scanning under one "GHAS" heading** — Split into two subsections per product
3. **"Licensed per active committer"** — Add that pricing is now $19 (Secret Protection) + $30 (Code Security) per committer/month, available on Team and Enterprise plans
4. **"Enable GHAS at enterprise level"** — Specify "Enable Secret Protection and Code Security via enterprise policies"
5. **Mermaid diagrams with a single "GHAS" node** — Split into two nodes or add sub-nodes
6. **"GHAS replaces third-party tools"** — Specify which product replaces which (Secret Protection replaces GitLeaks/secret scanners; Code Security replaces SonarQube/Snyk SAST/SCA)

## Migration Path for Existing GHAS Customers

Per the March 2025 announcement [1]:

- **Sales-managed accounts:** Transition to new SKUs at renewal (for renewal dates after April 1, 2025). Contact account team.
- **Self-serve customers:** Instructions for transitioning announced through GitHub's roadmap and changelog on an ongoing basis.
- **No feature loss:** Existing GHAS customers retain all features — they are simply split across two product SKUs.
- **GitHub Team customers (new):** Can purchase Secret Protection and/or Code Security from organization settings starting April 1, 2025, via metered billing [1].

## Affected Files in This Repo

- `docs/01-enterprise-hierarchy.md` — 4 direct + GHAS abbreviations
- `docs/02-organization-strategies.md` — 3 direct + 5 GHAS abbreviations
- `docs/04-enterprise-managed-users.md` — 1 reference
- `docs/06-policy-inheritance.md` — 3 references
- `docs/08-security-compliance.md` — 6 direct + 15 GHAS abbreviations (**heaviest**)
- `docs/09-best-practices-waf.md` — 6 direct + GHAS abbreviations
- `docs/10-reference-architecture.md` — 3 direct + 8 GHAS abbreviations
- `docs/11-security-by-default-policies.md` — 1 reference (partially current)
- `docs/13-github-onboarding-implementation-plan.md` — 1 direct + 9 GHAS abbreviations
- `docs/ado-to-github-migration-assessment.md` — 3 direct + 20+ GHAS abbreviations (**heaviest**)
- `docs/ADO-to-GitHub-Migration-Business-Case.md` — 4 direct + many GHAS abbreviations
- `docs/final-prompt-plan.md` — 1 reference

## Sources

1. [GitHub Blog Changelog — Introducing GitHub Secret Protection and GitHub Code Security (March 4, 2025)](https://github.blog/changelog/2025-03-04-introducing-github-secret-protection-and-github-code-security/)
2. [GitHub Docs — GitHub Security Features](https://docs.github.com/en/code-security/getting-started/github-security-features)
3. [GitHub Docs — About GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)
4. [GitHub Enterprise — Advanced Security FAQ and Pricing](https://github.com/enterprise/advanced-security#pricing)
5. [GitHub Docs — Enforcing Policies for Code Security and Analysis for Your Enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise)
6. [GitHub Docs — About Billing for GitHub Advanced Security](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-advanced-security/about-billing-for-github-advanced-security)
7. [GitHub Docs — About Security Campaigns](https://docs.github.com/en/code-security/securing-your-organization/fixing-security-alerts-at-scale/about-security-campaigns)
8. [GitHub Docs — About Enabling Security Features at Scale](https://docs.github.com/en/code-security/securing-your-organization/introduction-to-securing-your-organization-at-scale/about-enabling-security-features-at-scale)
9. [Microsoft Learn — Secret Protection and Code Security Plans for Advanced Security on Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/repos/security/configure-github-advanced-security-features)
