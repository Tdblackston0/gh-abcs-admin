/**
 * validate-freshness.js
 *
 * Flags known deprecated patterns, URLs, and references in markdown files.
 * Checks for:
 * - Deprecated GitHub features (e.g., legacy branch protection when rulesets exist)
 * - Outdated action versions (e.g., actions/github-script@v6)
 * - Known-stale URLs
 * - Deprecated terminology
 */

const {
  findMarkdownFiles,
  readFile,
  Reporter
} = require('./utils');

const reporter = new Reporter('Content Freshness Validation');

const SKIP_FILES = [
  'docs/PLAN.md',
  'docs/initial-prompt.md',
  'docs/final-prompt-plan.md'
];

// Patterns to flag with explanations
const DEPRECATED_PATTERNS = [
  {
    pattern: /actions\/github-script@v[1-6]\b/g,
    message: 'Outdated actions/github-script version (current is v7+)',
    severity: 'warn'
  },
  {
    pattern: /actions\/checkout@v[1-3]\b/g,
    message: 'Outdated actions/checkout version (current is v4+)',
    severity: 'warn'
  },
  {
    pattern: /actions\/setup-node@v[1-3]\b/g,
    message: 'Outdated actions/setup-node version (current is v4+)',
    severity: 'warn'
  },
  {
    pattern: /github\.com\/features\/security/,
    message: 'GitHub Advanced Security is now split into Secret Protection and Code Security (April 2025)',
    severity: 'warn'
  },
  {
    pattern: /docs\.github\.com\/en\/github\//,
    message: 'Outdated docs.github.com URL pattern (old /en/github/ path)',
    severity: 'warn'
  },
  {
    pattern: /\bGitHub Advanced Security\b(?!.*(?:now|formerly|legacy|previously|was))/,
    message: 'GHAS is now split into GitHub Secret Protection and GitHub Code Security (April 2025) — verify context',
    severity: 'warn'
  },
  {
    pattern: /save-state|set-output.*>>.*GITHUB_OUTPUT/,
    message: 'Deprecated Actions command (set-output/save-state) — use $GITHUB_OUTPUT/$GITHUB_STATE',
    severity: 'warn'
  },
  {
    pattern: /::set-output\s+name=/,
    message: 'Deprecated Actions ::set-output command — use $GITHUB_OUTPUT',
    severity: 'warn'
  },
  {
    pattern: /node12|node16/i,
    message: 'Outdated Node.js runtime reference — Actions now use node20+',
    severity: 'warn'
  }
];

async function main() {
  const docFiles = await findMarkdownFiles('docs/**/*.md');
  const labFiles = await findMarkdownFiles('labs/**/*.md');
  const readmeFiles = await findMarkdownFiles('README.md');
  const allFiles = [...docFiles, ...labFiles, ...readmeFiles].filter(f => !SKIP_FILES.includes(f));

  let totalFlags = 0;

  for (const relPath of allFiles) {
    try {
      const content = readFile(relPath);

      for (const check of DEPRECATED_PATTERNS) {
        const matches = content.match(check.pattern);
        if (matches) {
          totalFlags += matches.length;
          for (const match of matches) {
            if (check.severity === 'error') {
              reporter.fail(relPath, `${check.message} — found: "${match}"`);
            } else {
              reporter.warn(relPath, `${check.message} — found: "${match}"`);
            }
          }
        }
      }

      reporter.pass(`${relPath}: freshness checked`);
    } catch (err) {
      reporter.fail(relPath, `Error reading: ${err.message}`);
    }
  }

  console.log(`  📊 Total freshness flags: ${totalFlags}`);
  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Freshness validation failed:', err);
  process.exit(1);
});
