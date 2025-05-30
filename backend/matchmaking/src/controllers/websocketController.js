import matchmakingService from '../services/matchmaking.js';
import { createWebSocketAdapter } from '../services/websocketAdapter.js'; 
import { registerTournamentMessageHandlers } from './tournamentWsController.js';

/**
 * Sets up WebSocket handlers for the matchmaking service
 * @param {WebSocketAdapter} wsAdapter - The WebSocket adapter instance
 * @param {FastifyInstance} fastify - The Fastify instance
 */
export function setupWebSocketHandlers(wsAdapter, fastify) {
  // Initialize the WebSocket adapter with our connection handler
  wsAdapter.initialize(async (socket, request) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      console.log(`WebSocket connection URL: ${url}`);
      
      const userId = url.searchParams.get('userId');
          
      if (!userId) {
        fastify.log.error('WebSocket connection attempt without userId');
        socket.close(1008, "Missing user identification");
        return;
      }
      
      // Use the actual user ID directly
      const clientId = userId;
      
      // Make sure user exists in the database
      try {
        await matchmakingService.getUserWithElo(clientId);
      } catch (error) {
        fastify.log.error(`Error getting user data: ${error.message}`);
        socket.close(1011, "Error retrieving user data");
        return;
      }
      
      // Register the new client with user data
      wsAdapter.registerClient(clientId, socket, { userId });
      
      fastify.log.info(`New WebSocket connection from user: ${clientId}`);
      
      // Set up message handler for this socket
      socket.on('message', async (rawMessage) => {
        // console.log(`Received message from ${clientId}: ${rawMessage}`);
        
        try {
          // Parse the message
          let data;
          if (typeof rawMessage === 'string') {
            data = JSON.parse(rawMessage);
          } else {
            // If it's a Buffer, convert to string first
            data = JSON.parse(rawMessage.toString());
          }
          
          // Check if data has the expected format
          if (!data || !data.type) {
            console.error(`Invalid message format from ${clientId}: ${rawMessage}`);
            wsAdapter.sendToClient(clientId, 'error', { 
              message: 'Invalid message format: missing type' 
            });
            return;
          }
          
          // console.log(`Processing message type: ${data.type}`);
          
          // Let the adapter try to process the message with registered handlers
          const handled = await wsAdapter.processMessage(clientId, data);
          
          // If not handled by a registered handler, process it here
          if (!handled) {
            console.log(`No handler for message type: ${data.type}`);
            wsAdapter.sendToClient(clientId, 'error', { 
              message: `Unsupported message type: ${data.type}` 
            });
          }
        } catch (error) {
          console.error(`Error processing message: ${error.message}`);
          wsAdapter.sendToClient(clientId, 'error', { 
            message: `Error processing message: ${error.message}` 
          });
        }
      });
      
      // Handle disconnection
      socket.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        
        // Remove from matchmaking queue if present
        matchmakingService.removeFromQueue(clientId);
        
        // Remove client from adapter
        wsAdapter.removeClient(clientId);
      });
      
      // Handle socket errors
      socket.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
      
      // Send welcome message
      wsAdapter.sendToClient(clientId, 'welcome', {
        message: 'Connected to matchmaking service',
        userId: clientId
      });
    } catch (error) {
      fastify.log.error(`Error in WebSocket connection handler: ${error.message}`);
      socket.close(1011, "Internal server error");
    }
  });
  
  // Register message handlers
  registerMessageHandlers(wsAdapter);
  registerTournamentMessageHandlers(wsAdapter);
}

/**
 * Register all message type handlers with the WebSocket adapter
 * @param {WebSocketAdapter} wsAdapter - The WebSocket adapter instance
 */
function registerMessageHandlers(wsAdapter) {
  // Find match handler
  wsAdapter.registerMessageHandler('find_match', async (clientId, payload) => {
    console.log(`Processing find_match request from ${clientId}`);
    const match = await matchmakingService.addToQueue(clientId);
    console.log(`FIND_MATCH result:`, match);
    
    if (match) {
      const p1 = wsAdapter.sendToClient(match.player1.id, 'match_found', {
        matchId: match.matchId,
        opponent: {
          id: match.player2.id,
          elo: match.player2.elo_score
        },
        isPlayer1: true
      });

      const p2 = wsAdapter.sendToClient(match.player2.id, 'match_found', {
        matchId: match.matchId,
        opponent: {
          id: match.player1.id,
          elo: match.player1.elo_score
        },
        isPlayer1: false
      });
      if (!p1 || !p2) {
        console.error(`Failed to send match_found message to one of the players`);
        wsAdapter.sendToClient(clientId, 'error', { 
          message: 'Failed to notify opponent about the match' 
        });
        return;
      }
      
      setTimeout(async () => {
        await matchmakingService.updateMatchStartTime(match.matchId);
        wsAdapter.sendToClient(match.player1.id, 'game_start', { matchId: match.matchId });
        wsAdapter.sendToClient(match.player2.id, 'game_start', { matchId: match.matchId });
      }, 3000);
      console.log(`The game will start in 3 seconds between ${match.player1.id} and ${match.player2.id}`);
    } else {
      wsAdapter.sendToClient(clientId, 'waiting_for_match', { 
        position: matchmakingService.getQueuePosition(clientId) 
      });
    }
  });
  
  // Cancel matchmaking handler
  wsAdapter.registerMessageHandler('cancel_matchmaking', async (clientId, payload) => {
    try {
      console.log(`Player ${clientId} is cancelling matchmaking`);
      
      // Remove the player from the matchmaking queue
      matchmakingService.removeFromQueue(clientId);
      
      // Send confirmation to the client
      wsAdapter.sendToClient(clientId, 'matchmaking_cancelled', {
        success: true,
        message: 'You have been removed from the matchmaking queue'
      });
      
      console.log(`Player ${clientId} has been removed from the matchmaking queue`);
    } catch (error) {
      console.error(`Error cancelling matchmaking for player ${clientId}:`, error);
      wsAdapter.sendToClient(clientId, 'error', {
        message: 'Failed to cancel matchmaking',
        details: error.message
      });
    }
  });
  
  // Friend match request handler
  wsAdapter.registerMessageHandler('friend_match_request', async (clientId, payload) => {
    const { friendId } = payload;
    console.log(`Friend match request from ${clientId} to ${friendId}`);
    
    const inviteSent = wsAdapter.sendToClient(friendId, 'friend_match_invite', {
      fromId: clientId
    });
    
    if (inviteSent) {
      wsAdapter.sendToClient(clientId, 'friend_invite_sent', { friendId });
    } else {
      wsAdapter.sendToClient(clientId, 'friend_invite_failed', { 
        friendId, 
        reason: 'Friend is offline' 
      });
    }
  });
  
  // Friend match accept handler
  wsAdapter.registerMessageHandler('friend_match_accept', async (clientId, payload) => {
    const { fromId } = payload;
    
    const friendMatch = await matchmakingService.createMatch(
      fromId, 
      clientId, 
      'friendly'
    );
    
    if (friendMatch) {
      wsAdapter.sendToClient(fromId, 'friend_match_created', {
        matchId: friendMatch.matchId,
        opponent: {
          id: clientId,
          elo: friendMatch.player2.elo_score
        }
      });
      
      wsAdapter.sendToClient(clientId, 'friend_match_created', {
        matchId: friendMatch.matchId,
        opponent: {
          id: fromId,
          elo: friendMatch.player1.elo_score
        }
      });
      
      setTimeout(async () => {
        await matchmakingService.updateMatchStartTime(friendMatch.matchId);
        wsAdapter.sendToClient(fromId, 'game_start', { matchId: friendMatch.matchId });
        wsAdapter.sendToClient(clientId, 'game_start', { matchId: friendMatch.matchId });
      }, 3000);
    }
  });
  
  // Paddle move handler with mirrored positioning
  wsAdapter.registerMessageHandler('paddle_move', async (clientId, payload) => {
    const { matchId, position } = payload;
    const opponentId = await matchmakingService.getOpponentId(clientId, matchId);
    
    if (opponentId) {
      // Send the exact same normalized position to opponent
      // The frontend will handle the mirroring transformation
      wsAdapter.sendToClient(opponentId, 'opponent_paddle_move', {
        position: position // Keep the same normalized Y position (0-1)
      });
    }
  });
  
  // Ball update handler - REMOVE score mirroring from backend
  wsAdapter.registerMessageHandler('ball_update', async (clientId, payload) => {
    const { matchId, position, velocity, scores } = payload;
    const opponentId = await matchmakingService.getOpponentId(clientId, matchId);
    
    if (opponentId) {
      // Mirror the ball position and velocity for the opponent
      const mirroredPosition = {
        x: 1.0 - position.x, // Mirror X coordinate: opponent sees ballX = 1 - senderBallX
        y: position.y        // Keep Y coordinate the same
      };
      
      const mirroredVelocity = {
        x: -velocity.x,      // Reverse X velocity for opponent
        y: velocity.y        // Keep Y velocity the same
      };
      
      // Send original scores (NO mirroring) - frontend will handle display
      wsAdapter.sendToClient(opponentId, 'ball_update', {
        position: mirroredPosition,
        velocity: mirroredVelocity,
        scores: scores // Send original scores without mirroring
      });
    }
  });
  
  // Score update handler - REMOVE score mirroring from backend
  wsAdapter.registerMessageHandler('score_update', async (clientId, payload) => {
    const { matchId, player1Score, player2Score } = payload;
    const opponentId = await matchmakingService.getOpponentId(clientId, matchId);
    
    if (opponentId) {
      // Send original scores (NO mirroring) - frontend will handle display
      wsAdapter.sendToClient(opponentId, 'score_update', {
        player1Score: player1Score, // Send original scores
        player2Score: player2Score  // Send original scores
      });
    }
  });

  // FIXED: Game end handler - Remove duplicate ELO updates
  wsAdapter.registerMessageHandler('game_end', async (clientId, payload) => {
    const { matchId, winner, player1Goals, player2Goals } = payload;
    
    try {
      // Get match details
      const match = await matchmakingService.getMatchById(matchId);
      if (!match) {
        throw new Error(`Match with ID ${matchId} not found`);
      }
      
      // Check if match is already completed to prevent duplicate processing
      if (match.status === 'completed') {
        console.log(`Match ${matchId} already completed, ignoring duplicate game_end message`);
        return;
      }
      
      console.log("Match found:", match);
      if (match.match_type === 'tournament') {
        await TournamentService.updateTournamentMatchResult(matchId, winner);
        return;
      }
      
      // Get players for this match from match_players table
      const matchPlayers = await matchmakingService.getMatchPlayers(matchId);
      console.log("matchPlayers: ", matchPlayers);
      if (!matchPlayers || matchPlayers.length < 2) {
        throw new Error(`Could not find players for match ${matchId}`);
      }
      
      // Determine which player is which (we need to know player1 and player2)
      const player1Id = matchPlayers[0].player_id;
      const player2Id = matchPlayers[1].player_id;
      matchmakingService.removeFromQueue(player1Id);
      matchmakingService.removeFromQueue(player2Id);
      console.log("Players removed from queue:", player1Id, player2Id);
      console.log(`Player 1: ${player1Id}, Player 2: ${player2Id}`);
      
      // Make sure winner is a number
      const winnerId = Number(winner);
      console.log(`Winner ID (converted to number): ${winnerId}`);
      
      // Get current ELO ratings for both players
      const player1 = await matchmakingService.getUserWithElo(player1Id);
      const player2 = await matchmakingService.getUserWithElo(player2Id);
      
      const player1OldElo = player1?.elo_score || 1000;
      const player2OldElo = player2?.elo_score || 1000;
      
      console.log(`BEFORE ELO CALCULATION:`);
      console.log(`Player 1 (${player1Id}): ${player1OldElo} ELO`);
      console.log(`Player 2 (${player2Id}): ${player2OldElo} ELO`);
      
      // Determine match result (1 = win, 0.5 = draw, 0 = loss)
      const player1Result = winnerId === Number(player1Id) ? 1 : 0;
      const player2Result = winnerId === Number(player2Id) ? 1 : 0;
      console.log(`Match result: Player 1 ${player1Result}, Player 2 ${player2Result}`);
      
      // Calculate new ELO ratings
      const player1NewElo = await matchmakingService.calculateNewElo(
        player1OldElo, 
        player2OldElo, 
        player1Result
      );
      
      const player2NewElo = await matchmakingService.calculateNewElo(
        player2OldElo, 
        player1OldElo, 
        player2Result
      );
      
      console.log(`ELO CALCULATION RESULTS:`);
      console.log(`Player 1: ${player1OldElo} -> ${player1NewElo} (change: ${player1NewElo - player1OldElo})`);
      console.log(`Player 2: ${player2OldElo} -> ${player2NewElo} (change: ${player2NewElo - player2OldElo})`);
      
      // Calculate ELO changes
      const player1EloChange = player1NewElo - player1OldElo;
      const player2EloChange = player2NewElo - player2OldElo;
      
      // FIXED: Only call updateMatchResult - it handles both player ELO updates and match_players updates
      // REMOVED: await matchmakingService.updateUserElo(player1Id, player1NewElo);
      // REMOVED: await matchmakingService.updateUserElo(player2Id, player2NewElo);
      
      // Update match result in database with ELO information
      // This method handles updating both players table ELO and match_players table
      const result = await matchmakingService.updateMatchResult(
        matchId,
        winnerId,
        player1Id,
        player2Id,
        player1Goals,
        player2Goals,
        {
          player1OldElo,
          player1NewElo,
          player2OldElo,
          player2NewElo
        }
      );
      
      // Add ELO changes to the result object
      const eloChanges = {
        [player1Id]: player1EloChange,
        [player2Id]: player2EloChange
      };
      
      console.log("Final ELO changes object:", eloChanges);
      
      // Notify both players about the result
      wsAdapter.sendToClient(player1Id, 'match_results', {
        winner: winnerId,
        finalScore: {
          player1: player1Goals,
          player2: player2Goals
        },
        eloChange: eloChanges
      });
      
      wsAdapter.sendToClient(player2Id, 'match_results', {
        winner: winnerId,
        finalScore: {
          player1: player1Goals,
          player2: player2Goals
        },
        eloChange: eloChanges
      });
      
      console.log(`Match ${matchId} completed. Winner: ${winnerId}. ELO updates: P1 ${player1OldElo}->${player1NewElo} (${player1EloChange}), P2 ${player2OldElo}->${player2NewElo} (${player2EloChange})`);
    } catch (error) {
      console.error(`Error processing game end for match ${matchId}:`, error);
      wsAdapter.sendToClient(clientId, 'error', {
        message: 'Failed to process game end',
        details: error.message
      });
    }
  });
}

async function notifyTournamentMatchPlayers(matchId, wsAdapter) {
  try {
    const matchWithPlayers = await TournamentService.getMatchWithPlayers(matchId);
    
    if (!matchWithPlayers) {
      console.error(`Match ${matchId} not found`);
      return;
    }
    
    const { match, players } = matchWithPlayers;
    
    for (const player of players) {
      // Find opponent
      const opponent = players.find(p => p.player_id !== player.player_id);
      
      if (!opponent) continue;
      
      wsAdapter.sendToClient(player.player_id, 'tournament_match_notification', {
        tournamentId: match.tournament_id,
        matchId: match.id,
        opponent: {
          id: opponent.player_id,
          username: opponent.nickname || `Player ${opponent.player_id}`,
          elo: opponent.elo_score
        },
        round: match.round || 0
      });
    }
    
    console.log(`Tournament match notifications sent for match ${matchId}`);
  } catch (error) {
    console.error(`Error sending tournament match notifications: ${error.message}`);
  }
}

// Export a function to initialize the WebSocket controller
export function initializeWebSocketController(server, fastify) {
  const wsAdapter = createWebSocketAdapter(server);
  setupWebSocketHandlers(wsAdapter, fastify);
  return wsAdapter;
}