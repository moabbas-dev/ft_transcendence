import axios from "axios";
import { getPlayerHistoryWithNicknames, getTotalMatchesForPlayer, getPlayerStats } from "../config/historyUtils.js";
import db from "../config/db.js";

export default async function historyRoutes(fastify, options) {

    // API route to get player history with type
    fastify.get('/api/player/history/:type/:userId/:playerId', async (request, reply) => {
        try {
            const { type, userId, playerId } = request.params;
            const { limit = 10, offset = 0 } = request.query;
            const authHeader = request.headers.authorization;

            // Validate match type
            const validTypes = ['1v1', 'friendly', 'tournament'];
            if (!validTypes.includes(type)) {
                return reply.code(400).send({
                    message: 'Invalid match type',
                    validTypes: validTypes,
                    received: type
                });
            }

            if (!authHeader || !authHeader.startsWith("Bearer "))
                return reply.code(401).send({ message: 'Unauthorized: No token provided' });
            const accessToken = authHeader.split(' ')[1];

            // Fixed authentication error handling
            try {
                await axios.post(`http://authentication:8001/auth/jwt/verify/${userId}`, {
                    accessToken
                });
            } catch (err) {
                if (err.response) {
                    const { status, data } = err.response;
                    return reply.code(status).send({ message: data.message });
                } else {
                    return reply.code(500).send({ message: 'Token verification failed', error: err.message });
                }
            }

            // Fixed: Added parseInt() for limit and offset
            const history = await getPlayerHistoryWithNicknames(
                playerId,
                parseInt(limit),
                parseInt(offset),
                type
            );

            return reply.code(200).send({
                matches: history,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: parseInt(await getTotalMatchesForPlayer(playerId, type)),
                    type: type
                }
            });
        } catch (error) {
            console.error('Error getting player history:', error);
            return reply.code(500).send({ error: 'Failed to get player history' });
        }
    });

    // Stats endpoint (separate)
    fastify.get('/api/player/stats/:userId/:playerId', async (request, reply) => {
        try {
            const { userId, playerId } = request.params;
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer "))
                return reply.code(401).send({ message: 'Unauthorized: No token provided' });
            const accessToken = authHeader.split(' ')[1];

            // Fixed: Use try-catch instead of .catch() for consistency
            try {
                await axios.post(`http://authentication:8001/auth/jwt/verify/${userId}`, {
                    accessToken
                });
            } catch (err) {
                if (err.response) {
                    const { status, data } = err.response;
                    return reply.code(status).send({ message: data.message });
                } else {
                    return reply.code(500).send({ message: 'Token verification failed', error: err.message });
                }
            }

            // Get player stats
            const stats = await getPlayerStats(playerId);

            return reply.code(200).send({
                player: {
                    id: playerId,
                    stats: stats
                }
            });
        } catch (error) {
            console.error('Error getting player stats:', error);
            return reply.code(500).send({ error: 'Failed to get player stats' });
        }
    });

    // Leaderboard endpoint - Get top 20 players with user details
    fastify.get('/api/leaderboard/:userId', async (request, reply) => {
        try {
            const { userId } = request.params;
            const { limit = 20 } = request.query;
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer "))
                return reply.code(401).send({ message: 'Unauthorized: No token provided' });
            const accessToken = authHeader.split(' ')[1];

            // Verify JWT token
            try {
                await axios.post(`http://authentication:8001/auth/jwt/verify/${userId}`, {
                    accessToken
                });
            } catch (err) {
                if (err.response) {
                    const { status, data } = err.response;
                    return reply.code(status).send({ message: data.message });
                } else {
                    return reply.code(500).send({ message: 'Token verification failed', error: err.message });
                }
            }

            // Get top players from database
            const topPlayers = await db.getTopPlayersWithRank(parseInt(limit));

            // Fetch user details for each player
            const playersWithUserData = await Promise.all(
                topPlayers.map(async (player) => {
                    try {
                        const userResponse = await axios.get(`http://authentication:8001/auth/users/id/${player.id}`);

                        return {
                            rank: player.rank,
                            id: player.id,
                            wins: player.wins,
                            eloScore: player.elo_score,
                            fullName: userResponse.data.full_name,
                            nickname: userResponse.data.nickname,
                            avatarUrl: userResponse.data.avatar_url
                        };
                    } catch (userError) {
                        console.error(`Error fetching user data for player ${player.id}:`, userError.message);
                        // Return player data without user details if user service fails
                        return {
                            rank: player.rank,
                            id: player.id,
                            wins: player.wins,
                            eloScore: player.elo_score,
                            fullName: null,
                            nickname: null,
                            avatarUrl: null
                        };
                    }
                })
            );

            return reply.code(200).send({
                leaderboard: playersWithUserData,
                total_players: playersWithUserData.length,
                requested_limit: parseInt(limit)
            });

        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return reply.code(500).send({ error: 'Failed to get leaderboard' });
        }
    });
}