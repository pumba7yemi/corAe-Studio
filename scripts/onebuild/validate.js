// ESM validate: checks for build/one-build.manifest.yml and minimal shape

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

function main() {
  const manifestPath = path.join(process.cwd(), 'build', 'one-build.manifest.yml');
  if (!fs.existsSync(manifestPath)) {
    console.error('Missing build/one-build.manifest.yml');
    process.exit(1);
  }
  const manifest = yaml.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!manifest || !manifest.version || !manifest.modules) {
    console.error('Manifest must include "version" and "modules".');
    process.exit(1);
  }
  console.log(`Manifest OK. version=${manifest.version}, modules=${(manifest.modules || []).length}`);
}
main();