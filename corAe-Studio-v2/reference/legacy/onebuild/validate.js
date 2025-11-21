// scripts/onebuild/validate.js
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const yaml = require('yaml');

const ROOT = process.cwd();
const schemaPath = path.join(ROOT, 'build', 'schemas', 'manifest.schema.json');
const manifestPath = path.join(ROOT, 'build', 'one-build.manifest.yml');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const manifest = yaml.parse(fs.readFileSync(manifestPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const ok = validate(manifest);

if (!ok) {
  console.error('❌ Manifest validation failed:\n', validate.errors);
  process.exit(1);
}

console.log('✅ Manifest valid. Version:', manifest.version);