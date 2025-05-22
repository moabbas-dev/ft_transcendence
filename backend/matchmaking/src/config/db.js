import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Database } = sqlite3;

class DatabaseConnection {
  constructor() {
    const dbPath = path.resolve(__dirname, '../../data/elo_matchmaking.sqlite');
    console.log(`database connection to ${dbPath} has Initialized!`);
    this.db = new Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err.message);
      } else {
        console.log('Connected to the database.');
      }
    });
  }

  initializeTables() {
    // Update matches table to include winner_id column
    const matchesTable = `
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_type TEXT NOT NULL CHECK(match_type IN ('1v1', 'friendly')),
        status TEXT NOT NULL CHECK(status IN ('pending', 'completed')),
        winner_id INTEGER,
        tournament_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
      );
    `;

    const matchPlayersTable = `
      CREATE TABLE IF NOT EXISTS match_players (
        match_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        elo_before INTEGER DEFAULT 1000,
        elo_after INTEGER DEFAULT 1000,
        goals INTEGER DEFAULT 0,
        PRIMARY KEY (match_id, player_id),
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );
    `;

    const usersTables = `
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        elo_score INTEGER DEFAULT 1000,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        total_matches INTEGER DEFAULT 0,
        total_goals INTEGER DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const tournamentTable = `
      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('registering', 'in_progress', 'completed')),
        player_count INTEGER NOT NULL CHECK(player_count IN (4, 8)),
        creator_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME
      );
    `;

    const tournamentPlayersTable = `
      CREATE TABLE IF NOT EXISTS tournament_players (
        tournament_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        placement INTEGER,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tournament_id, player_id),
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );
    `

    this.db.run(tournamentTable, (err) => {
      if (err) {
        console.error('Error creating tournament tables', err);
      } else {
        console.log('Tournament tables created or already exist');
      }
    });

    this.db.run(tournamentPlayersTable, (err) => {
      if (err) {
        console.error('Error creating tournament tables', err);
      } else {
        console.log('Tournament tables created or already exist');
      }
    });

    this.db.all("PRAGMA table_info(matches)", (err, rows) => {
      if (err) {
        console.error('Error checking matches table schema:', err);
        return;
      }

      const hasTournamentId = rows.some(row => row.name === 'tournament_id');

      if (!hasTournamentId) {
        this.db.run(
          `ALTER TABLE matches ADD COLUMN tournament_id INTEGER NULL 
              REFERENCES tournaments(id) 
              ON DELETE SET NULL`, (err) => {
          if (err)
            console.error('Error adding tournament_id column to matches table:', err);
          else
            console.log('Added tournament_id column to matches table');
        }
        );
      }
    }
    );

    this.db.run(matchesTable, (err) => {
      if (err) {
        console.error('Error creating matches table', err);
      } else {
        console.log('Matchmaking table created or already exists');
      }
    });

    this.db.run(matchPlayersTable, (err) => {
      if (err) {
        console.error('Error creating match_players table', err);
      } else {
        console.log('Matchmaking table created or already exists');
      }
    });

    this.db.run(usersTables, (err) => {
      if (err) {
        console.error('Error creating players table', err);
      } else {
        console.log('Matchmaking table created or already exists');
      }
    });
  }

  // Rest of the code remains the same
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('SQL Error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error('SQL Error:', err);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Get player by ID
  async getPlayerById(playerId) {
    try {
      const rows = await this.query(
        'SELECT * FROM players WHERE id = ?',
        [playerId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting player:', error);
      throw error;
    }
  }

  // Update player ELO
  async updatePlayerElo(playerId, newElo) {
    try {
      await this.run(
        'UPDATE players SET elo_score = ? WHERE id = ?',
        [newElo, playerId]
      );
    } catch (error) {
      console.error('Error updating player ELO:', error);
      throw error;
    }
  }

  // Update match result with ELO information
  async updateMatchResult(matchId, winnerId, player1Id, player2Id, player1Goals, player2Goals, eloData) {
    try {
      // Begin transaction
      await this.run('BEGIN TRANSACTION');

      // Update match status
      await this.run(
        `UPDATE matches 
         SET status = 'completed', 
             winner_id = ?, 
             completed_at = DATETIME('now') 
         WHERE id = ?`,
        [winnerId, matchId]
      );

      // Update player 1 stats
      await this.run(
        `UPDATE match_players 
         SET goals = ?, 
             elo_before = ?, 
             elo_after = ? 
         WHERE match_id = ? AND player_id = ?`,
        [
          player1Goals,
          eloData.player1OldElo,
          eloData.player1NewElo,
          matchId,
          player1Id
        ]
      );

      // Update player 2 stats
      await this.run(
        `UPDATE match_players 
         SET goals = ?, 
             elo_before = ?, 
             elo_after = ? 
         WHERE match_id = ? AND player_id = ?`,
        [
          player2Goals,
          eloData.player2OldElo,
          eloData.player2NewElo,
          matchId,
          player2Id
        ]
      );

      // Update player 1 overall stats
      const isPlayer1Winner = winnerId === player1Id;
      await this.run(
        `UPDATE players 
         SET elo_score = ?, 
             wins = wins + ?, 
             losses = losses + ?, 
             total_matches = total_matches + 1, 
             total_goals = total_goals + ? 
         WHERE id = ?`,
        [
          eloData.player1NewElo,
          isPlayer1Winner ? 1 : 0,
          isPlayer1Winner ? 0 : 1,
          player1Goals,
          player1Id
        ]
      );

      // Update player 2 overall stats
      const isPlayer2Winner = winnerId === player2Id;
      await this.run(
        `UPDATE players 
         SET elo_score = ?, 
             wins = wins + ?, 
             losses = losses + ?, 
             total_matches = total_matches + 1, 
             total_goals = total_goals + ? 
         WHERE id = ?`,
        [
          eloData.player2NewElo,
          isPlayer2Winner ? 1 : 0,
          isPlayer2Winner ? 0 : 1,
          player2Goals,
          player2Id
        ]
      );

      // Commit transaction
      await this.run('COMMIT');

      return {
        matchId,
        winner: winnerId,
        finalScore: {
          player1: player1Goals,
          player2: player2Goals
        },
        eloChanges: {
          player1: {
            before: eloData.player1OldElo,
            after: eloData.player1NewElo,
            change: eloData.player1NewElo - eloData.player1OldElo
          },
          player2: {
            before: eloData.player2OldElo,
            after: eloData.player2NewElo,
            change: eloData.player2NewElo - eloData.player2OldElo
          }
        }
      };
    } catch (error) {
      // Rollback transaction on error
      await this.run('ROLLBACK');
      console.error('Error updating match result:', error);
      throw error;
    }
  }

  closeDatabase() {
    try {
      if (this.db) {
        this.db.close();
        console.log("Database connection closed");
      }
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }

  getInstance() {
    return this.db;
  }

  // Method to get player history
  async getPlayerHistory(playerId, limit = 10, offset = 0) {
    try {
      const query = `
      SELECT 
        m.id as match_id,
        m.match_type,
        m.winner_id,
        m.completed_at,
        m.started_at,
        
        -- Current player info
        mp_current.player_id as player_id,
        mp_current.goals as player_goals,
        mp_current.elo_before as player_elo_before,
        mp_current.elo_after as player_elo_after,
        
        -- Opponent info
        mp_opponent.player_id as opponent_id,
        mp_opponent.goals as opponent_goals,
        
        -- Calculate duration in seconds
        CAST((julianday(m.completed_at) - julianday(m.started_at)) * 86400 AS INTEGER) as duration_seconds,
        
        -- Determine outcome
        CASE 
          WHEN m.winner_id = ? THEN 'win'
          WHEN m.winner_id IS NULL THEN 'draw'
          ELSE 'lose'
        END as outcome
        
      FROM matches m
      
      -- Join current player
      JOIN match_players mp_current ON m.id = mp_current.match_id 
        AND mp_current.player_id = ?
      
      -- Join opponent player  
      JOIN match_players mp_opponent ON m.id = mp_opponent.match_id 
        AND mp_opponent.player_id != ?
      
      WHERE m.status = 'completed'
        AND m.match_type = '1v1'  -- Only 1v1 matches for history
        AND m.started_at IS NOT NULL
        AND m.completed_at IS NOT NULL
      
      ORDER BY m.completed_at DESC
      LIMIT ? OFFSET ?
    `;

      const rows = await this.query(query, [playerId, playerId, playerId, limit, offset]);

      // Format the results
      const history = rows.map(row => ({
        matchId: row.match_id,
        opponent: {
          id: row.opponent_id,
          nickname: `Player ${row.opponent_id}` // You'll need to get this from your main users table
        },
        result: `${row.player_goals} - ${row.opponent_goals}`,
        outcome: row.outcome,
        played: this.formatTimeAgo(row.completed_at),
        duration: this.formatDuration(row.duration_seconds),
        eloChange: row.player_elo_after - row.player_elo_before,
        matchType: row.match_type,
        completedAt: row.completed_at,
        startedAt: row.started_at
      }));

      return history;
    } catch (error) {
      console.error('Error getting player history:', error);
      throw error;
    }
  }

  // Helper method to format time ago
  formatTimeAgo(dateString) {
    const now = new Date();
    const completed = new Date(dateString);
    const diffInSeconds = Math.floor((now - completed) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Helper method to format duration
  formatDuration(durationInSeconds) {
    if (!durationInSeconds || durationInSeconds <= 0) return 'N/A';

    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
      return `${seconds} sec${seconds > 1 ? 's' : ''}`;
    }
  }

  // Method to get player history with opponent nicknames
  async getPlayerHistoryWithNicknames(playerId, limit = 10, offset = 0) {
    try {
      // First get the basic history
      const history = await this.getPlayerHistory(playerId, limit, offset);

      // You'll need to implement this based on how you access your main users database
      // For example, if you have a method to get user info:
      for (let match of history) {
        try {
          // Replace this with your actual method to get user info
          const opponentInfo = await this.getUserInfo(match.opponent.id);
          if (opponentInfo) {
            match.opponent.nickname = opponentInfo.nickname || opponentInfo.fullName || `Player ${match.opponent.id}`;
          }
        } catch (error) {
          console.warn(`Could not get nickname for player ${match.opponent.id}`);
          // Keep default nickname
        }
      }

      return history;
    } catch (error) {
      console.error('Error getting player history with nicknames:', error);
      throw error;
    }
  }

  // Get match statistics for a player
  async getPlayerStats(playerId) {
    try {
      const query = `
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN winner_id != ? AND winner_id IS NOT NULL THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN winner_id IS NULL THEN 1 ELSE 0 END) as draws,
        AVG(
          CASE 
            WHEN started_at IS NOT NULL AND completed_at IS NOT NULL 
            THEN CAST((julianday(completed_at) - julianday(started_at)) * 86400 AS INTEGER)
            ELSE NULL 
          END
        ) as avg_duration_seconds,
        p.elo_score as current_elo
      FROM matches m
      JOIN match_players mp ON m.id = mp.match_id
      JOIN players p ON p.id = ?
      WHERE mp.player_id = ? 
        AND m.status = 'completed'
        AND m.match_type = '1v1'
    `;

      const rows = await this.query(query, [playerId, playerId, playerId, playerId]);
      const stats = rows[0];

      return {
        totalMatches: stats.total_matches || 0,
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        draws: stats.draws || 0,
        winRate: stats.total_matches > 0 ? ((stats.wins / stats.total_matches) * 100).toFixed(1) : '0.0',
        averageDuration: stats.avg_duration_seconds ? this.formatDuration(Math.floor(stats.avg_duration_seconds)) : 'N/A',
        currentElo: stats.current_elo || 1000
      };
    } catch (error) {
      console.error('Error getting player stats:', error);
      throw error;
    }
  }
}

export default new DatabaseConnection();