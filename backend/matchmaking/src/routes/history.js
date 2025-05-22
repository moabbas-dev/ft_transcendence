import db from "../config/db.js";

export default async function historyRoutes(fastify, options) {
    // API route to get player history
    fastify.get('/api/player/history/:playerId', async (request, reply) => {
        try {
            const { playerId } = request.params;
            const { limit = 10, offset = 0 } = request.query;

            // Get player history with formatted data
            const history = await db.getPlayerHistoryWithNicknames(playerId, limit, offset);

            // Get additional player stats
            const stats = await db.getPlayerStats(playerId);

            return reply.code(200).send({
                player: {
                    id: playerId,
                    stats: stats
                },
                matches: history,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: history.length
                }
            });
        } catch (error) {
            console.error('Error getting player history:', error);
            return reply.code(500).send({ error: 'Failed to get player history' });
        }
    });
}