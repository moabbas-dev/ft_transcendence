/**
 * * MatchmakingService class handles matchmaking logic, including adding players to the queue,
 * * finding matches, creating matches, updating player statistics, and managing match results.
 */
import matchmakingService from '../services/matchmaking.js';

    const playerIds = [1, 2, 3, 4, 5];
    playerIds.map(id => matchmakingService.addToQueue(id))
    


