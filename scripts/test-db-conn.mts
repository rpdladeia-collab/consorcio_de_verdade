import { getDb } from "../server/db.ts";

async function main() {
  const db = await getDb();
  if (!db) {
    console.log("NO DB - DATABASE_URL not set");
    process.exit(1);
  }
  const result = await db.execute("SELECT COUNT(*) as total FROM bc_dados_linha");
  console.log("Result:", JSON.stringify(result));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
