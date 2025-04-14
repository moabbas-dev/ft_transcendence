import fastifyPlugin from 'fastify-plugin';
import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db = null;

export async function initDatabase() {
    db = await open({
        filename: './data/elo_matchmaking.db',
        driver: sqlite3.Database
    });

  // Create tables if they don't exist
  await db.exec(`
    
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      player1_id TEXT NOT NULL,
      player2_id TEXT NOT NULL,
      player1_score INTEGER DEFAULT 0,
      player2_score INTEGER DEFAULT 0,
      player1_elo_change INTEGER,
      player2_elo_change INTEGER,
      status TEXT DEFAULT 'pending',
      winner_id TEXT,
      tournament_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player1_id) REFERENCES players (id),
      FOREIGN KEY (player2_id) REFERENCES players (id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments (id)
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      current_round INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tournament_players (
      tournament_id TEXT,
      player_id TEXT,
      status TEXT DEFAULT 'active',
      PRIMARY KEY (tournament_id, player_id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
      FOREIGN KEY (player_id) REFERENCES players (id)
    );


    -- Friend invites/challenges
CREATE TABLE match_invites (
  id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'accepted', 'rejected', 'expired'
  match_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (match_id) REFERENCES matches(id)
);
    
    
  `);

  console.log("Database initialized");
  return db;
};


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