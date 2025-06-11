import axios from "axios";
import { getPlayerHistoryWithNicknames, getTotalMatchesForPlayer, getPlayerStats } from "../config/historyUtils.js";

export default async function historyRoutes(fastify, options) {
    // // API route to get player history with type
    // fastify.get('/api/player/history/:type/:userId/:playerId', async (request, reply) => {
    //     try {
    //         const { type, userId, playerId } = request.params;
    //         const { limit = 10, offset = 0 } = request.query;
    //         const authHeader = request.headers.authorization;

    //         if (!authHeader || !authHeader.startsWith("Bearer "))
    //             return reply.code(401).send({ message: 'Unauthorized: No token provided' });
    //         const accessToken = authHeader.split(' ')[1];

    //         await axios.post(`http://127.0.0.1:8001/auth/jwt/verify/${userId}`, {
    //             accessToken
    //         }).catch(err => {
    //             if (err.response) {
    //                 const { status, data } = err.response;
    //                 return reply.code(status).send({ message: data.message });
    //             } else {
    //                 return reply.code(500).send({ message: 'Token verification failed', error: err.message });
    //             }
    //         });

    //         // Get player history with formatted data
    //         const history = await getPlayerHistoryWithNicknames(playerId, limit, offset, type);

    //         return reply.code(200).send({
    //             matches: history,
    //             pagination: {
    //                 limit: parseInt(limit),
    //                 offset: parseInt(offset),
    //                 total: parseInt(await getTotalMatchesForPlayer(playerId, type))
    //             }
    //         });
    //     } catch (error) {
    //         console.error('Error getting player history:', error);
    //         return reply.code(500).send({ error: 'Failed to get player history' });
    //     }
    // });

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
}