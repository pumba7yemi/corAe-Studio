import fs from 'fs';
import path from 'path';

export function loadConstitution() {
  const file = path.join(process.cwd(), 'corAe-Studio-v2', 'CORAE_CONSTITUTION', 'CONSTITUTION.md');
  return fs.readFileSync(file, 'utf8');
}

export function validateConstitution(raw) {
  const errors = [];
  const required = [
    'Identity & Authority',
    'Source Governance Law',
    'Build Law',
    'Shipping Law',
    '150 Logic Enforcement',
    'Subject-1 Override Layer',
  ];
  for (const k of required) {
    if (!raw.includes(k)) errors.push(`Missing section: ${k}`);
  }
  return { ok: errors.length === 0, errors };
}
