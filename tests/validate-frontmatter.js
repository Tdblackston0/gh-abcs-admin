/**
 * validate-frontmatter.js
 *
 * Validates YAML front matter in markdown files.
 * Checks:
 * - Front matter is valid YAML
 * - Known fields have correct types
 * - No required fields are missing (when expectations exist)
 */

const YAML = require('yaml');
const {
  findMarkdownFiles,
  parseMarkdown,
  Reporter
} = require('./utils');

const reporter = new Reporter('Front Matter Validation');

// Known valid front matter keys and expected types
const KNOWN_KEYS = {
  'render_with_liquid': 'boolean',
  'title': 'string',
  'description': 'string',
  'author': 'string',
  'ms.date': 'string',
  'layout': 'string',
  'permalink': 'string'
};

// Files to skip
const SKIP_FILES = [
  'docs/PLAN.md',
  'docs/initial-prompt.md',
  'docs/final-prompt-plan.md'
];

function validateFrontMatter(relPath, parsed) {
  if (!parsed.frontmatter) {
    // No front matter is valid — not all files need it
    reporter.pass(`${relPath}: no front matter (ok)`);
    return;
  }

  // Parse YAML
  let data;
  try {
    data = YAML.parse(parsed.frontmatter);
  } catch (err) {
    reporter.fail(relPath, `Invalid YAML front matter: ${err.message}`);
    return;
  }

  if (data === null || typeof data !== 'object') {
    reporter.fail(relPath, 'Front matter parsed but is not an object');
    return;
  }

  reporter.pass(`${relPath}: valid YAML front matter`);

  // Check known field types
  for (const [key, value] of Object.entries(data)) {
    if (KNOWN_KEYS[key]) {
      const expectedType = KNOWN_KEYS[key];
      const actualType = typeof value;
      if (actualType !== expectedType) {
        reporter.warn(relPath,
          `Front matter key "${key}" expected ${expectedType}, got ${actualType}`);
      }
    }
  }
}

async function main() {
  const docFiles = await findMarkdownFiles('docs/**/*.md');
  const labFiles = await findMarkdownFiles('labs/**/*.md');
  const allFiles = [...docFiles, ...labFiles].filter(f => !SKIP_FILES.includes(f));

  for (const relPath of allFiles) {
    try {
      const parsed = parseMarkdown(relPath);
      validateFrontMatter(relPath, parsed);
    } catch (err) {
      reporter.fail(relPath, `Error reading file: ${err.message}`);
    }
  }

  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Front matter validation failed:', err);
  process.exit(1);
});
