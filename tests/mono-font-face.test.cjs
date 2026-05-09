const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

test('project mono utility uses JetBrains Mono variable font files', () => {
  const globals = fs.readFileSync(path.join(projectRoot, 'src/app/globals.css'), 'utf8');

  assert.match(
    globals,
    /font-family: 'JetBrainsMono';[\s\S]*JetBrainsMono-wght\.ttf[\s\S]*font-weight: 100 800;/,
    'Expected the normal mono font face to use JetBrains Mono variable font'
  );

  assert.match(
    globals,
    /JetBrainsMono-Italic-wght\.ttf[\s\S]*font-style: italic;/,
    'Expected the italic mono font face to use JetBrains Mono italic variable font'
  );

  assert.match(
    globals,
    /\.font-bam \{[\s\S]*font-family: 'JetBrainsMono', monospace;/,
    'Expected the existing mono utility class to point at JetBrains Mono'
  );
});
