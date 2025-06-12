import database from "../config/db.js"
import EloService from "./elo.js"

const Match = Object.freeze({
    ONLINE_MATCH: '1v1',
    FRIEND_MATCH: 'friendly'
})

const MatchStatus = Object.freeze({
    PENDING: "pending",
    COMPLETED: "completed"
})

const db = database.getInstance()

class MatchmakingService {
    constructor() {
        this.eloService = EloService;
        this.waitingPlayers = [];
        this.rangeIncrement = 50;
    }

    async updateMatchStartTime(matchId) {
        try {
            await database.updateMatchStartTime(matchId);
            return true;
        } catch (error) {
            console.error('Error updating match start time in service:', error);
            return false;
        }
    }

    //add a player looking for a match
    async addToQueue(playerId) {
        try {
            // Convert playerId to string to ensure consistent handling
            const playerIdStr = String(playerId);

            // Get or create user with consistent ID format
            let user = await this.getUserWithElo(playerIdStr);

            if (!user) {
                user = await this.createNewUserRecord(playerIdStr);
            }
            console.log(`user ${user.id} has elo ${user.elo_score}`);

            // Check if player is already in queue
            const existingPlayer = this.waitingPlayers.find(p => p.playerId === user.id);
            if (existingPlayer) {
                console.log(`Player ${user.id} is already in queue`);
                return null;
            }

            // Add to waiting queue with consistent ID format
            this.waitingPlayers.push({
                playerId: user.id,
                elo: user.elo_score,
                joinedAt: Date.now()
            });

            // Debug log to see queue state
            console.log("Current queue:", this.waitingPlayers.map(p => p.playerId));

            // Only try to find a match if there are at least 2 different players in queue
            const uniquePlayerIds = new Set(this.waitingPlayers.map(p => p.playerId));
            if (uniquePlayerIds.size >= 2) {
                // Find a match with another player
                const match = await this.findMatch(user.id, user.elo_score);

                // Only remove from queue if match is found
                if (match) {
                    return match;
                }
                return null;
            } else {
                console.log(`Not enough players in queue. Current size: ${this.waitingPlayers.length}`);
                return null;
            }
        } catch (error) {
            console.error('Error adding to queue:', error);
            return null;
        }
    }

    // Remove a player from the waiting queue
    removeFromQueue(playerId) {
        const playerIdStr = String(playerId);
        const beforeLength = this.waitingPlayers.length;

        // Filter out the player from the queue
        this.waitingPlayers = this.waitingPlayers.filter(player => String(player.playerId) !== playerIdStr);

        const afterLength = this.waitingPlayers.length;
        const wasRemoved = beforeLength > afterLength;

        console.log(`Player ${playerIdStr} removed from queue: ${wasRemoved ? 'Yes' : 'No'}`);
        console.log(`Queue before: ${beforeLength}, Queue after: ${afterLength}`);
        console.log("Current queue:", this.waitingPlayers.map(p => p.playerId));
    }

    /**
      * Get players for a specific match
      * @param {number} matchId - The match ID
      * @returns {Promise<Array>} - Array of player objects
      */
    async getMatchPlayers(matchId) {
        try {
            return new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM match_players WHERE match_id = ?`,
                    [matchId],
                    (err, rows) => {
                        if (err) {
                            console.error(`Error getting match players for match ${matchId}:`, err);
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    }
                );
            });
        } catch (error) {
            console.error(`Error getting match players for match ${matchId}:`, error);
            throw error;
        }
    }


    // Find a suitable opponent
    async findMatch(playerId, userElo) {
        try {
            const playerIdStr = String(playerId);
            console.log(`Finding match for player ${playerIdStr} with ELO ${userElo}`);

            // Don't match against self - make sure we're filtering correctly
            const possibleOpponents = this.waitingPlayers.filter(p => String(p.playerId) !== playerIdStr);

            console.log(`Possible opponents: ${JSON.stringify(possibleOpponents.map(p => p.playerId))}`);

            if (possibleOpponents.length === 0) {
                console.log(`No possible opponents found for player ${playerIdStr}`);
                return null;
            }

            // Initially look for close ELO
            let range = this.rangeIncrement;
            let opponent = null;

            // Gradually increase range if no match found
            while (!opponent && range <= 500) {
                opponent = possibleOpponents.find(p => Math.abs(p.elo - userElo) <= range);
                range += this.rangeIncrement;
            }

            // If still no match, take the closest available opponent
            if (!opponent && possibleOpponents.length > 0) {
                opponent = possibleOpponents.reduce((closest, current) => {
                    return (Math.abs(current.elo - userElo) < Math.abs(closest.elo - userElo))
                        ? current : closest;
                }, possibleOpponents[0]);
            }

            if (!opponent) {
                console.log(`No opponent found for player ${playerIdStr} after all attempts`);
                return null;
            }

            console.log(`Found opponent ${opponent.playerId} for player ${playerIdStr}`);

            // Double-check that we're not matching against self
            if (String(opponent.playerId) === playerIdStr) {
                console.error(`ERROR: Attempted to match player ${playerIdStr} against themselves`);
                return null;
            }

            // Remove both players from queue
            this.removeFromQueue(playerIdStr);
            this.removeFromQueue(opponent.playerId);

            // Create a match
            return this.createMatch(playerIdStr, opponent.playerId, Match.ONLINE_MATCH);
        } catch (err) {
            console.log("[MATCHMAKING] Error finding match:", err);
            return null;
        }
    }

    /**
     * Create a new match between two players.
     *
     * @async
     * @function createMatch
     * @param {number|string} player1Id    - Unique identifier of the first player.
     * @param {number|string} player2Id    - Unique identifier of the second player.
     * @param {string}         matchType   - Type of match to create (e.g., "ONLINE_MATCH").
     * @returns {Promise<{
     *   matchId: number,
     *   player1: { id: number|string, elo_score: number },
     *   player2: { id: number|string, elo_score: number }
     * }>} Resolves with the created match ID and player info.
     * @throws {Error} If the match cannot be created or a database error occurs.
     */
    async createMatch(player1Id, player2Id, matchType) {
        try {
            // Safety check to prevent matching a player against themselves
            if (String(player1Id) === String(player2Id)) {
                console.error(`[MATCHMAKING] Cannot create a match with the same player on both sides: ${player1Id}`);
                throw new Error(`Cannot create a match with the same player on both sides: ${player1Id}`);
            }

            const player1 = await this.getUserWithElo(player1Id);
            const player2 = await this.getUserWithElo(player2Id);

            // Insert new match
            const matchId = await this.insertNewMatch(
                `INSERT INTO matches (match_type, status) VALUES (?, ?)`,
                [matchType, MatchStatus.PENDING]
            );
            console.log("[MATCHMAKING] Created match with ID:", matchId);

            // Add both players to the match_players table
            // Note: elo_after is initially set to the same as elo_before
            // It will be updated when the match is completed
            await db.run(
                `INSERT INTO match_players (match_id, player_id, elo_before, elo_after, goals) VALUES (?, ?, ?, ?, ?)`,
                [matchId, player1.id, player1.elo_score, player1.elo_score, 0]
            );

            await db.run(
                `INSERT INTO match_players (match_id, player_id, elo_before, elo_after, goals) VALUES (?, ?, ?, ?, ?)`,
                [matchId, player2.id, player2.elo_score, player2.elo_score, 0]
            );

            console.log(`[MATCHMAKING] Found match for user ${player1Id} against opponent ${player2Id}`);

            return {
                matchId: matchId,
                player1: {
                    id: player1.id,
                    elo_score: player1.elo_score
                },
                player2: {
                    id: player2.id,
                    elo_score: player2.elo_score
                }
            };
        } catch (error) {
            console.error('Error creating match:', error);
            throw error;
        }
    }

    /**
 * Get the opponent ID for a player in a match
 * @param {string} playerId - ID of the player
 * @param {string} matchId - ID of the match
 * @returns {Promise<string|null>} - The opponent ID or null if not found
 */
    async getOpponentId(playerId, matchId) {
        try {
            const players = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT mp.player_id FROM match_players mp WHERE mp.match_id = ?`,
                    [matchId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            if (!players || players.length !== 2) {
                return null;
            }

            const opponent = players.find(p => p.player_id != playerId);
            return opponent ? opponent.player_id : null;
        } catch (error) {
            console.error(`Error getting opponent ID: ${error.message}`);
            return null;
        }
    }


    /**
     * Updates a user's statistics after a match is completed
     * @param {number} playerId - The ID of the user to update
     * @param {number} newElo - The new ELO rating for the user
     * @param {string} result - The result of the match ('win', 'loss', or 'draw')
     * @param {number} goals - The number of goals scored by the user
     * @returns {Promise<void>}
     */
    async updateUserStats(playerId, newElo, result, goals) {
        try {
            // Determine which stats to increment based on match result
            let winIncrement = 0;
            let lossIncrement = 0;
            let drawIncrement = 0;

            switch (result) {
                case 'win':
                    winIncrement = 1;
                    break;
                case 'loss':
                    lossIncrement = 1;
                    break;
                case 'draw':
                    drawIncrement = 1;
                    break;
                default:
                    throw new Error(`Invalid match result: ${result}`);
            }

            // Update user stats in a single transaction
            await db.run(
                `UPDATE players SET 
                elo_score = ?, 
                wins = wins + ?, 
                losses = losses + ?, 
                draws = draws + ?, 
                total_matches = total_matches + 1,
                total_goals = total_goals + ?
                WHERE id = ?`,
                [newElo, winIncrement, lossIncrement, drawIncrement, goals, playerId]
            );

            console.log(`Updated stats for user ${playerId}: new ELO ${newElo}, result: ${result}, goals: ${goals}`);
        } catch (error) {
            console.error(`Error updating user stats for user ${playerId}:`, error);
            throw error;
        }
    }

    /**
     * Updates player results in the match_players table
     * @param {number} matchId - The ID of the match
     * @param {Array<Object>} results - Array of player results objects
     * @param {number} results[].playerId - User ID of the player
     * @param {number} results[].score - Score value (0, 0.5, or 1)
     * @param {number} results[].newElo - New ELO rating for the player
     * @param {number} results[].goals - Goals scored by the player
     * @returns {Promise<void>}
     */
    // async updatePlayerResults(matchId, results) {
    //     try {
    //         // Update each player's result in the match_players table
    //         for (const result of results) {
    //             await db.run(
    //                 `UPDATE match_players 
    //                 SET score = ?, elo_after = ?, goals = ? 
    //                 WHERE match_id = ? AND player_id = ?`,
    //                 [result.score, result.newElo, result.goals, matchId, result.playerId]
    //             );
    //         }
    //     } catch (error) {
    //         console.error(`Error updating player results for match ${matchId}:`, error);
    //         throw error;
    //     }
    // }

    // /**
    //  * Update match result with ELO information
    //  * @param {number} matchId - Match ID
    //  * @param {number} winnerId - Winner user ID
    //  * @param {number} player1Id - Player 1 ID
    //  * @param {number} player2Id - Player 2 ID
    //  * @param {number} player1Goals - Player 1 goals
    //  * @param {number} player2Goals - Player 2 goals
    //  * @param {Object} eloData - ELO data object
    //  * @returns {Object} - Result object
    //  */
    // async updateMatchResult(matchId, winnerId, player1Id, player2Id, player1Goals, player2Goals, eloData = null) {
    //     try {
    //         console.log("11111111winnerId:", winnerId);
    //         // Update match status
    //         await new Promise((resolve, reject) => {
    //             db.run(
    //                 `UPDATE matches 
    //                  SET status = 'completed', 
    //                      winner_id = ?, 
    //                      completed_at = DATETIME('now') 
    //                  WHERE id = ?`,
    //                 [winnerId, matchId],
    //                 (err) => {
    //                     if (err) reject(err);
    //                     else resolve();
    //                 }
    //             );
    //         });

    //         // Update player 1 stats
    //         await new Promise((resolve, reject) => {
    //             db.run(
    //                 `UPDATE match_players 
    //                  SET goals = ?, 
    //                      elo_before = ?, 
    //                      elo_after = ? 
    //                  WHERE match_id = ? AND player_id = ?`,
    //                 [
    //                     player1Goals,
    //                     eloData.player1OldElo,
    //                     eloData.player1NewElo,
    //                     matchId,
    //                     player1Id
    //                 ],
    //                 (err) => {
    //                     if (err) reject(err);
    //                     else resolve();
    //                 }
    //             );
    //         });

    //         // Update player 2 stats
    //         await new Promise((resolve, reject) => {
    //             db.run(
    //                 `UPDATE match_players 
    //                  SET goals = ?, 
    //                      elo_before = ?, 
    //                      elo_after = ? 
    //                  WHERE match_id = ? AND player_id = ?`,
    //                 [
    //                     player2Goals,
    //                     eloData.player2OldElo,
    //                     eloData.player2NewElo,
    //                     matchId,
    //                     player2Id
    //                 ],
    //                 (err) => {
    //                     if (err) reject(err);
    //                     else resolve();
    //                 }
    //             );
    //         });

    //         // Update player 1 overall stats
    //         const isPlayer1Winner = winnerId === player1Id;
    //         await new Promise((resolve, reject) => {
    //             db.run(
    //                 `UPDATE players 
    //                  SET elo_score = ?, 
    //                      wins = wins + ?, 
    //                      losses = losses + ?, 
    //                      total_matches = total_matches + 1, 
    //                      total_goals = total_goals + ? 
    //                  WHERE id = ?`,
    //                 [
    //                     eloData.player1NewElo,
    //                     isPlayer1Winner ? 1 : 0,
    //                     isPlayer1Winner ? 0 : 1,
    //                     player1Goals,
    //                     player1Id
    //                 ],
    //                 (err) => {
    //                     if (err) reject(err);
    //                     else resolve();
    //                 }
    //             );
    //         });

    //         // Update player 2 overall stats
    //         const isPlayer2Winner = winnerId === player2Id;
    //         await new Promise((resolve, reject) => {
    //             db.run(
    //                 `UPDATE players 
    //                  SET elo_score = ?, 
    //                      wins = wins + ?, 
    //                      losses = losses + ?, 
    //                      total_matches = total_matches + 1, 
    //                      total_goals = total_goals + ? 
    //                  WHERE id = ?`,
    //                 [
    //                     eloData.player2NewElo,
    //                     isPlayer2Winner ? 1 : 0,
    //                     isPlayer2Winner ? 0 : 1,
    //                     player2Goals,
    //                     player2Id
    //                 ],
    //                 (err) => {
    //                     if (err) reject(err);
    //                     else resolve();
    //                 }
    //             );
    //         });

    //         return {
    //             matchId,
    //             winner: winnerId,
    //             finalScore: {
    //                 player1: player1Goals,
    //                 player2: player2Goals
    //             }
    //         };
    //     } catch (error) {
    //         console.error('Error updating match result:', error);
    //         throw error;
    //     }
    // }

    /**
 * Calculate new ELO rating
 * @param {number} playerRating - Current player rating
 * @param {number} opponentRating - Current opponent rating
 * @param {number} result - 1 for win, 0 for loss
 * @returns {number} - New ELO rating
 */
    async calculateNewElo(playerElo, opponentElo, result) {
        try {
            // Use the existing eloService to calculate the new rating
            const newElo = this.eloService.calculateNewRatings(playerElo, opponentElo, result);

            // Log the calculation for debugging
            const expectedScore = this.eloService.calculateExpectedScore(playerElo, opponentElo);
            console.log(`ELO calculation: ${playerElo} + ${this.eloService.kFactor} * (${result} - ${expectedScore.toFixed(4)}) = ${newElo}`);

            return newElo;
        } catch (error) {
            console.error('Error calculating new ELO:', error);
            // Return original ELO if calculation fails
            return playerElo;
        }
    }

    /**
     * Update a user's ELO rating
     * @param {string} userId - User ID
     * @param {number} newElo - New ELO rating
     */
    async updateUserElo(userId, newElo) {
        try {
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE players SET elo_score = ? WHERE id = ?',
                    [newElo, userId],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            console.log(`Updated ELO for user ${userId} to ${newElo}`);
        } catch (error) {
            console.error('Error updating user ELO:', error);
            throw error;
        }
    }

    async getUserWithElo(playerId) {
        try {
            // First try to get existing user
            const existingUser = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT id, elo_score FROM players WHERE id = ?`,
                    [playerId],
                    (err, row) => {
                        if (err) return reject(err);
                        resolve(row);
                    }
                );
            });
            // console.log("////////////////////////////////////////")
            // console.log("lol", existingUser);
            // console.log("////////////////////////////////////////")

            // If user exists, return it
            if (existingUser) {
                return existingUser;
            }

            // User doesn't exist, create a new record
            console.log(`[MATCHMAKING] Creating new player record for user ID: ${playerId}`);

            const newUser = await this.createNewUserRecord(playerId);
            return newUser;
        } catch (error) {
            console.error('Error fetching or creating user:', error);
            throw error;
        }
    }

    // Create a new player record when a user first connects
    async createNewUserRecord(playerId) {
        // Default values for a new player
        const defaultElo = 1000;
        const playerIdStr = String(playerId);
        // console.log("////////////////////////////////////////")

        // console.log(playerIdStr);
        // console.log("////////////////////////////////////////")

        try {
            // Insert new player record
            const result = await db.run(
                `INSERT INTO players (id, elo_score, wins, losses, draws, total_matches, total_goals) 
         VALUES (?, ?, 0, 0, 0, 0, 0)`,
                [playerIdStr, defaultElo]
            );

            console.log(`[MATCHMAKING] Created new player record for ID ${playerId}`);

            // Return the newly created player data
            return {
                id: playerIdStr,
                elo_score: defaultElo
            };
        } catch (error) {
            console.error('Error creating player record:', error);
            throw error;
        }
    }

    async getMatchById(matchId) {
        try {
            return await new Promise((resolve, reject) => {
                db.get(`SELECT * FROM matches WHERE id = ?`, [matchId], (err, row) => {
                    if (err) {
                        console.error('Error fetching match:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching match:', error);
            throw error;
        }
    }

    insertNewMatch(sql, params) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    getQueuePosition(playerId) {
        const playerIndex = this.waitingPlayers.findIndex(p => p.playerId === playerId);
        if (playerIndex === -1) return 0;
        return playerIndex + 1;
    }

    // Get match details with player info
    async getMatchWithPlayers(matchId) {
        try {
            const match = await this.getMatchById(matchId);
            if (!match) return null;

            const players = await db.all(
                `SELECT mp.*, p.elo_score 
             FROM match_players mp
             JOIN players p ON mp.player_id = p.id
             WHERE mp.match_id = ?`,
                [matchId]
            );

            return { match, players };
        } catch (error) {
            console.error('Error fetching match with players:', error);
            throw error;
        }
    }

    /**
     * TOURNAMENT HANDLING
     */
    async createTournamentMatch(player1Id, player2Id, tournamentId) {
        try {
            const player1 = await this.getUserWithElo(player1Id);
            const player2 = await this.getUserWithElo(player2Id);

            const matchId = await this.insertNewMatch(
                `INSERT INTO matches (match_type, status, tournament_id) VALUES (?, ?, ?)`,
                ['tournament', MatchStatus.PENDING, tournamentId]
            );

            console.log(`[TOURNAMENT] Created match with ID: ${matchId}`);

            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO match_players (match_id, player_id, elo_before, elo_after, goals) VALUES (?, ?, ?, ?, ?)`,
                    [matchId, player1.id, player1.elo_score, player1.elo_score, 0],
                    (err) => err ? reject(err) : resolve()
                );
            });

            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO match_players (match_id, player_id, elo_before, elo_after, goals) VALUES (?, ?, ?, ?, ?)`,
                    [matchId, player2.id, player2.elo_score, player2.elo_score, 0],
                    (err) => err ? reject(err) : resolve()
                );
            });

            console.log(`[TOURNAMENT] Created match between ${player1Id} and ${player2Id}`);

            return {
                matchId: matchId,
                player1: {
                    id: player1.id,
                    elo_score: player1.elo_score
                },
                player2: {
                    id: player2.id,
                    elo_score: player2.elo_score
                },
                tournamentId: tournamentId
            };
        } catch (error) {
            console.error('Error creating tournament match:', error);
            throw error;
        }
    }

    async getTournamentMatchWithPlayers(matchId) {
        try {
            const match = await db.get(
                `SELECT m.*, t.id as tournament_id 
         FROM matches m
         LEFT JOIN tournaments t ON m.tournament_id = t.id
         WHERE m.id = ?`,
                [matchId]
            );

            if (!match) return null;

            const players = await db.all(
                `SELECT mp.*, p.elo_score, p.username AS nickname 
         FROM match_players mp
         JOIN players p ON mp.player_id = p.id
         WHERE mp.match_id = ?`,
                [matchId]
            );

            return { match, players };
        } catch (error) {
            console.error('Error fetching match with players:', error);
            throw error;
        }
    }
}

export default new MatchmakingService();