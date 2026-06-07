const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('company dashboard ad-space popup uses the WebKit one-language copy', () => {
  const source = readProjectFile('src/app/company-dashboard/page.tsx');

  assert.match(source, /Place sponsored visibility across category pages and search results/);
  assert.match(source, /clearly visible to people actively looking for professionals/);
  assert.match(source, /Reach a highly targeted audience/);
  assert.match(source, /Increase visibility at key decision moments/);
  assert.match(source, /Simple and cost-effective exposure/);

  assert.doesNotMatch(source, /Jangkau audiens yang sangat tertarget/);
  assert.doesNotMatch(source, /Jangkau audiens yang tepat\./);
  assert.doesNotMatch(source, /Peningkatan visibilitas pada momen-momen penting pengambilan keputusan/);
  assert.doesNotMatch(source, /Iklan Anda akan tampil/);
});
