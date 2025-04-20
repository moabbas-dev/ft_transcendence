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

    //add a player looking for a match
    async addToQueue(playerId) {
        try {
            const user = await this.getUserWithElo(playerId);
            if (!user) throw new Error('[MATCHMAKING] User not found');

            this.removeFromQueue(playerId);

            this.waitingPlayers.push({
                playerId: user.id,
                elo: user.elo_score,
                joinedAt: Date.now()
            });
            console.log(`user ${user.id} added to queue`);

            return this.findMatch(user.id, user.elo_score);
        } catch (error) {
            console.error('Error adding to queue:', error);
        }
    }

    // Remove a player from the waiting queue
    removeFromQueue(playerId) {
        this.waitingPlayers = this.waitingPlayers.filter(player => player.playerId !== playerId);
    }

    // Find a suitable opponent
    async findMatch(playerId, userElo) {
        try {
            // Don't match against self
            const possibleOpponents = this.waitingPlayers.filter(p => p.playerId !== playerId);

            if (possibleOpponents.length === 0) {
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
            if (!opponent) {
                opponent = possibleOpponents.reduce((closest, current) => {
                    return (Math.abs(current.elo - userElo) <= Math.abs(closest.elo - userElo))
                        ? current : closest;
                });
                if (!opponent)
                    return null
            }

            // Remove both players from queue
            this.removeFromQueue(playerId);
            this.removeFromQueue(opponent.playerId);
            // Create a match
            return this.createMatch(playerId, opponent.playerId, Match.ONLINE_MATCH);
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
    async updatePlayerResults(matchId, results) {
        try {
            // Update each player's result in the match_players table
            for (const result of results) {
                await db.run(
                    `UPDATE match_players 
                    SET score = ?, elo_after = ?, goals = ? 
                    WHERE match_id = ? AND player_id = ?`,
                    [result.score, result.newElo, result.goals, matchId, result.playerId]
                );
            }
        } catch (error) {
            console.error(`Error updating player results for match ${matchId}:`, error);
            throw error;
        }
    }

    /**
     * Updates the result of a completed match, including ELO calculations and user stats
     * @param {number} matchId - The ID of the match to update
     * @param {Object} matchData - Match data including goals for each player
     * @param {Object} matchData.goals - Object mapping user IDs to goals scored
     * @param {number|null} winnerId - The ID of the winning user, or null for a draw
     * @returns {Promise<Object>} - Result object with match outcome details
     */
    async updateMatchResult(matchId, matchData, winnerId = null) {
        try {
            const match = await this.getMatchById(matchId);
            if (!match || match.status === MatchStatus.COMPLETED) {
                throw new Error('Match not found or already completed');
            }

            // Get players in this match
            const players = await db.all(
                `SELECT mp.*, u.id as player_id, u.elo_score 
                FROM match_players mp
                JOIN players u ON mp.player_id = u.id
                WHERE mp.match_id = ?
                ORDER BY mp.player_id ASC`,  // Ensure consistent player order
                [matchId]
            );

            if (players.length !== 2) {
                throw new Error('Invalid match: must have exactly 2 players');
            }

            // Extract goals from matchData
            const [player1, player2] = players;
            const player1Goals = matchData.goals[player1.player_id] || 0;
            const player2Goals = matchData.goals[player2.player_id] || 0;
            let result;

            // Create player details objects for the result
            const player1Details = {
                playerId: player1.player_id,
                eloBefore: player1.elo_score,
            };

            const player2Details = {
                playerId: player2.player_id,
                eloBefore: player2.elo_score,
            };

            if (winnerId !== null) {
                // Validate winner based on goals
                const expectedWinnerId = player1Goals > player2Goals
                    ? player1.player_id
                    : player2Goals > player1Goals
                        ? player2.player_id
                        : null;

                if (expectedWinnerId === null) {
                    throw new Error('Cannot declare winner with equal goals');
                }

                if (winnerId !== expectedWinnerId) {
                    throw new Error('Winner ID does not match goal counts');
                }

                // Existing win/loss handling
                const winner = players.find(p => p.player_id === winnerId);
                const loser = players.find(p => p.player_id !== winnerId);

                // Calculate ELO changes
                const winnerNewElo = this.eloService.calculateNewRatings(
                    winner.elo_score,
                    loser.elo_score,
                    1 // Win score (not the same as goals)
                );

                const loserNewElo = this.eloService.calculateNewRatings(
                    loser.elo_score,
                    winner.elo_score,
                    0 // Loss score (not the same as goals)
                );

                // Update player details with new ELO
                const winnerGoals = winner.player_id === player1.player_id ? player1Goals : player2Goals;
                const loserGoals = loser.player_id === player1.player_id ? player1Goals : player2Goals;

                const winnerDetails = winner.player_id === player1.player_id
                    ? { ...player1Details, eloAfter: winnerNewElo }
                    : { ...player2Details, eloAfter: winnerNewElo };

                const loserDetails = loser.player_id === player1.player_id
                    ? { ...player1Details, eloAfter: loserNewElo }
                    : { ...player2Details, eloAfter: loserNewElo };

                // Update match records
                await this.updatePlayerResults(matchId, [
                    { playerId: winner.player_id, score: 1, newElo: winnerNewElo, goals: winnerGoals },
                    { playerId: loser.player_id, score: 0, newElo: loserNewElo, goals: loserGoals }
                ]);

                // Update user stats
                await this.updateUserStats(winner.player_id, winnerNewElo, 'win', winnerGoals);
                await this.updateUserStats(loser.player_id, loserNewElo, 'loss', loserGoals);

                result = {
                    winner: {
                        ...winnerDetails,
                        goals: winnerGoals
                    },
                    loser: {
                        ...loserDetails,
                        goals: loserGoals
                    },
                    matchGoals: {
                        [player1.player_id]: player1Goals,
                        [player2.player_id]: player2Goals
                    }
                };
            } else {
                // Handle draw outcome
                if (player1Goals !== player2Goals) {
                    throw new Error('Cannot declare draw with unequal goals');
                }

                const player1NewElo = this.eloService.calculateNewRatings(
                    player1.elo_score,
                    player2.elo_score,
                    0.5 // Draw score
                );
                const player2NewElo = this.eloService.calculateNewRatings(
                    player2.elo_score,
                    player1.elo_score,
                    0.5 // Draw score
                );

                // Update player details with new ELO
                const player1DetailsWithElo = {
                    ...player1Details,
                    eloAfter: player1NewElo
                };

                const player2DetailsWithElo = {
                    ...player2Details,
                    eloAfter: player2NewElo
                };

                // Update match records
                await this.updatePlayerResults(matchId, [
                    { playerId: player1.player_id, score: 0.5, newElo: player1NewElo, goals: player1Goals },
                    { playerId: player2.player_id, score: 0.5, newElo: player2NewElo, goals: player2Goals }
                ]);

                // Update user stats
                await this.updateUserStats(player1.player_id, player1NewElo, 'draw', player1Goals);
                await this.updateUserStats(player2.player_id, player2NewElo, 'draw', player2Goals);

                result = {
                    draw: [
                        { ...player1DetailsWithElo, goals: player1Goals },
                        { ...player2DetailsWithElo, goals: player2Goals }
                    ],
                    matchGoals: {
                        [player1.player_id]: player1Goals,
                        [player2.player_id]: player2Goals
                    }
                };
            }

            // Finalize match
            await db.run(
                `UPDATE matches SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [MatchStatus.COMPLETED, matchId]
            );

            return result;
        } catch (error) {
            console.error('Error updating match result:', error);
            throw error;
        }
    }

    // Helper to get user with ELO from database
    async getUserWithElo(playerId) {
        try {
            return await new Promise((resolve, reject) => {
                db.get(
                    `SELECT id, elo_score FROM players WHERE id = ?`,
                    [playerId],
                    (err, row) => {
                        if (err) return reject(err);
                        resolve(row);
                    }
                );
            });
        } catch (error) {
            console.error('Error fetching user:', error);
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
}

/**
     * Fetches match history for a specific user
     * @param {number} playerId - The ID of the user to fetch history for
     * @param {number} limit - Maximum number of matches to return (default: 10)
     * @param {number} offset - Number of matches to skip (for pagination, default: 0)
     * @returns {Promise<Array>} - Array of match history objects
     */
export async function getUserMatchHistory(playerId) {
    try {
        // Query to get all matches with player data, scores, and match times
        const matchHistory = await db.all(
            `SELECT 
                m.id AS match_id,
                m.match_type,
                m.created_at,
                m.completed_at,
                
                -- Current player data
                mp_user.player_id AS player_id,
                mp_user.elo_before AS user_elo_before,
                mp_user.elo_after AS user_elo_after,
                mp_user.goals AS user_goals,
                mp_user.score AS user_score,
                
                -- Opponent data
                mp_opponent.player_id AS opponent_id,
                mp_opponent.goals AS opponent_goals,
                
                -- Get opponent username from players table
                u_opponent.username AS opponent_nickname
            FROM 
                matches m
            JOIN 
                match_players mp_user ON m.id = mp_user.match_id AND mp_user.player_id = ?
            JOIN 
                match_players mp_opponent ON m.id = mp_opponent.match_id AND mp_opponent.player_id != ?
            LEFT JOIN
                players u_opponent ON mp_opponent.player_id = u_opponent.id
            WHERE 
                m.status = ?
            ORDER BY 
                m.created_at DESC`,
            [playerId, playerId, MatchStatus.COMPLETED]
        );

        // Format the match history data for better readability
        return matchHistory.map(match => {
            // Calculate match duration in minutes
            const createdAt = new Date(match.created_at);
            const completedAt = match.completed_at ? new Date(match.completed_at) : null;
            const durationMs = completedAt ? completedAt - createdAt : null;
            const durationMinutes = durationMs ? Math.floor(durationMs / 60000) : null;

            // Determine match result
            let result;
            if (match.user_score === 1) {
                result = 'win';
            } else if (match.user_score === 0) {
                result = 'loss';
            } else if (match.user_score === 0.5) {
                result = 'draw';
            } else {
                result = 'unknown';
            }

            // Format the score display
            const scoreDisplay = `${match.user_goals}-${match.opponent_goals}`;

            // Format ELO change
            const eloChange = match.user_elo_after - match.user_elo_before;
            const eloChangeFormatted = eloChange >= 0 ? `+${eloChange}` : `${eloChange}`;

            return {
                matchId: match.match_id,
                matchType: match.match_type,
                createdAt: match.created_at,
                completedAt: match.completed_at,
                durationMinutes: durationMinutes,

                // User data
                playerId: match.player_id,
                userScore: match.user_goals,

                // Opponent data
                opponentId: match.opponent_id,
                opponentNickname: match.opponent_nickname || `Player ${match.opponent_id}`,
                opponentScore: match.opponent_goals,

                // Match result info
                result: result,
                score: scoreDisplay,
                eloChange: eloChangeFormatted,
                eloBefore: match.user_elo_before,
                eloAfter: match.user_elo_after
            };
        });
    } catch (error) {
        console.error('Error fetching user match history:', error);
        throw error;
    }
}

export default new MatchmakingService();