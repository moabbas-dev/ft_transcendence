/**
 * * MatchmakingService class handles matchmaking logic, including adding players to the queue,
 * * finding matches, creating matches, updating player statistics, and managing match results.
 */
import matchmakingService from '../services/matchmaking.js';

// for (const user of testUsers) {
    const playerIds = [1, 2, 3, 4, 5];
    playerIds.map(id => matchmakingService.addToQueue(id))
    
    // this block add the players to the queue all in the same time
    // try {
    //   const results = await Promise.all(
    //     playerIds.map(id => matchmakingService.addToQueue(id))
    //   );
    //   console.log("All players queued:", results);
    // } catch (err) {
    //   console.error("One of the queue operations failed:", err);
    // }
// }

// now we should create a match directly without quque using create Match directly
// const player1Id = 1; // Replace with actual player ID
// const player2Id = 2; // Replace with actual player ID
// const matchType = Match.ONLINE_MATCH; // Replace with actual match type
// matchmakingService.createMatch(player1Id, player2Id, matchType)
