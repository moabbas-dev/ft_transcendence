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
           WHERE tournament_id = ? AND user_id = ?`,
          [tournamentId, userId],
          (err, row) => err? reject(err): resolve(row)
        );
      }) 

      if (existing) {
        return;
      }

      // Check if tournament is full
      const currentCount = await new Promise((resolve, reject) => {
        db.get(
         `SELECT COUNT(*) as count FROM tournament_players 
          WHERE tournament_id = ?`,
         [tournamentId],
         (err, row) => err? reject(err): resolve(row)
       );
      })

      if (currentCount.count >= tournament.player_count) {
        throw new Error('Tournament is already full');
      }

      // Add player to tournament
      await db.run(
        `INSERT INTO tournament_players (tournament_id, user_id) 
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

  // Start a tournament and create first round matches
  async startTournament(tournamentId) {
    try {
      const tournament = await new Promise((resolve, reject) => {
        db.get(
         `SELECT * FROM tournaments WHERE id = ?`,
         [tournamentId],
         (err, row) => err? reject(err): resolve(row)
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
          `SELECT tp.user_id, u.elo 
           FROM tournament_players tp
           JOIN users u ON tp.user_id = u.id
           WHERE tp.tournament_id = ?`,
          [tournamentId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      if (players.length !== tournament.player_count) {
        throw new Error(`Not enough players (${players.length}/${tournament.player_count})`);
      }

      // Update tournament status
      await db.run(
        `UPDATE tournaments SET status = 'in_progress', started_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [tournamentId]
      );

      // Randomize player order for fair matchmaking
      const shuffledPlayers = this.shufflePlayers(players);

      // Create first round matches
      const matches = [];
      for (let i = 0; i < shuffledPlayers.length; i += 2) {
        const player1 = shuffledPlayers[i];
        const player2 = shuffledPlayers[i + 1];

        const matchResult = await this.createTournamentMatch(
          tournamentId,
          player1.user_id,
          player2.user_id
        );

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
      const player1 = await new Promise((resolve, reject)=> {
        db.get(`SELECT id, elo FROM users WHERE id = ?`, [player1Id], (err, row) => err? reject(err): resolve(row));
      }) 
      const player2 = await new Promise((resolve, reject) => {
        db.get(`SELECT id, elo FROM users WHERE id = ?`, [player2Id], (err, row) => err? reject(err): resolve(row));
      })

      // Create match record
      const matchResult = await db.run(
        `INSERT INTO matches (match_type, status) VALUES (?, ?)`,
        ['tournament', 'pending']
      );
      const matchId = matchResult.lastID;

      // Add players to match with their current ELO
      await db.run(
        `INSERT INTO match_players (match_id, user_id, elo_before) VALUES (?, ?, ?)`,
        [matchId, player1.id, player1.elo]
      );
      await db.run(
        `INSERT INTO match_players (match_id, user_id, elo_before) VALUES (?, ?, ?)`,
        [matchId, player2.id, player2.elo]
      );

      return {
        matchId,
        tournamentId,
        player1: { id: player1.id, elo: player1.elo },
        player2: { id: player2.id, elo: player2.elo }
      };
    } catch (error) {
      console.error('Error creating tournament match:', error);
      throw error;
    }
  }

  // Handle tournament match result and progress tournament
  async updateTournamentMatchResult(matchId, winnerId) {
    try {
      // First update the match result (similar to regular match)
      const match = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM matches WHERE id = ?`, [matchId], (err, row) => err? reject(err): resolve(row));
      })
      if (!match || match.status === 'completed' || match.match_type !== 'tournament') {
        throw new Error('Tournament match not found or already completed');
      }

      // Get players in this match
      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT mp.*, u.elo FROM match_players mp 
           JOIN users u ON mp.user_id = u.id
           WHERE mp.match_id = ?`,
          [matchId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      const winner = players.find(p => p.user_id === winnerId);
      const loser = players.find(p => p.user_id !== winnerId);

      if (!winner) {
        throw new Error('Winner not found in this match');
      }

      // Calculate new ELO ratings (smaller K-factor for tournaments)
      const tournamentEloService = new EloService({ kFactor: 16 });
      const winnerNewElo = tournamentEloService.calculateNewRatings(
        winner.elo, loser.elo, true
      );
      const loserNewElo = tournamentEloService.calculateNewRatings(
        loser.elo, winner.elo, false
      );

      // Update match_players with scores and new ELO
      await db.run(
        `UPDATE match_players SET score = 1, elo_after = ? WHERE match_id = ? AND user_id = ?`,
        [winnerNewElo, matchId, winner.user_id]
      );
      await db.run(
        `UPDATE match_players SET score = 0, elo_after = ? WHERE match_id = ? AND user_id = ?`,
        [loserNewElo, matchId, loser.user_id]
      );

      // Update match status
      await db.run(
        `UPDATE matches SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [matchId]
      );

      // Find tournament for this match by querying related players
      const tournamentPlayers = await new Promise((resolve, reject) => {
        db.get(
          `SELECT tournament_id FROM tournament_players 
           WHERE user_id = ? OR user_id = ? 
           LIMIT 1`,
          [winner.user_id, loser.user_id],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      if (!tournamentPlayers) {
        throw new Error('Tournament not found for this match');
      }

      const tournamentId = tournamentPlayers.tournament_id;

      // Check if we need to create next round matches
      await this.progressTournament(tournamentId);

      // Update user stats in auth service
      await this.updateUserStats(winner.user_id, winnerNewElo, true);
      await this.updateUserStats(loser.user_id, loserNewElo, false);

      return {
        matchId,
        tournamentId,
        winner: { id: winner.user_id, newElo: winnerNewElo },
        loser: { id: loser.user_id, newElo: loserNewElo }
      };
    } catch (error) {
      console.error('Error updating tournament match:', error);
      throw error;
    }
  }

  // Progress tournament to next round or complete it
  async progressTournament(tournamentId) {
    try {
      const tournament = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournaments WHERE id = ?`,
          [tournamentId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      if (!tournament || tournament.status !== 'in_progress') {
        throw new Error('Tournament not found or not in progress');
      }

      // Get all completed matches for this tournament
      const completedMatches = await new Promise((resolve, reject) => {
        db.all(
          `SELECT m.id, m.status, mp.user_id, mp.score
           FROM matches m
           JOIN match_players mp ON m.id = mp.match_id
           JOIN tournament_players tp ON mp.user_id = tp.user_id
           WHERE tp.tournament_id = ? AND m.match_type = 'tournament' AND m.status = 'completed'`,
          [tournamentId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      // Group by match ID to get winners
      const matchResults = {};
      completedMatches.forEach(match => {
        if (!matchResults[match.id]) {
          matchResults[match.id] = [];
        }
        matchResults[match.id].push(match);
      });

      // Extract winners
      const winners = Object.values(matchResults)
        .map(players => {
          // Find player with score 1 (winner)
          return players.find(p => p.score === 1)?.user_id;
        })
        .filter(Boolean);

      // Get total matches needed for tournament
      // 4 players = 3 matches (2 semifinals + 1 final)
      // 8 players = 7 matches (4 quarterfinals + 2 semifinals + 1 final)
      const totalMatches = tournament.player_count - 1;
      const completedMatchCount = Object.keys(matchResults).length;

      if (completedMatchCount === totalMatches) {
        // Tournament is complete, update final placements
        await this.completeTournament(tournamentId, winners);
        return { status: 'completed', winnerId: winners[winners.length - 1] };
      } else {
        // Create next round matches
        const nextRoundMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
          // Make sure we have pairs
          if (i + 1 < winners.length) {
            const match = await this.createTournamentMatch(
              tournamentId,
              winners[i],
              winners[i + 1]
            );
            nextRoundMatches.push(match);
          }
        }
        return { status: 'in_progress', nextRoundMatches };
      }
    } catch (error) {
      console.error('Error progressing tournament:', error);
      throw error;
    }
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
         WHERE tournament_id = ? AND user_id = ?`,
        [tournamentId, champion]
      );

      // We could calculate other placements based on when they lost
      // For simplicity, let's just mark everyone else as placed 2
      await db.run(
        `UPDATE tournament_players SET placement = 2
         WHERE tournament_id = ? AND user_id != ?`,
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
      // Get tournament info
      const tournament = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM tournaments WHERE id = ?`,
          [tournamentId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get all players
      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT tp.user_id, tp.placement, tp.joined_at
           FROM tournament_players tp
           WHERE tp.tournament_id = ?`,
          [tournamentId],
          (err, rows) => err? reject(err): resolve(rows)
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
          (err, row) => err? reject(err): resolve(row)
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
          player_id: match.user_id,
          score: match.score,
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

  // Update user stats in the auth service
  async updateUserStats(userId, newElo, isWin) {
    // Implementation depends on your microservice communication strategy
    // Similar to the method in matchmaking service
  }

  // Add to TournamentService in tournament.js
  async getActiveTournaments() {
    try {
      const tournaments = await new Promise((resolve, reject) => {
        db.all(
          `SELECT t.*, COUNT(tp.user_id) as registered_players_count
         FROM tournaments t
         LEFT JOIN tournament_players tp ON t.id = tp.tournament_id
         WHERE t.status IN ('registering', 'in_progress')
         GROUP BY t.id
         ORDER BY t.created_at DESC`,
         (err, row) => err? reject(err): resolve(row)
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
          `SELECT m.*, tm.tournament_id 
         FROM matches m
         JOIN tournaments_matches tm ON m.id = tm.match_id
         WHERE m.id = ?`,
          [matchId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      if (!match) return null;

      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT mp.*, p.elo_score, u.nickname 
         FROM match_players mp
         JOIN players p ON mp.player_id = p.id
         LEFT JOIN users u ON mp.player_id = u.id
         WHERE mp.match_id = ?`,
          [matchId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      return { match, players };
    } catch (error) {
      console.error('Error fetching tournament match with players:', error);
      throw error;
    }
  }

  async getMatchWithPlayers(matchId) {
    try {
      const match = await new Promise((resolve, reject) => {
        db.get(
          `SELECT m.*, tm.tournament_id 
           FROM matches m
           JOIN tournaments_matches tm ON m.id = tm.match_id
           WHERE m.id = ?`,
          [matchId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      if (!match) return null;

      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT mp.*, p.elo_score, u.nickname 
           FROM match_players mp
           JOIN players p ON mp.player_id = p.id
           LEFT JOIN users u ON mp.player_id = u.id
           WHERE mp.match_id = ?`,
          [matchId],
          (err, row) => err? reject(err): resolve(row)
        );
      })

      return { match, players };
    } catch (error) {
      console.error('Error fetching tournament match with players:', error);
      throw error;
    }
  }

  async notifyTournamentProgress(tournamentId, matchId, wsAdapter) {
    try {
      const tournamentDetails = await this.getTournamentDetails(tournamentId);

      const matchDetails = tournamentDetails.matches.find(m => m.id === matchId);

      if (!matchDetails) {
        throw new Error(`Match ${matchId} not found in tournament ${tournamentId}`);
      }

      const playerIds = tournamentDetails.players.map(p => p.user_id);

      playerIds.forEach(playerId => {
        wsAdapter.sendToClient(playerId, 'tournament_match_completed', {
          tournamentId,
          matchId,
          match: matchDetails,
          tournament: tournamentDetails.tournament,
          matches: tournamentDetails.matches
        });
      });

      if (tournamentDetails.tournament.status === 'completed') {
        const champion = tournamentDetails.players.find(p => p.placement === 1);

        playerIds.forEach(playerId => {
          wsAdapter.sendToClient(playerId, 'tournament_completed', {
            tournamentId,
            tournament: tournamentDetails.tournament,
            champion: champion ? champion.user_id : null,
            players: tournamentDetails.players
          });
        });
      }
      else {
        const pendingMatches = tournamentDetails.matches.filter(m =>
          m.status === 'pending' &&
          m.players &&
          m.players.length === 2
        );

        pendingMatches.forEach(match => {
          match.players.forEach(player => {
            const opponent = match.players.find(p => p.user_id !== player.user_id);

            if (opponent) {
              wsAdapter.sendToClient(player.user_id, 'tournament_match_notification', {
                tournamentId,
                matchId: match.id,
                opponent: {
                  id: opponent.user_id,
                  username: opponent.nickname || `Player ${opponent.user_id}`,
                  elo: opponent.elo_before
                },
                round: match.round || 0
              });
            }
          });
        });
      }
    } catch (error) {
      console.error(`Error notifying tournament progress: ${error.message}`);
    }
  }
}

export default new TournamentService();