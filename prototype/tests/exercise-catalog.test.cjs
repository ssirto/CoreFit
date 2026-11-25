const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../exercise-catalog.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const catalog = context.window.CoreFitExercises;

test('the catalog exposes five areas and 21 selectable groups', () => {
  assert.equal(catalog.areas.length, 5);
  const groups = catalog.areas.flatMap(([, items]) => items.map(([id]) => id));
  assert.equal(groups.length, 21);
  assert.equal(new Set(groups).size, 21);
  for (const group of groups) assert.ok(catalog.search({ group }).length);
});

test('an exercise listed in several groups has one stable ID', () => {
  const fromBiceps = catalog.search({ group: 'biceps', query: 'Hammer Curl' }).find(item => item.id === 'hammer_curl');
  const fromForearms = catalog.search({ group: 'forearms', query: 'Hammer Curl' }).find(item => item.id === 'hammer_curl');
  assert.ok(fromBiceps);
  assert.equal(fromBiceps, fromForearms);
  assert.equal(new Set(catalog.entries.map(item => item.id)).size, catalog.entries.length);
});

test('search matches aliases, case, extra spaces and accents within the current group', () => {
  const query = '   PÁNCA   PIÁNA   CON   BILANCIERE ';
  const results = catalog.search({ query, group: 'mid_chest', equipment: 'barbell' });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'barbell_bench_press');
  assert.equal(catalog.search({ query, group: 'biceps' }).length, 0);
  assert.ok(catalog.search({ query }).includes(results[0]));
});

test('repetition, duration and distance modes use the appropriate data fields', () => {
  const cases = [
    ['Barbell Bench Press', 'weight_reps', 'reps'],
    ['Push-up', 'bodyweight_reps', 'reps'],
    ['Weighted Pull-up', 'weighted_bodyweight', 'reps'],
    ['Assisted Pull-up', 'assisted_reps', 'reps'],
    ['Plank', 'duration', 'seconds'],
    ['Weighted Plank', 'weight_duration', 'seconds'],
    ['Bear Crawl', 'distance', 'meters'],
    ["Farmer's Walk", 'weight_distance', 'meters']
  ];
  for (const [name, type, field] of cases) {
    const item = catalog.find(null, name);
    assert.equal(item.trackingType, type);
    assert.equal(catalog.mode(item).field, field);
  }
  assert.equal(catalog.mode({ name: 'Legacy exercise' }).field, 'reps');
});

test('custom exercises participate in search and resolve by ID', () => {
  const entry = { id: 'exercise-local-1', name: 'Remata privata', aliases: [], muscleGroups: ['upper_back'], equipment: 'cable' };
  assert.equal(catalog.search({ group: 'upper_back', query: 'privata' }, [entry])[0], entry);
  assert.equal(catalog.find(entry.id, null, [entry]), entry);
  assert.equal(catalog.find(null, 'Squat').id, 'barbell_back_squat');
});
