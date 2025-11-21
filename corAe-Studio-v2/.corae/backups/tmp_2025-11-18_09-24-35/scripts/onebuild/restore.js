/**
 * Restore a previously backed-up file snapshot.
 * Usage:
 *   node scripts/onebuild/restore.js "<timestamp>" "<repo-relative-path>"
 * Example:
 *   node scripts/onebuild/restore.js "2025-09-07T08-14-32-000Z" "apps/studio/app/dockyard/build/log/page.tsx"
 */
const path = require('path');
const fsp = require('fs/promises');
const fs = require('fs');

const ROOT = process.cwd();
const BACKUP_DIR = path.join(ROOT, 'build', 'backups');

async function restore(ts, relPath) {
  const src = path.join(BACKUP_DIR, ts, relPath);
  if (!fs.existsSync(src)) throw new Error(`Backup not found: ${src}`);
  const dest = path.join(ROOT, relPath);
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(src, dest);
  console.log(`Restored ${relPath} from ${ts}`);
}

(async () => {
  const [ts, rel] = process.argv.slice(2);
  if (!ts || !rel) {
    console.log('Usage: node scripts/onebuild/restore.js "<timestamp>" "<repo-relative-path>"');
    process.exit(2);
  }
  await restore(ts, rel);
})();