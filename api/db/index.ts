import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../..');
const dbPath = path.join(dbDir, 'data.db');

let db: Database | null = null;

export function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function runMigrations(dbInstance: Database) {
  const migrationsDir = path.resolve(__dirname, '../../migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  dbInstance.run(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const appliedResult = dbInstance.exec('SELECT filename FROM schema_migrations');
  const appliedSet = new Set<string>();
  if (appliedResult.length > 0) {
    const { values } = appliedResult[0];
    values.forEach((row) => appliedSet.add(row[0] as string));
  }

  for (const file of migrationFiles) {
    if (!appliedSet.has(file)) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      dbInstance.run(sql);
      dbInstance.run('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      console.log(`Applied migration: ${file}`);
    }
  }

  saveDb();
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => {
      const p = path.resolve(__dirname, '../../node_modules/sql.js/dist', file);
      if (fs.existsSync(p)) return p;
      return `https://sql.js.org/dist/${file}`;
    }
  });

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  const originalRun = db.run.bind(db);
  db.run = function(sql: string, params?: any) {
    const result = params !== undefined ? originalRun(sql, params) : originalRun(sql);
    saveDb();
    return result;
  };

  runMigrations(db);
  return db;
}
