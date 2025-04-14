const db = require('../config/db.js');
const EloService = require('./elo.js');

class MatchmakingService {
    constructor() {
        this.eloService = new EloService();
        this.waitingPlayers = [];
        this.rangeIncrement = 50;
    }

    //add a player looking for a match
    async addToQueue(userId) {
        try {
            const user = await this.getUserWithElo(userId);
            if (!user) throw new Error('User not found');

            //Remove if already in queue
            this.removeFromQueue(userId);

            // Add to waiting list
            this.waitingPlayers.push({
                userId: user.id,
                elo: user.elo,
                joinedAt: Date.now()
            });

            return this.findMatch(user.id, user.elo);
        } catch {
            console.error('Error adding to queue:', error);
            throw error;
        }
    }

    // Remove a player from the waiting queue
    removeFromQueue(userId) {
        this.waitingPlayers = this.waitingPlayers.filter(player => player.userId !== userId);
    }

    // Find a suitable opponent
    async findMatch(userId, userElo) {
        // Don't match against self
        const possibleOpponents = this.waitingPlayers.filter(p => p.userId !== userId);

        if (possibleOpponents.length === 0) {
            return null; // No opponents available
        }

        // Initially look for close ELO
        let range = this.rangeIncrement;
        let opponent = null;

        // Gradually increase range if no match found
        while (!opponent && range <= 500) {
            opponent = possibleOpponents.find(p =>
                Math.abs(p.elo - userElo) <= range);

            range += this.rangeIncrement;
        }

        // If still no match, take the closest available opponent
        if (!opponent && possibleOpponents.length > 0) {
            opponent = possibleOpponents.reduce((closest, current) => {
                return (Math.abs(current.elo - userElo) < Math.abs(closest.elo - userElo))
                    ? current : closest;
            });
        }

        if (opponent) {
            // Remove both players from queue
            this.removeFromQueue(userId);
            this.removeFromQueue(opponent.userId);

            // Create a match
            return this.createMatch(userId, opponent.userId);
        }

        return null;
    }

    // Create a 1v1 match between two players
    async createMatch(player1Id, player2Id) {
        try {
            const player1 = await this.getUserWithElo(player1Id);
            const player2 = await this.getUserWithElo(player2Id);

            // Insert new match
            const matchResult = await db.run(
                `INSERT INTO matches (match_type, status) VALUES (?, ?)`,
                ['1v1', 'pending']
            );
            const matchId = matchResult.lastID;

            // Add players to match
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
                player1: { id: player1.id, elo: player1.elo },
                player2: { id: player2.id, elo: player2.elo }
            };
        } catch (error) {
            console.error('Error creating match:', error);
            throw error;
        }
    }

    // Create a match with invited friend
    async createFriendMatch(player1Id, player2Id) {
        // Similar to createMatch but without matchmaking
        try {
            const player1 = await this.getUserWithElo(player1Id);
            const player2 = await this.getUserWithElo(player2Id);

            const matchResult = await db.run(
                `INSERT INTO matches (match_type, status) VALUES (?, ?)`,
                ['1v1', 'pending']
            );
            const matchId = matchResult.lastID;

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
                player1: { id: player1.id, elo: player1.elo },
                player2: { id: player2.id, elo: player2.elo }
            };
        } catch (error) {
            console.error('Error creating friend match:', error);
            throw error;
        }
    }

    // Update match result and recalculate ELO
    async updateMatchResult(matchId, winnerId) {
        try {
            // Get match details
            const match = await db.get(`SELECT * FROM matches WHERE id = ?`, [matchId]);
            if (!match || match.status === 'completed') {
                throw new Error('Match not found or already completed');
            }

            // Get players in this match
            const players = await db.all(
                `SELECT mp.*, u.elo FROM match_players mp 
         JOIN users u ON mp.user_id = u.id
         WHERE mp.match_id = ?`,
                [matchId]
            );

            if (players.length !== 2) {
                throw new Error('Invalid match: must have exactly 2 players');
            }

            // Identify winner and loser
            const winner = players.find(p => p.user_id === winnerId);
            const loser = players.find(p => p.user_id !== winnerId);

            if (!winner) {
                throw new Error('Winner not found in this match');
            }

            // Calculate new ELO ratings
            const winnerNewElo = this.eloService.calculateNewRatings(
                winner.elo, loser.elo, true
            );
            const loserNewElo = this.eloService.calculateNewRatings(
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

            // Update user stats in auth service (via API call or message queue)
            // This would depend on your inter-service communication strategy
            await this.updateUserStats(winner.user_id, winnerNewElo, true);
            await this.updateUserStats(loser.user_id, loserNewElo, false);

            return {
                winner: { id: winner.user_id, newElo: winnerNewElo, oldElo: winner.elo },
                loser: { id: loser.user_id, newElo: loserNewElo, oldElo: loser.elo }
            };
        } catch (error) {
            console.error('Error updating match result:', error);
            throw error;
        }
    }

    // Update user stats in the auth service
    async updateUserStats(userId, newElo, isWin) {
        // later .....
    }

    // Helper to get user with ELO from auth service
    async getUserWithElo(userId) {
        try {
            return await db.get(`SELECT id, elo FROM users WHERE id = ?`, [userId]);
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
}

module.exports = new MatchmakingService();
