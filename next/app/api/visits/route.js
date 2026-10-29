// A visit counter in SQLite under DATA_DIR (the folder Self Host Layer backs
// up). GET /api/visits returns the count; GET /api/visits?add=1 adds one.
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

export const dynamic = "force-dynamic";

function open() {
  const db = new DatabaseSync(join(process.env.DATA_DIR ?? ".", "visits.db"));
  db.exec("PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, at TEXT NOT NULL)");
  return db;
}

export function GET(request) {
  const db = open();
  try {
    if (new URL(request.url).searchParams.get("add") === "1") db.prepare("INSERT INTO visits (at) VALUES (?)").run(new Date().toISOString());
    const { n } = db.prepare("SELECT count(*) AS n FROM visits").get();
    return Response.json({ visits: n });
  } finally {
    db.close();
  }
}
