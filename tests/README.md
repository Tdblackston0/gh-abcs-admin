# Test Framework — gh-abcs-admin Workshop Validation

This directory contains the automated validation suite for the VBD workshop content.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests (except link validation)
npm test -- --skip-links

# Run all tests including link validation
npm test

# Run individual test suites
npm run test:lint          # Markdown formatting
npm run test:frontmatter   # YAML front matter
npm run test:structure     # Document structure
npm run test:codeblocks    # Code block syntax
npm run test:mermaid       # Mermaid diagram syntax
npm run test:freshness     # Deprecated content detection
npm run test:spell         # Spelling
npm run test:vbd-coverage  # VBD agenda coverage map
npm run test:lab-completeness # Lab structure completeness
npm run test:links         # Link validation (slow — makes network requests)
```

## Test Suites

| Suite | Script | What It Validates |
|-------|--------|-------------------|
| **Markdown Lint** | `test:lint` | Formatting consistency, heading structure, list style. Config: `.markdownlint.yml` |
| **Front Matter** | `test:frontmatter` | YAML front matter is valid where present |
| **Structure** | `test:structure` | Docs have H1 + H2 sections; labs have title, duration, steps, references |
| **Code Blocks** | `test:codeblocks` | YAML/JSON blocks parse correctly; bash blocks have balanced quotes |
| **Mermaid** | `test:mermaid` | Diagram type is valid, brackets are balanced, content is non-empty |
| **Freshness** | `test:freshness` | Flags deprecated GitHub features, outdated action versions, stale URLs |
| **Spelling** | `test:spell` | Technical terminology. Config: `.cspell.json` with custom dictionary |
| **VBD Coverage** | `test:vbd-coverage` | Every VBD agenda item has mapped docs/labs; referenced files exist |
| **Links** | `test:links` | Internal and external links resolve. Config: `link-check-config.json` |

## Test Runner Options

```bash
# Skip slow link checks (useful for local development)
npm test -- --skip-links

# Stop on first failure
npm test -- --fail-fast

# Combine options
npm test -- --skip-links --fail-fast
```

## Fixture Files

| File | Purpose |
|------|---------|
| `fixtures/vbd-coverage-map.json` | Maps VBD agenda items → docs and labs |
| `fixtures/doc-expectations.json` | Expected structure for each doc *(planned — Phase 1)* |
| `fixtures/lab-expectations.json` | Expected structure for each lab *(planned — Phase 1)* |
| `fixtures/known-issues.json` | Tracked issues from baseline *(planned — Phase 1)* |

## Adding New Tests

### Adding a new validation script

1. Create `tests/validate-<name>.js`
2. Use `require('./utils')` for shared helpers (`Reporter`, `findMarkdownFiles`, etc.)
3. Add npm script in `package.json`: `"test:<name>": "node tests/validate-<name>.js"`
4. Add the suite to `SUITES` array in `tests/run-all.js`
5. Add the step to `.github/workflows/tests.yml`

### Adding words to the spelling dictionary

Edit `.cspell.json` → `words` array. Add GitHub-specific terms, product names, and acronyms.

### Adjusting markdown lint rules

Edit `.markdownlint.yml`. Rules are documented at: https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md

### Updating the VBD coverage map

Edit `tests/fixtures/vbd-coverage-map.json`. Each agenda item needs:
- `id`: Agenda item number (e.g., "1.1")
- `topic`: Topic name
- `docs`: Array of doc file paths
- `labs`: Array of lab file paths

## CI Integration

The GitHub Actions workflow (`.github/workflows/tests.yml`) runs all tests on:
- Push to `main` or `feature/**` branches (when docs, labs, tests, config files, or the workflow itself changes)
- Pull requests to `main`

Path filters include: `docs/**`, `labs/**`, `README.md`, `tests/**`, `package.json`, `package-lock.json`, `.markdownlint.yml`, `.cspell.json`, and `.github/workflows/tests.yml`.

Link validation runs separately with `continue-on-error: true` since it depends on external URLs.

## Architecture

```
tests/
├── run-all.js              # Master test runner
├── utils.js                # Shared utilities (Reporter, file parsing, heading extraction)
├── validate-structure.js   # Doc/lab structure validation
├── validate-frontmatter.js # YAML front matter validation
├── validate-codeblocks.js  # Code block syntax validation
├── validate-mermaid.js     # Mermaid diagram validation
├── validate-vbd-coverage.js # VBD agenda coverage checking
├── validate-lab-completeness.js # Lab structural completeness
├── validate-freshness.js   # Deprecated content detection
├── validate-links.js       # Link validation wrapper
├── README.md               # This file
└── fixtures/
    └── vbd-coverage-map.json  # VBD agenda → content mapping
```
