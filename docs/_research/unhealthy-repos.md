# Research Brief: Unhealthy Repositories & Git History

> **VBD Agenda Items:** 2.13 (Unhealthy repositories), 2.14 (Changing history with Git)
> **Priority:** P1
> **Researched:** April 2026
> **Status:** Ready for content creation

## Overview

Repository health is a critical concern for GitHub Enterprise Cloud administrators managing organizations at scale. Unhealthy repositories—characterized by bloated size, excessive branches, large files embedded in history, or leaked secrets—degrade developer experience through slow clones, sluggish pushes, and wasted storage. GitHub actively monitors repository health signals including size, commit frequency, contents, and structure, and may contact administrators when repositories excessively impact infrastructure [1].

This brief covers the full lifecycle of repository health management: detecting problems with tools like `git-sizer`, managing large files with Git LFS, rewriting history with `git-filter-repo` (the modern replacement for both `git-filter-branch` and BFG Repo-Cleaner), removing sensitive data from history, cleaning up stale branches, understanding GitHub's size limits and enforcement, and archiving repositories that are no longer actively maintained. These topics are essential L300 content for GHEC administrators who must establish governance policies and remediation workflows.

At the enterprise level, proactive measures—push protection for secrets, automatic branch deletion after PR merge, `.gitattributes` configuration for LFS, and regular repository audits—prevent unhealthy repositories from forming in the first place. When problems do occur, administrators need to understand the side effects of history rewriting and coordinate cleanup across clones and forks.

## Key Concepts

### Identifying Repo Health Issues

**Signs of an unhealthy repository:**

- **Overall size exceeding recommendations** — GitHub recommends repositories remain under 1 GB, and strongly recommends under 5 GB [1]. Repositories that excessively impact infrastructure may trigger an email from GitHub Support.
- **Large files in history** — Files over 50 MiB trigger Git warnings; files over 100 MiB are blocked entirely [1]. Files added via browser cannot exceed 25 MiB [1].
- **Excessive references** — Too many branches and tags slow fetches because all refs must be transferred to the client, even for up-to-date clones [2].
- **Giant trees (directories)** — Directories with thousands of entries are expensive because Git creates new tree objects for every modified file's full path [2].
- **Repeated large text files** — Files that delta well may not bloat the repository, but are expensive for Git to reconstruct and diff [2].
- **Generated files / archives in history** — Compiled output, JAR files, ZIP archives, and tarballs don't delta well and should not be stored in Git [2].

**Diagnostic tool — `git-sizer`:**

`git-sizer` (maintained by GitHub at `github/git-sizer`) computes size metrics and flags concerning values with asterisk-based severity ratings [2]:

```bash
# Install and run git-sizer
git clone --mirror https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO.git
git-sizer --verbose
```

Output includes: overall repository size, biggest objects (commits, trees, blobs), history structure (depth, tag chains), and biggest checkouts (file count, path depth, total size) [2].

**Community health profile API:**

GitHub provides a REST API endpoint to assess community health [3]:

```bash
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/community/profile
```

Returns `health_percentage` (0–100) based on presence of: README, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, ISSUE_TEMPLATE, and PULL_REQUEST_TEMPLATE [3].

### Git LFS

**What it does:** Git LFS stores references (pointer files) in the repository while the actual large file content is stored on a separate server. Pointer files contain version, SHA-256 OID, and file size [4].

**Maximum file sizes by plan [4]:**

| Plan | Max LFS File Size |
|------|------------------|
| GitHub Free | 2 GB |
| GitHub Pro | 2 GB |
| GitHub Team | 4 GB |
| GitHub Enterprise Cloud | 5 GB |

**Free storage and bandwidth quotas [5]:**

| Plan | Bandwidth | Storage |
|------|-----------|---------|
| GitHub Free / Pro | 10 GiB | 10 GiB |
| GitHub Team / GHEC | 250 GiB | 250 GiB |

Exceeding quotas without a payment method blocks LFS operations (only pointer files are retrieved on clone) [5].

**Setup and configuration [6]:**

```bash
# Install Git LFS
git lfs install

# Track file types via .gitattributes
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.iso"

# Commit .gitattributes (critical - enables LFS for collaborators and forks)
git add .gitattributes
git commit -m "Configure Git LFS tracking"

# Add and push large files normally
git add path/to/file.psd
git commit -m "Add design file"
git push
```

**Key considerations:**
- Always commit `.gitattributes` to the repository so forks and clones inherit LFS tracking [6].
- Git LFS cannot be used with GitHub Pages or template repositories [4].
- Use `git lfs migrate` to retroactively move existing large files to LFS [7].
- Bandwidth is measured on downloads; storage is measured continuously [5].

### Removing Large Files from History

**`git-filter-repo` (recommended) [8][9]:**

`git-filter-repo` is the officially recommended tool by both the Git project and GitHub for rewriting history. It replaces both `git-filter-branch` (deprecated, extremely slow, riddled with gotchas) and BFG Repo-Cleaner (limited in scope) [9].

**Prerequisites:** Git >= 2.36.0, Python 3 >= 3.6 [9].

```bash
# Install
brew install git-filter-repo          # macOS
pip install git-filter-repo           # pip

# Remove a specific large file from all history
git clone https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO
git-filter-repo --invert-paths --path path/to/huge-file.bin

# Remove all files matching a pattern
git-filter-repo --invert-paths --path-glob '*.iso'

# Remove files larger than a threshold (via callback)
git-filter-repo --strip-blobs-bigger-than 50M

# Extract a subdirectory into its own repo
git-filter-repo --path src/ --to-subdirectory-filter my-module

# Force push rewritten history
git push --force --mirror origin
```

**BFG Repo-Cleaner (legacy alternative) [10]:**

BFG is simpler but limited to specific rewrites (removing large files and replacing text). It requires Java 11+. While still functional, `git-filter-repo` is more capable and now recommended [9].

```bash
# Clone as bare mirror
git clone --mirror git://example.com/some-big-repo.git

# Remove files larger than 100MB
java -jar bfg.jar --strip-blobs-bigger-than 100M some-big-repo.git

# Remove specific files by name
java -jar bfg.jar --delete-files id_{dsa,rsa} some-big-repo.git

# Replace text (passwords, tokens)
java -jar bfg.jar --replace-text passwords.txt some-big-repo.git

# Clean up and push
cd some-big-repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push
```

**Important:** BFG does not modify the latest commit on HEAD by default (to avoid breaking deployments). Ensure your latest commit is clean before running BFG [10].

**Why `git-filter-repo` over `git-filter-branch` [9]:**
- `git-filter-branch` is multiple orders of magnitude slower
- `git-filter-branch` has gotchas that can silently corrupt rewrites
- The Git project officially warns against using `git-filter-branch`
- `git-filter-repo` handles edge cases (special characters, empty commits) correctly

### Removing Sensitive Data

**GitHub's recommended process [8]:**

1. **Revoke/rotate the secret immediately** — This is the most important step. Once revoked, the secret can no longer be used regardless of whether it remains in history [8].
2. **Clone the repository locally:**
   ```bash
   git clone https://github.com/YOUR-ORG/YOUR-REPO
   cd YOUR-REPO
   ```
3. **Run `git-filter-repo` with the `--sensitive-data-removal` flag** (requires version >= 2.47):
   ```bash
   # Remove a file containing secrets
   git-filter-repo --sensitive-data-removal --invert-paths --path path/to/secrets.env

   # Replace specific text patterns across all files
   git-filter-repo --sensitive-data-removal --replace-text ../passwords.txt
   ```
4. **Check affected pull requests:**
   ```bash
   grep -c '^refs/pull/.*/head$' .git/filter-repo/changed-refs
   ```
5. **Force push:**
   ```bash
   git push --force --mirror origin
   ```
6. **Contact GitHub Support** via the [support portal](https://support.github.com) with:
   - Owner/repo name
   - Number of affected PRs
   - First Changed Commit(s) from `git-filter-repo` output
   - Any orphaned LFS objects noted in output
7. **Coordinate with collaborators** — They must rebase (not merge) branches off the old history, or re-clone entirely [8].

**Side effects of history rewriting [8]:**
- **Recontamination risk** — Collaborators who `git pull` then `git push` from old clones will reintroduce the data
- **Changed commit hashes** — All commits from the point of introduction onward get new SHAs
- **Broken PR diffs** — Closed PR diff views are destroyed
- **Lost commit/tag signatures** — `git-filter-repo` removes signatures
- **Branch protection conflicts** — Force push protections must be temporarily disabled

**Prevention — Secret scanning and push protection [11][12]:**

- **Secret scanning** automatically detects API keys, passwords, and tokens across all Git history, issues, PRs, discussions, and wikis [11].
- **Push protection** blocks pushes containing detected secrets before they reach the repository [12]. Available for:
  - Command-line pushes
  - GitHub UI commits
  - REST API requests
- Push protection for users is enabled by default on github.com (blocks secrets to public repos) [12].
- Organizations can define **custom patterns** for detecting proprietary secret formats [12].
- **Delegated bypass** allows specific actors to bypass push protection with audited approval workflows [12].

### Stale Branch Management

**GitHub's built-in branch views [13]:**

The repository branches page categorizes branches into:
- **Active** — Branches with commits in the last 3 months
- **Stale** — Branches with no commits in the last 3 months
- **Yours** — Branches you've pushed to (for users with push access)

**Automatic branch deletion [14]:**

Repository settings allow enabling **automatic deletion of head branches** after pull requests are merged. This is the single most effective stale branch prevention measure.

Settings > General > "Automatically delete head branches" ✓

**Manual and CLI cleanup:**

```bash
# List remote branches merged into main
git branch -r --merged origin/main | grep -v 'main\|HEAD'

# Delete a remote branch
git push origin --delete feature/old-branch

# Bulk delete merged remote branches (use with caution)
git branch -r --merged origin/main \
  | grep -v 'main\|HEAD\|release' \
  | sed 's/origin\///' \
  | xargs -I{} git push origin --delete {}

# Prune local tracking references to deleted remote branches
git fetch --prune
```

**Why stale branches matter:**
- All references are transferred on every fetch, slowing clone and fetch operations [2]
- Large numbers of branches create cognitive overhead for developers
- Stale branches may contain outdated security vulnerabilities
- GitHub recommends limiting refs to "a few tens of thousands at most" [2]

**Deleted branches can be restored** via the closed PR page within a retention window [14].

### Repository Size Limits

**GitHub's stated limits [1]:**

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Individual file size | 50 MiB | Warning from Git |
| Individual file size | 100 MiB | **Blocked** — push rejected |
| Browser-uploaded file | 25 MiB | Hard limit |
| Repository size (recommended) | < 1 GB | Soft guidance |
| Repository size (strongly recommended) | < 5 GB | Soft guidance |
| Repository size (excessive) | — | GitHub Support contacts owner |

**Git LFS per-file limits [4]:** 2 GB (Free/Pro), 4 GB (Team), 5 GB (GHEC).

**Push size limits:**
- GitHub enforces a maximum push size of approximately 2 GB per push operation.
- Pushes that would cause the repository to exceed its soft size limits may trigger warnings.

**`git-sizer` level of concern indicators [2]:**
- `*` to `*****` — Increasing levels of concern
- `!` — Extremely high (equivalent to 30+ asterisks)
- Metrics include: commit count, tree/blob total size, maximum blob size, reference count, path depth/length, directory entry count.

### Repository Archiving

**What archiving does [15]:**

Archiving makes a repository **completely read-only**. Once archived:
- Issues, PRs, code, labels, milestones, projects, wiki, releases, commits, tags, branches, reactions, code scanning alerts, comments, and permissions become **read-only**
- Cannot add or remove collaborators or teams
- Contributors can only **fork** or **star** the project
- No new commits, issues, PRs, or comments can be created

**When to archive:**
- Project is no longer actively maintained
- Repository is superseded by a new project
- Keeping for historical/reference purposes only
- Compliance requirements to preserve but not modify code

**Process [15]:**
1. Close all open issues and pull requests
2. Update README and description to indicate archived status
3. Settings > Danger Zone > "Archive this repository"
4. Confirm by typing the repository name

**Reversal:** Archived repos can be unarchived at any time via Settings > Danger Zone > "Unarchive this repository" [15].

**Important notes:**
- Archived repositories are searchable via `is:archived` qualifier [15]
- Secret scanning can still be enabled on archived repositories (GitHub Secret Protection) [15]
- Legacy per-repository billing plans still charge for archived repos [15]

## What to Cover in Workshop (L300)

### 2.13 — Unhealthy Repositories

1. **Diagnostic workflow** — Demo `git-sizer` against a sample bloated repo; interpret the output table and severity indicators
2. **Git LFS deep dive** — Show `.gitattributes` configuration, `git lfs track`, `git lfs migrate`, and how pointer files work internally
3. **Enterprise governance** — Repository size policies, LFS quotas by plan, when GitHub Support intervenes
4. **Community health API** — Use the REST API to audit repos across an organization for missing README, LICENSE, CONTRIBUTING files
5. **Stale branch management** — Enable auto-delete in repo settings; use the Stale branches view; script bulk cleanup with `gh` CLI or the API
6. **Archiving strategy** — When to archive vs. delete; impact on search, forks, and billing

### 2.14 — Changing History with Git

1. **When and why to rewrite history** — Large file removal, sensitive data removal, repository splitting/combining
2. **`git-filter-repo` hands-on** — Walk through removing a large file, replacing text, extracting a subdirectory
3. **Side effects matrix** — Cover all side effects of history rewriting (changed SHAs, broken PRs, signature loss, recontamination risk)
4. **Coordination protocol** — Step-by-step process including GitHub Support contact for cache/PR cleanup
5. **Prevention stack** — Secret scanning → push protection → pre-commit hooks → `.gitignore` → code review practices
6. **BFG context** — Brief comparison showing why `git-filter-repo` is the current recommendation, with BFG as legacy knowledge

## Workshop Exercise Ideas

### Exercise 1: Repository Health Audit

**Objective:** Assess and diagnose an unhealthy repository using `git-sizer` and the GitHub API.

1. Provide participants with a pre-built "unhealthy" demo repository containing:
   - A 75 MB binary file committed 10 versions ago
   - 200+ stale branches (no commits in 6+ months)
   - Missing community health files (no LICENSE, no CONTRIBUTING)
2. Run `git-sizer --verbose` and interpret the output
3. Use the community profile API to check the health percentage
4. Document findings and propose a remediation plan
5. Enable auto-delete for branches and archive stale feature branches

### Exercise 2: Removing a Large File from History

**Objective:** Use `git-filter-repo` to remove a large file and understand the consequences.

1. Clone the demo repository (contains a 75 MB file committed in an early commit)
2. Verify the file is in history: `git log --all --diff-filter=A -- path/to/large-file`
3. Run `git-filter-repo --invert-paths --path path/to/large-file`
4. Compare repository size before and after
5. Check how many PRs are affected via `changed-refs`
6. Force push and observe that commit hashes have changed
7. Simulate a collaborator with an old clone doing `git pull` — observe recontamination
8. Discuss the full coordination process needed in production

### Exercise 3: Setting Up a Prevention Stack

**Objective:** Configure proactive defenses against unhealthy repositories.

1. Configure `.gitattributes` with Git LFS tracking for common binary extensions:
   ```
   *.png filter=lfs diff=lfs merge=lfs -text
   *.jpg filter=lfs diff=lfs merge=lfs -text
   *.zip filter=lfs diff=lfs merge=lfs -text
   *.pdf filter=lfs diff=lfs merge=lfs -text
   ```
2. Enable push protection for the repository/organization
3. Create a custom secret scanning pattern for an internal credential format
4. Set up a `.gitignore` that excludes build artifacts, dependencies, and environment files
5. Enable "Automatically delete head branches" in repository settings
6. Create a scheduled GitHub Actions workflow that reports on stale branches weekly:
   ```yaml
   name: Stale Branch Report
   on:
     schedule:
       - cron: '0 9 * * 1'  # Every Monday at 9 AM
   jobs:
     report:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: List stale branches
           run: |
             echo "## Stale Branches (no commits in 90+ days)" >> $GITHUB_STEP_SUMMARY
             git branch -r --format='%(refname:short) %(committerdate:relative)' \
               | while read branch date; do
                   echo "- $branch ($date)" >> $GITHUB_STEP_SUMMARY
                 done
   ```

## Sources

1. https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github — File and repository size limits
2. https://github.com/github/git-sizer — Repository analysis tool and health indicators
3. https://docs.github.com/en/rest/metrics/community — Community profile REST API
4. https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage — Git LFS overview and file size limits
5. https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-storage-and-bandwidth-usage — LFS storage and bandwidth quotas
6. https://docs.github.com/en/repositories/working-with-files/managing-large-files/configuring-git-large-file-storage — LFS configuration and .gitattributes
7. https://docs.github.com/en/repositories/working-with-files/managing-large-files/moving-a-file-in-your-repository-to-git-large-file-storage — Migrating files to LFS
8. https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository — Sensitive data removal process
9. https://github.com/newren/git-filter-repo — git-filter-repo tool and comparisons
10. https://rtyley.github.io/bfg-repo-cleaner/ — BFG Repo-Cleaner usage and examples
11. https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning — Secret scanning overview
12. https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection — Push protection for secrets
13. https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/viewing-branches-in-your-repository — Branch views (Active/Stale)
14. https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request — Branch deletion and restoration
15. https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories — Repository archiving process
