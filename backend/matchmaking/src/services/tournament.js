import database from '../config/db.js';
import EloService from './elo.js';

const db = database.getInstance();

class TournamentService {
  constructor() {
    this.eloService = EloService;
  }

  // Create a new tournament
  async createTournament(name, playerCount) {
    if (playerCount !== 4 && playerCount !== 8) {
      throw new Error('Tournament must have 4 or 8 players');
    }

    try {
      const tournamentId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO tournaments (name, status, player_count) 
           VALUES (?, ?, ?)`,
          [name, 'registering', playerCount],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      })

      return {
        id: tournamentId,
        name,
        status: 'registering',
        playerCount
      };
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  // Register a player for a tournament
  async registerPlayer(tournamentId, userId) {
    try {
      const tournament = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournaments WHERE id = ?`,
          [tournamentId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      })

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'registering') {
        throw new Error('Tournament is not open for registration');
      }

      // Check if user is already registered
      const existing = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournament_players 
           WHERE tournament_id = ? AND player_id = ?`,
          [tournamentId, userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      })

      if (existing) {
        throw new Error('Player is already registered for this tournament');
      }

      // Check if tournament is full
      const currentCount = await new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as count FROM tournament_players 
          WHERE tournament_id = ?`,
          [tournamentId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      })
      console.log("[COUNT]: ", currentCount.count >= tournament.player_count);

      if (currentCount.count >= tournament.player_count) {
        throw new Error('Tournament is already full');
      }

      // Add player to tournament
      await db.run(
        `INSERT INTO tournament_players (tournament_id, player_id) 
         VALUES (?, ?)`,
        [tournamentId, userId]
      );

      // If tournament is now full, we could automatically start it
      if (currentCount.count + 1 === tournament.player_count) {
        await this.startTournament(tournamentId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error registering player:', error);
      throw error;
    }
  }

  async removePlayerFromTournament(tournamentId, userId) {
    try {
      const tournament = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournaments WHERE id = ?`,
          [tournamentId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'registering') {
        throw new Error('Cannot leave tournament that has already started');
      }

      await db.run(
        `DELETE FROM tournament_players 
       WHERE tournament_id = ? AND player_id = ?`,
        [tournamentId, userId]
      );

      return { success: true };
    } catch (error) {
      console.error('Error removing player from tournament:', error);
      throw error;
    }
  }

  // Start a tournament and create first round matches
  async startTournament(tournamentId) {
    try {
      const tournament = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournaments WHERE id = ?`,
          [tournamentId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      })

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'registering') {
        throw new Error('Tournament already started or completed');
      }

      // Get all players
      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT tp.player_id, p.elo_score
           FROM tournament_players tp
           JOIN players p ON tp.player_id = p.id
           WHERE tp.tournament_id = ?`,
          [tournamentId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      })

      if (players.length !== tournament.player_count) {
        throw new Error(`Not enough players (${players.length}/${tournament.player_count})`);
      }

      // Update tournament status
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE tournaments SET status = 'in_progress', started_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [tournamentId],
          (err) => err ? reject(err) : resolve()
        );
      });

      // Randomize player order for fair matchmaking
      const shuffledPlayers = this.shufflePlayers(players);

      // Create first round matches
      const matches = [];
      for (let i = 0; i < shuffledPlayers.length; i += 2) {
        const player1 = shuffledPlayers[i];
        const player2 = shuffledPlayers[i + 1];

        const matchResult = await this.createTournamentMatch(
          tournamentId,
          player1.player_id,
          player2.player_id
        );
        console.log("Tournament Match Created: ", matchResult);
        matches.push(matchResult);
      }

      return {
        tournamentId,
        status: 'in_progress',
        firstRoundMatches: matches
      };
    } catch (error) {
      console.error('Error starting tournament:', error);
      throw error;
    }
  }

  // Create a match between two tournament players
  async createTournamentMatch(tournamentId, player1Id, player2Id) {
    try {
      const player1 = await new Promise((resolve, reject) => {
        db.get(`SELECT id, elo_score FROM players WHERE id = ?`, [player1Id], (err, row) => err ? reject(err) : resolve(row));
      })
      const player2 = await new Promise((resolve, reject) => {
        db.get(`SELECT id, elo_score FROM players WHERE id = ?`, [player2Id], (err, row) => err ? reject(err) : resolve(row));
      })

      if (!player1 || !player2) {
        throw new Error(`Player not found: ${!player1 ? player1Id : player2Id}`);
      }

      // Create match record
      const matchResult = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO matches (match_type, status, tournament_id) VALUES (?, ?, ?)`,
          ['tournament', 'pending', tournamentId],
          function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID });
          }
        );
      });

      const matchId = matchResult.lastID;
      if (!matchId) {
        throw new Error('Failed to create match - no ID returned');
      }
      console.log(`Created tournament match ${matchId} for tournament ${tournamentId}`);

      // Add players to match with their current ELO
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO match_players (match_id, player_id, elo_before, elo_after, goals) VALUES (?, ?, ?, ?, ?)`,
          [matchId, player1.id, player1.elo_score, player1.elo_score, 0],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO match_players (match_id, player_id, elo_before, elo_after, goals) VALUES (?, ?, ?, ?, ?)`,
          [matchId, player2.id, player2.elo_score, player2.elo_score, 0],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      return {
        matchId,
        tournamentId,
        player1: { id: player1.id, elo_score: player1.elo_score },
        player2: { id: player2.id, elo_score: player2.elo_score }
      };
    } catch (error) {
      console.error('Error creating tournament match:', error);
      throw error;
    }
  }

  // Handle tournament match result and progress tournament
  async updateTournamentMatchResult(matchId, winnerId, finalScore = null) {
    try {
      console.log(`Processing tournament match result: Match ${matchId}, Winner ${winnerId}`);

      const matchWithPlayers = await this.getMatchWithPlayers(matchId);
      if (!matchWithPlayers) {
        throw new Error(`Match ${matchId} not found`);
      }

      const { match, players } = matchWithPlayers;
      if (match.status === 'completed') {
        console.log(`Match ${matchId} already completed`);
        return { alreadyCompleted: true };
      }

      if (match.match_type !== 'tournament') {
        throw new Error(`Match ${matchId} is not a tournament match`);
      }

      const winner = players.find(p => String(p.player_id) === String(winnerId));
      const loser = players.find(p => String(p.player_id) !== String(winnerId));

      if (!winner || !loser) {
        throw new Error(`Invalid winner ID ${winnerId} for match ${matchId}`);
      }

      const winnerNewElo = EloService.calculateNewRatings(winner.elo_score, loser.elo_score, 1);
      const loserNewElo = EloService.calculateNewRatings(loser.elo_score, winner.elo_score, 0);

      // Get goals from finalScore or use defaults
      const winnerGoals = finalScore?.winner || 10;
      const loserGoals = finalScore?.loser || 0;

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE matches SET status = 'completed', winner_id = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [winnerId, matchId],
          (err) => err ? reject(err) : resolve()
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE match_players SET 
         elo_after = ?, 
         goals = ?
         WHERE match_id = ? AND player_id = ?`,
          [winnerNewElo, winnerGoals, matchId, winnerId],
          (err) => err ? reject(err) : resolve()
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE match_players SET 
         elo_after = ?, 
         goals = ?
         WHERE match_id = ? AND player_id = ?`,
          [loserNewElo, loserGoals, matchId, loser.player_id],
          (err) => err ? reject(err) : resolve()
        );
      });

      await this.updatePlayerStats(winnerId, winnerNewElo, true);
      await this.updatePlayerStats(loser.player_id, loserNewElo, false);

      console.log(`Match ${matchId} completed. Winner: ${winnerId}`);

      // Progress tournament to next round
      const tournamentId = match.tournament_id;
      const progressResult = await this.progressTournament(tournamentId);

      return {
        matchId,
        tournamentId,
        winnerId,
        winnerGoals,
        loserGoals,
        winnerEloChange: winnerNewElo - winner.elo_score,
        loserEloChange: loserNewElo - loser.elo_score,
        tournamentStatus: progressResult.status,
        nextRoundMatches: progressResult.nextRoundMatches || null,
        champion: progressResult.champion || null
      };

    } catch (error) {
      console.error('Error updating tournament match:', error);
      throw error;
    }
  }

  // Progress tournament to next round or complete it
  async progressTournament(tournamentId) {
    try {
      console.log(`Progressing tournament ${tournamentId}`);
      const tournament = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournaments WHERE id = ?`,
          [tournamentId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!tournament || tournament.status !== 'in_progress') {
        throw new Error('Tournament not found or not in progress');
      }

      const allMatches = await new Promise((resolve, reject) => {
        db.all(
          `SELECT m.*, mp.player_id, mp.goals
           FROM matches m
           JOIN match_players mp ON m.id = mp.match_id
           WHERE m.tournament_id = ? AND m.match_type = 'tournament'
           ORDER BY m.created_at`,
          [tournamentId],
          (err, rows) => err ? reject(err) : resolve(rows)
        );
      });

      // Group matches by match_id
      const matchesMap = new Map();
      allMatches.forEach(row => {
        if (!matchesMap.has(row.id)) {
          matchesMap.set(row.id, {
            id: row.id,
            status: row.status,
            winner_id: row.winner_id,
            created_at: row.created_at,
            players: []
          });
        }
        matchesMap.get(row.id).players.push({
          player_id: row.player_id,
          goals: row.goals
        });
      });

      const matches = Array.from(matchesMap.values());
      const completedMatches = matches.filter(m => m.status === 'completed');
      const pendingMatches = matches.filter(m => m.status === 'pending');

      console.log(`Tournament ${tournamentId}: ${completedMatches.length} completed, ${pendingMatches.length} pending`);

      // Calculate total matches needed
      const totalMatches = tournament.player_count - 1;

      if (completedMatches.length === totalMatches) {
        // Tournament complete
        const finalMatch = completedMatches[completedMatches.length - 1];
        const champion = finalMatch.winner_id;

        await this.completeTournament(tournamentId, champion);
        console.log(`Tournament ${tournamentId} completed. Champion: ${champion}`);

        return {
          status: 'completed',
          champion,
          tournamentId
        };
      }

      // Check if next round can be created
      const winners = completedMatches.map(m => m.winner_id).filter(Boolean);
      const canCreateNextRound = this.canCreateNextRound(
        tournament.player_count,
        completedMatches.length,
        pendingMatches.length
      );

      if (canCreateNextRound && winners.length >= 2) {
        const nextRoundMatches = await this.createNextRoundMatches(
          tournamentId,
          winners,
          completedMatches.length
        );
        console.log(`Created ${nextRoundMatches.length} matches for next round`);

        return {
          status: 'in_progress',
          nextRoundMatches,
          tournamentId
        };
      }

      return {
        status: 'in_progress',
        tournamentId
      };
    } catch (error) {
      console.error('Error progressing tournament:', error);
      throw error;
    }
  }

  canCreateNextRound(playerCount, completedCount, pendingCount) {
    if (playerCount === 4) {
      // 4 players: 2 semifinals -> 1 final
      return completedCount === 2 && pendingCount === 0;
    } else if (playerCount === 8) {
      // 8 players: 4 quarterfinals -> 2 semifinals -> 1 final
      if (completedCount === 4 && pendingCount === 0) return true; // Create semifinals
      if (completedCount === 6 && pendingCount === 0) return true; // Create final
    }
    return false;
  }

  async createNextRoundMatches(tournamentId, winners, completedCount) {
    const nextRoundMatches = [];
    // Pair winners for next round
    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        const match = await this.createTournamentMatch(
          tournamentId,
          winners[i],
          winners[i + 1]
        );
        nextRoundMatches.push(match);
      }
    }
    return nextRoundMatches;
  }

  async updatePlayerStats(playerId, newElo, isWin) {
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE players SET 
           elo_score = ?, 
           wins = wins + ?, 
           losses = losses + ?, 
           total_matches = total_matches + 1 
         WHERE id = ?`,
        [newElo, isWin ? 1 : 0, isWin ? 0 : 1, playerId],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  // Complete tournament and assign final placements
  async completeTournament(tournamentId, winners) {
    try {
      // Winner is the last winner (of the final match)
      const champion = winners[winners.length - 1];

      // Update tournament status
      await db.run(
        `UPDATE tournaments SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [tournamentId]
      );

      // Set winner's placement to 1
      await db.run(
        `UPDATE tournament_players SET placement = 1
         WHERE tournament_id = ? AND player_id = ?`,
        [tournamentId, champion]
      );

      // We could calculate other placements based on when they lost
      // For simplicity, let's just mark everyone else as placed 2
      await db.run(
        `UPDATE tournament_players SET placement = 2
         WHERE tournament_id = ? AND player_id != ?`,
        [tournamentId, champion]
      );

      return { tournamentId, champion };
    } catch (error) {
      console.error('Error completing tournament:', error);
      throw error;
    }
  }

  // Get tournament details with matches and players
  async getTournamentDetails(tournamentId) {
    try {
      if (isNaN(tournamentId) || tournamentId <= 0) {
        return null;
      }

      const tournament = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournaments WHERE id = ?`,
          [tournamentId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      })

      if (!tournament) {
        return null
      }

      // Get all players
      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT tp.player_id, tp.placement, tp.joined_at
           FROM tournament_players tp
           WHERE tp.tournament_id = ?`,
          [tournamentId],
          (err, rows) => err ? reject(err) : resolve(rows)
        );
      });

      // Get all matches
      const matches = await new Promise((resolve, reject) => {
        db.all(
          `SELECT m.*, mp.player_id, mp.elo_before, mp.elo_after, mp.goals
            FROM matches m
            JOIN match_players mp ON m.id = mp.match_id
            WHERE m.tournament_id = ? AND m.match_type = 'tournament'
            ORDER BY m.created_at`,
          [tournamentId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      })

      // Organize matches by round (simplified)
      const groupedMatches = {};
      matches.forEach(match => {
        if (!groupedMatches[match.id]) {
          groupedMatches[match.id] = {
            id: match.id,
            status: match.status,
            round: match.round || 0,
            position: match.position || 0,
            created_at: match.created_at,
            completed_at: match.completed_at,
            players: []
          };
        }
        groupedMatches[match.id].players.push({
          player_id: match.player_id,
          elo_before: match.elo_before,
          elo_after: match.elo_after,
          goals: match.goals
        });
      });

      const tournamentMatches = Object.values(groupedMatches);

      return {
        tournament,
        players,
        matches: tournamentMatches
      };
    } catch (error) {
      console.error('Error getting tournament details:', error);
      throw error;
    }
  }

  // Helper to randomize player order for fair matchmaking
  shufflePlayers(players) {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Add to TournamentService in tournament.js
  async getActiveTournaments() {
    try {
      const tournaments = await new Promise((resolve, reject) => {
        db.all(
          `SELECT t.*, COUNT(tp.player_id) as registered_players_count
         FROM tournaments t
         LEFT JOIN tournament_players tp ON t.id = tp.tournament_id
         WHERE t.status IN ('registering', 'in_progress')
         GROUP BY t.id
         ORDER BY t.created_at DESC`,
          (err, row) => err ? reject(err) : resolve(row)
        );
      })

      return tournaments.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        player_count: tournament.player_count,
        registered_players: tournament.registered_players_count,
        created_at: tournament.created_at
      }));
    } catch (error) {
      console.error('Error fetching active tournaments:', error);
      throw error;
    }
  }

  async getMatchWithPlayers(matchId) {
    try {
      const match = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM matches WHERE id = ?`,
          [matchId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!match) return null;

      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT mp.*, p.elo_score
           FROM match_players mp
           JOIN players p ON mp.player_id = p.id
           WHERE mp.match_id = ?`,
          [matchId],
          (err, rows) => err ? reject(err) : resolve(rows)
        );
      });

      return { match, players };
    } catch (error) {
      console.error('Error fetching tournament match with players:', error);
      throw error;
    }
  }

  async getUserTournaments(userId, limit = 10, offset = 0) {
    try {
      const tournaments = await new Promise((resolve, reject) => {
        db.all(
          `SELECT t.*, 
          COUNT(tp.player_id) as registered_players_count,
          CASE WHEN t.creator_id = ? THEN 1 ELSE 0 END as is_creator,
          CASE WHEN user_tp.player_id IS NOT NULL THEN 1 ELSE 0 END as is_participant
          FROM tournaments t
          LEFT JOIN tournament_players tp ON t.id = tp.tournament_id
          LEFT JOIN tournament_players user_tp ON t.id = user_tp.tournament_id AND user_tp.player_id = ?
          WHERE t.creator_id = ? OR user_tp.player_id = ?
          GROUP BY t.id
          ORDER BY t.created_at DESC
          LIMIT ? OFFSET ?`,
          [userId, userId, userId, userId, limit, offset],
          (err, rows) => err ? reject(err) : resolve(rows)
        );
      });

      return tournaments.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        player_count: tournament.player_count,
        registered_players: tournament.registered_players_count,
        created_at: tournament.created_at,
        started_at: tournament.started_at,
        completed_at: tournament.completed_at,
        is_creator: Boolean(tournament.is_creator),
        is_participant: Boolean(tournament.is_participant)
      }));
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
      throw error;
    }
  }
}

export default new TournamentService();