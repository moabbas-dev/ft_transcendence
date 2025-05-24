/**
 * Matchmaking API routes
 */
export default async function matchmakingRoutes(fastify, options) {
    // Get all active matches
    fastify.get('/api/matches', async (request, reply) => {
      try {
        const matchmakingService = fastify.matchmakingService;
        const matches = await matchmakingService.getActiveMatches();
        return { matches };
      } catch (error) {
        fastify.log.error(`Error fetching matches: ${error.message}`);
        return reply.code(500).send({ error: 'Failed to fetch matches' });
      }
    });
  
    // Get match by ID
    fastify.get('/api/matches/:matchId', async (request, reply) => {
      try {
        const { matchId } = request.params;
        const matchmakingService = fastify.matchmakingService;
        const match = await matchmakingService.getMatchById(matchId);
        
        if (!match) {
          return reply.code(404).send({ error: 'Match not found' });
        }
        
        return { match };
      } catch (error) {
        fastify.log.error(`Error fetching match: ${error.message}`);
        return reply.code(500).send({ error: 'Failed to fetch match' });
      }
    });
  
    // Get player stats
    fastify.get('/api/players/:playerId/stats', async (request, reply) => {
      try {
        const { playerId } = request.params;
        const matchmakingService = fastify.matchmakingService;
        const stats = await matchmakingService.getPlayerStats(playerId);
        
        if (!stats) {
          return reply.code(404).send({ error: 'Player not found' });
        }
        
        return { stats };
      } catch (error) {
        fastify.log.error(`Error fetching player stats: ${error.message}`);
        return reply.code(500).send({ error: 'Failed to fetch player stats' });
      }
    });
  
    // Get leaderboard
    fastify.get('/api/leaderboard', async (request, reply) => {
      try {
        const { limit = 10, offset = 0 } = request.query;
        const matchmakingService = fastify.matchmakingService;
        const leaderboard = await matchmakingService.getLeaderboard(parseInt(limit), parseInt(offset));
        return { leaderboard };
      } catch (error) {
        fastify.log.error(`Error fetching leaderboard: ${error.message}`);
        return reply.code(500).send({ error: 'Failed to fetch leaderboard' });
      }
    });
  
    // Get match history for a player
    fastify.get('/api/players/:playerId/matches', async (request, reply) => {
      try {
        const { playerId } = request.params;
        const { limit = 10, offset = 0 } = request.query;
        const matchmakingService = fastify.matchmakingService;
        const matches = await matchmakingService.getPlayerMatches(
          playerId, 
          parseInt(limit), 
          parseInt(offset)
        );
        return { matches };
      } catch (error) {
        fastify.log.error(`Error fetching player matches: ${error.message}`);
        return reply.code(500).send({ error: 'Failed to fetch player matches' });
      }
    });
  }