const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('company dashboard ad-space popup uses the updated English and Indonesian copy', () => {
  const source = readProjectFile('src/app/company-dashboard/page.tsx');

  assert.match(source, /clearly visible to people actively looking for professionals/);
  assert.match(source, /Jangkau audiens yang tepat\./);
  assert.match(source, /Tingkatkan visibilitas pada momen penting pengambilan keputusan\./);
  assert.match(source, /Eksposur yang sederhana dan hemat biaya\./);
  assert.match(source, /Iklan Anda akan tampil di halaman kategori dan hasil pencarian - di hadapan pengguna yang sedang aktif mencari tenaga profesional\./);
  assert.match(source, /Hubungi kami untuk mengetahui pilihan harga yang tersedia\./);

  assert.doesNotMatch(source, /Jangkau audiens yang sangat tertarget/);
  assert.doesNotMatch(source, /Peningkatan visibilitas pada momen-momen penting pengambilan keputusan/);
  assert.doesNotMatch(source, /Paparan yang sederhana dan hemat biaya/);
});
