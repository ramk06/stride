import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

declare global {
  var __strideDatabase: Database.Database | undefined;
}

function createDatabase() {
  const dataDirectory = path.join(process.cwd(), ".data");
  mkdirSync(dataDirectory, { recursive: true });

  const database = new Database(path.join(dataDirectory, "stride.db"));
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      units TEXT NOT NULL DEFAULT 'metric',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      location TEXT NOT NULL,
      distance_km REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      pace_label TEXT NOT NULL,
      heart_rate INTEGER,
      elevation_m INTEGER,
      cadence_spm INTEGER,
      calories INTEGER,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gear (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      name TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      starting_mileage_km REAL NOT NULL DEFAULT 0,
      expected_mileage_km REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      retired_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_gear_assignments (
      activity_id TEXT PRIMARY KEY,
      gear_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      assigned_at TEXT NOT NULL,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY (gear_id) REFERENCES gear(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      target_distance_km REAL NOT NULL DEFAULT 0,
      target_date TEXT NOT NULL,
      target_pace TEXT NOT NULL DEFAULT '',
      target_time TEXT NOT NULL DEFAULT '',
      frequency TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_activities_user_started_at ON activities(user_id, started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_gear_user_id ON gear(user_id);
    CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
  `);

  return database;
}

export function getDatabase() {
  if (!globalThis.__strideDatabase) {
    globalThis.__strideDatabase = createDatabase();
  }

  return globalThis.__strideDatabase;
}