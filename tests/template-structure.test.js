const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'));
}

function expectFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  assert.ok(fs.existsSync(absolutePath), `Expected file to exist: ${relativePath}`);
}

expectFile('README.md');
expectFile('data/menu.template.json');
expectFile('docs/api-template.md');
expectFile('database/schema.template.sql');
expectFile('server/README.md');
expectFile('index.html');
expectFile('js/app.js');

const menuTemplate = readJson('data/menu.template.json');

assert.ok(menuTemplate.restaurant.name, 'Restaurant name is required');
assert.ok(Array.isArray(menuTemplate.weeklyMenus), 'weeklyMenus must be an array');
assert.ok(menuTemplate.weeklyMenus.length >= 5, 'weeklyMenus should include at least 5 weekdays');
assert.ok(Array.isArray(menuTemplate.announcements), 'announcements must be an array');
assert.ok(Array.isArray(menuTemplate.cartTemplate.items), 'cart template items must be an array');
assert.ok(Array.isArray(menuTemplate.adminTemplate.sampleOrders), 'admin sample orders must be an array');

menuTemplate.weeklyMenus.forEach((day) => {
  assert.ok(day.dayKey, 'Each day must include dayKey');
  assert.ok(day.dayNameFi && day.dayNameEn, 'Each day must include fi/en names');
  assert.ok(Array.isArray(day.items) && day.items.length > 0, 'Each day must include menu items');

  day.items.forEach((item) => {
    assert.strictEqual(typeof item.price, 'number', 'Each item must include numeric price');
    assert.ok(Array.isArray(item.dietaryTags), 'Each item must include dietaryTags');
    assert.ok(item.nameFi && item.nameEn, 'Each item must include fi/en names');
  });
});

const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
assert.ok(indexHtml.includes('id="app"'), 'index.html should include the #app mount point');

console.log('Template structure check passed.');

