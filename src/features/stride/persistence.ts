import { mkdirSync } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import Database from "better-sqlite3";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

declare global {
  var __strideDatabase: Database.Database | undefined;
}

const SESSION_COOKIE_NAME = "stride_session";
const SESSION_TTL_DAYS = 14;

type SessionUserRow = {
  id: string;
  email: string;
  full_name: string;
};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
};

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

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, savedKey] = passwordHash.split(":");

  if (!salt || !savedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const savedBuffer = Buffer.from(savedKey, "hex");

  if (derivedKey.byteLength !== savedBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(derivedKey, savedBuffer);
}

function createSessionToken() {
  return randomBytes(32).toString("hex");
}

function createTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildSessionExpiry() {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function persistSession(userId: string) {
  const token = createSessionToken();
  const now = new Date().toISOString();

  getDatabase()
    .prepare(
      `
        INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(randomUUID(), userId, createTokenHash(token), buildSessionExpiry(), now);

  return token;
}

export function applySessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function deleteSessionByToken(token: string | undefined) {
  if (!token) {
    return;
  }

  getDatabase().prepare("DELETE FROM sessions WHERE token_hash = ?").run(createTokenHash(token));
}

function mapSessionUser(row: SessionUserRow | undefined): SessionUser | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
  };
}

function findSessionUser(token: string | undefined) {
  if (!token) {
    return null;
  }

  const now = new Date().toISOString();
  const database = getDatabase();
  database.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);

  const row = database
    .prepare(
      `
        SELECT users.id, users.email, users.full_name
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      `,
    )
    .get(createTokenHash(token), now) as SessionUserRow | undefined;

  return mapSessionUser(row);
}

export async function getCurrentSessionUser() {
  const cookieStore = await cookies();
  return findSessionUser(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export function getRequestSessionUser(request: NextRequest) {
  return findSessionUser(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}