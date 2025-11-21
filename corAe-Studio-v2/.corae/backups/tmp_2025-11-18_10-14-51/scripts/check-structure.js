const { existsSync } = require("fs");

if (existsSync("apps/studio/app/ship")) {
  console.error("❌  apps/studio/app/ship still exists — move it to apps/ship");
  process.exit(1);
}

console.log("✅  Folder structure OK");