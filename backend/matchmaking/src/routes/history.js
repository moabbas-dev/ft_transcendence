import axios from "axios";
import { getPlayerHistoryWithNicknames, getTotalMatchesForPlayer, getPlayerStats } from "../config/historyUtils.js";

export default async function historyRoutes(fastify, options) {
    // API route to get player history
    fastify.get('/api/player/history/:userId/:playerId', async (request, reply) => {
        try {
            const { userId, playerId } = request.params;
            const { limit = 10, offset = 0 } = request.query;
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer "))
                return reply.code(401).send({ message: 'Unauthorized: No token provided' });
            const accessToken = authHeader.split(' ')[1];

            await axios.post(`http://localhost:8001/auth/jwt/verify/${userId}`, {
                accessToken
            }).catch(err => {
                if (err.response) {
                    const { status, data } = err.response;
                    return reply.code(status).send({ message: data.message });
                } else {
                    return reply.code(500).send({ message: 'Token verification failed', error: err.message });
                }
            });

            // Get player history with formatted data
            const history = await getPlayerHistoryWithNicknames(playerId, limit, offset);

            return reply.code(200).send({
                matches: history,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: parseInt(await getTotalMatchesForPlayer(playerId))
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

            await axios.post(`http://localhost:8001/auth/jwt/verify/${userId}`, {
                accessToken
            }).catch(err => {
                if (err.response) {
                    const { status, data } = err.response;
                    return reply.code(status).send({ message: data.message });
                } else {
                    return reply.code(500).send({ message: 'Token verification failed', error: err.message });
                }
            });

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
}