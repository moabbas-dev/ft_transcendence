import sqlite3 from "sqlite3"
import { open } from "sqlite";

// Configure authentication service API URL
const AUTH_API_URL = process.env.AUTH_API_URL;

let db = null;

export async function initDatabase() {
  // Initialize chat database
  db = await open({
    filename: "./data/chat.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, friend_id)
    );

    CREATE TABLE IF NOT EXISTS friend_requests (
      from_user INTEGER NOT NULL,
      to_user INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (from_user, to_user)
    );

    CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user 
    ON friend_requests(to_user);

    CREATE INDEX IF NOT EXISTS idx_friends_user_id 
    ON friends(user_id);

    CREATE TABLE IF NOT EXISTS blocked_users (
      user_id INTEGER NOT NULL,
      blocked_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, blocked_id)
    );

    CREATE TABLE IF NOT EXISTS chat_rooms (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS room_participants (
      room_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
    );
  `);

  console.log("Database initialized");
  return db;
}

export async function getDatabase() {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
