import TournamentService from '../services/tournament.js';

// Routes:
// post: /api/tournaments
// post: /api/tournaments/:id/register
// post: /api/tournaments/:id/start
// get: /api/tournaments/:id
// get: /api/tournaments
// post: /api/tournaments/matches/:id/result
  

export default async function (fastify, options) {
  fastify.post('/api/tournaments', async (request, reply) => {
    try {
      const { name, playerCount = 4 } = request.body;
      
      if (!name) {
        return reply.code(400).send({ error: 'Tournament name is required' });
      }
      
      if (playerCount !== 4 && playerCount !== 8) {
        return reply.code(400).send({ error: 'Tournament must have 4 or 8 players' });
      }
      
      const tournament = await TournamentService.createTournament(name, playerCount);
      return { tournament };
    } catch (error) {
      fastify.log.error(`Error creating tournament: ${error.message}`);
      return reply.code(500).send({ error: 'Failed to create tournament' });
    }
  });
  
  fastify.post('/api/tournaments/:id/register', async (request, reply) => {
    try {
      const { id } = request.params;
      const { userId } = request.body;
      
      if (!userId) {
        return reply.code(400).send({ error: 'User ID is required' });
      }
      
      const result = await TournamentService.registerPlayer(id, userId);
      return result;
    } catch (error) {
      fastify.log.error(`Error registering player: ${error.message}`);
      return reply.code(500).send({ error: error.message });
    }
  });
  
  fastify.post('/api/tournaments/:id/start', async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await TournamentService.startTournament(id);
      return result;
    } catch (error) {
      fastify.log.error(`Error starting tournament: ${error.message}`);
      return reply.code(500).send({ error: error.message });
    }
  });
  
  fastify.get('/api/tournaments/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const tournament = await TournamentService.getTournamentDetails(id);
      
      if (!tournament) {
        return reply.code(404).send({ error: 'Tournament not found' });
      }
      
      return tournament;
    } catch (error) {
      fastify.log.error(`Error fetching tournament details: ${error.message}`);
      return reply.code(500).send({ error: 'Failed to fetch tournament details' });
    }
  });
  
  fastify.get('/api/tournaments', async (request, reply) => {
    try {
      const tournaments = await TournamentService.getActiveTournaments();
      return { tournaments };
    } catch (error) {
      fastify.log.error(`Error fetching tournaments: ${error.message}`);
      return reply.code(500).send({ error: 'Failed to fetch tournaments' });
    }
  });
  
  fastify.post('/api/tournaments/matches/:id/result', async (request, reply) => {
    try {
      const { id } = request.params;
      const { winnerId } = request.body;
      
      if (!winnerId) {
        return reply.code(400).send({ error: 'Winner ID is required' });
      }
      
      const result = await TournamentService.updateTournamentMatchResult(id, winnerId);
      return result;
    } catch (error) {
      fastify.log.error(`Error updating match result: ${error.message}`);
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/api/tournaments/user/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const { limit = 10, offset = 0 } = request.query;
      
      if (!userId) {
        return reply.code(400).send({ error: 'User ID is required' });
      }
      
      const tournaments = await TournamentService.getUserTournaments(userId, limit, offset);
      return { tournaments };
    } catch (error) {
      fastify.log.error(`Error fetching user tournaments: ${error.message}`);
      return reply.code(500).send({ error: 'Failed to fetch user tournaments' });
    }
  });
}
