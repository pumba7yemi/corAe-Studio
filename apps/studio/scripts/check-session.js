const BASE = process.env.CIMS_BASE ?? "http://localhost:3000";

async function main() {
  const url = `${BASE}/api/cims/users`;
  const r = await fetch(url);
  if (!r.ok) {
    console.error("HTTP ERROR ⇢", r.status, r.statusText);
    process.exit(1);
  }
  const data = await r.json();
  console.log("USERS ⇢", JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error("CHECK SESSION ERROR ⇢", err);
  process.exit(1);
});
