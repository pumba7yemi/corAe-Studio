#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const ignore = ['node_modules', '.git', '.next', 'dist'];

function isPs1Allowed(file) {
  // allow files explicitly disabled with .ps1.disabled
  if (file.endsWith('.ps1.disabled')) return true;
  return false;
}

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const name = ent.name;
    if (ignore.includes(name)) continue;
    const full = path.join(dir, name);
    if (ent.isDirectory()) {
      results.push(...walk(full));
    } else {
      if (full.toLowerCase().endsWith('.ps1')) {
        if (!isPs1Allowed(full)) results.push(full);
      }
    }
  }
  return results;
}

const found = walk(root);
if (found.length > 0) {
  console.error('Found disallowed .ps1 files:');
  for (const f of found) console.error('  ' + path.relative(root, f));
  console.error('\nPolicy: .ps1 files are banned until 150 logic is applied. Rename to .ps1.disabled or remove.');
  process.exit(2);
} else {
  console.log('No disallowed .ps1 files found.');
  process.exit(0);
}
