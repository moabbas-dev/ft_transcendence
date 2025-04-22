import { matchmakingService } from '../services/matchmaking.js';
import { v4 as uuidv4 } from 'uuid';

export function setupWebSocketHandlers(wsAdapter, fastify) {
  wsAdapter.server.on('connection', (socket, request) => {
    // Generate a temporary ID for the socket if not authenticated yet
    let clientId = uuidv4();
    let authenticated = false;

    // Register the new client
    wsAdapter.registerClient(clientId, socket);
    
    fastify.log.info(`New WebSocket connection: ${clientId}`);
    
    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        fastify.log.info(`Received message from ${clientId}: ${data.type}`);
        
        switch (data.type) {
          case 'auth':
            // Authenticate the user and update the clientId to the real userId
            if (data.token) {
              try {
                // Verify the token (implement your auth logic here)
                const userId = verifyToken(data.token); // You'll need to implement this
                
                // Update the client ID to the real user ID
                wsAdapter.removeClient(clientId);
                clientId = userId;
                wsAdapter.registerClient(clientId, socket, { authenticated: true });
                authenticated = true;
                
                socket.send(JSON.stringify({
                  type: 'auth_success',
                  payload: { userId: clientId }
                }));
              } catch (err) {
                socket.send(JSON.stringify({
                  type: 'auth_error',
                  payload: { message: 'Authentication failed' }
                }));
              }
            }
            break;
            
          case 'find_match':
            if (!authenticated) {
              socket.send(JSON.stringify({
                type: 'error',
                payload: { message: 'You must be authenticated' }
              }));
              break;
            }
            
            // Add player to matchmaking queue
            const match = await matchmakingService.addToQueue(clientId);
            
            if (match) {
              // Match found! Notify both players
              wsAdapter.sendToClient(match.player1.id, 'match_found', {
                matchId: match.matchId,
                opponent: {
                  id: match.player2.id,
                  elo: match.player2.elo_score
                }
              });
              
              wsAdapter.sendToClient(match.player2.id, 'match_found', {
                matchId: match.matchId,
                opponent: {
                  id: match.player1.id,
                  elo: match.player1.elo_score
                }
              });
              
              // Start the game countdown
              setTimeout(() => {
                wsAdapter.sendToClient(match.player1.id, 'game_start', { matchId: match.matchId });
                wsAdapter.sendToClient(match.player2.id, 'game_start', { matchId: match.matchId });
              }, 3000);
            } else {
              // No match found yet, client will wait
              socket.send(JSON.stringify({
                type: 'waiting_for_match',
                payload: { position: matchmakingService.getQueuePosition(clientId) }
              }));
            }
            break;
            
          case 'cancel_matchmaking':
            if (authenticated) {
              matchmakingService.removeFromQueue(clientId);
              socket.send(JSON.stringify({
                type: 'matchmaking_cancelled',
                payload: {}
              }));
            }
            break;
            
          case 'friend_match_request':
            if (!authenticated) {
              socket.send(JSON.stringify({
                type: 'error',
                payload: { message: 'You must be authenticated' }
              }));
              break;
            }
            
            const { friendId } = data.payload;
            
            // Send match invite to friend if they're online
            const inviteSent = wsAdapter.sendToClient(friendId, 'friend_match_invite', {
              fromId: clientId
            });
            
            if (inviteSent) {
              socket.send(JSON.stringify({
                type: 'friend_invite_sent',
                payload: { friendId }
              }));
            } else {
              socket.send(JSON.stringify({
                type: 'friend_invite_failed',
                payload: { friendId, reason: 'Friend is offline' }
              }));
            }
            break;
            
          case 'friend_match_accept':
            if (!authenticated) break;
            
            const { fromId } = data.payload;
            
            // Create a direct match between friends
            const friendMatch = await matchmakingService.createMatch(
              fromId, 
              clientId, 
              'FRIEND_MATCH'
            );
            
            if (friendMatch) {
              wsAdapter.sendToClient(fromId, 'friend_match_created', {
                matchId: friendMatch.matchId,
                opponent: {
                  id: clientId,
                  elo: friendMatch.player2.elo_score
                }
              });
              
              socket.send(JSON.stringify({
                type: 'friend_match_created',
                payload: {
                  matchId: friendMatch.matchId,
                  opponent: {
                    id: fromId,
                    elo: friendMatch.player1.elo_score
                  }
                }
              }));
              
              // Start the game countdown
              setTimeout(() => {
                wsAdapter.sendToClient(fromId, 'game_start', { matchId: friendMatch.matchId });
                wsAdapter.sendToClient(clientId, 'game_start', { matchId: friendMatch.matchId });
              }, 3000);
            }
            break;
            
          case 'paddle_move':
            if (!authenticated) break;
            
            const { matchId, position } = data.payload;
            
            // Find the opponent in this match and send them the paddle position
            // You'll need to implement a way to track matches and opponents
            const opponentId = await getOpponentId(clientId, matchId);
            
            if (opponentId) {
              wsAdapter.sendToClient(opponentId, 'opponent_paddle_move', {
                position
              });
            }
            break;
            
          case 'ball_update':
            if (!authenticated) break;
            
            const { matchId: ballMatchId, ballData } = data.payload;
            const ballOpponentId = await getOpponentId(clientId, ballMatchId);
            
            if (ballOpponentId) {
              wsAdapter.sendToClient(ballOpponentId, 'ball_sync', {
                ballData
              });
            }
            break;
            
          case 'goal_scored':
            if (!authenticated) break;
            
            const { matchId: goalMatchId, scoringPlayer, newScore } = data.payload;
            // Update match score in database
            // Broadcast to both players
            const goalOpponentId = await getOpponentId(clientId, goalMatchId);
            
            if (goalOpponentId) {
              wsAdapter.sendToClient(goalOpponentId, 'goal_update', {
                scoringPlayer,
                newScore
              });
              
              // Also send to the scoring player for confirmation
              wsAdapter.sendToClient(clientId, 'goal_update', {
                scoringPlayer,
                newScore
              });
            }
            break;
            
          case 'match_complete':
            if (!authenticated) break;
            
            const { matchId: completedMatchId, winner, finalScore } = data.payload;
            
            // Update match in database as completed
            // Calculate ELO changes
            // Send results to both players
            const completeOpponentId = await getOpponentId(clientId, completedMatchId);
            
            // Send match results to both players
            if (completeOpponentId) {
              const matchResults = {
                matchId: completedMatchId,
                winner,
                finalScore,
                eloChange: {} // You'll need to calculate this
              };
              
              wsAdapter.sendToClient(clientId, 'match_results', matchResults);
              wsAdapter.sendToClient(completeOpponentId, 'match_results', matchResults);
            }
            break;
        }
        
      } catch (err) {
        fastify.log.error(`Error processing WebSocket message: ${err.message}`);
        socket.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' }
        }));
      }
    });
    
    socket.on('close', () => {
      fastify.log.info(`WebSocket connection closed: ${clientId}`);
      
      // Clean up: remove from matchmaking queue if they were in it
      if (authenticated) {
        matchmakingService.removeFromQueue(clientId);
      }
      
      // Remove client from adapter
      wsAdapter.removeClient(clientId);
    });
  });
  
  // Helper function to get opponent ID from a match
  async function getOpponentId(playerId, matchId) {
    // Implement logic to find the opponent in a match
    // This will depend on your database schema
    // Example implementation:
    const match = await getMatchDetails(matchId);
    if (!match) return null;
    
    return match.player1Id === playerId ? match.player2Id : match.player1Id;
  }
  
  async function getMatchDetails(matchId) {
    // Implement this to fetch match details from your database
    // Return { player1Id, player2Id } or null if not found
  }
  
  function verifyToken(token) {
    // Implement your token verification logic
    // Return the userId if valid, throw error if invalid
  }
}