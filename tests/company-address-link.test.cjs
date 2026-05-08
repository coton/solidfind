const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

test('buildCompanyAddressHref uses trusted Google Maps links and falls back for unsafe values', async () => {
  const links = await import(path.join(projectRoot, 'src/lib/company-address-link.mjs'));

  assert.equal(
    links.buildCompanyAddressHref({
      address: 'Jl. Raya Seminyak No.17, Seminyak, Kuta, Kabupaten Badung, Bali 80361',
      googleMapsLink: 'https://maps.google.com/?q=Balitecture+Seminyak+Bali',
    }),
    'https://maps.google.com/?q=Balitecture+Seminyak+Bali'
  );

  assert.equal(
    links.buildCompanyAddressHref({
      address: 'Badung, Bali',
      googleMapsLink: 'javascript:alert(1)',
    }),
    'https://www.google.com/maps/search/?api=1&query=Badung%2C%20Bali'
  );

  assert.equal(
    links.buildCompanyAddressHref({
      address: 'Seminyak',
      googleMapsLink: 'https://evil.example/maps?q=Seminyak',
    }),
    'https://www.google.com/maps/search/?api=1&query=Seminyak'
  );
});