import matchmakingService from '../services/matchmaking.js';
import { createWebSocketAdapter } from '../services/websocketAdapter.js';
import { registerTournamentMessageHandlers } from './tournamentWsController.js';

/**
 * Sets up WebSocket handlers for the matchmaking service
 * @param {WebSocketAdapter} wsAdapter - The WebSocket adapter instance
 * @param {FastifyInstance} fastify - The Fastify instance
 */
export function setupWebSocketHandlers(wsAdapter, fastify) {
  wsAdapter.initialize(async (socket, request) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const userId = url.searchParams.get('userId');

      if (!userId) {
        fastify.log.error('WebSocket connection attempt without userId');
        socket.close(1008, "Missing user identification");
        return;
      }

      const clientId = userId;

      try {
        await matchmakingService.getUserWithElo(clientId);
      } catch (error) {
        fastify.log.error(`Error getting user data: ${error.message}`);
        socket.close(1011, "Error retrieving user data");
        return;
      }

      wsAdapter.registerClient(clientId, socket, { userId });
      fastify.log.info(`New WebSocket connection from user: ${clientId}`);

      socket.on('message', async (rawMessage) => {
        try {
          let data;
          if (typeof rawMessage === 'string') {
            data = JSON.parse(rawMessage);
          } else {
            data = JSON.parse(rawMessage.toString());
          }

          if (!data || !data.type) {
            console.error(`Invalid message format from ${clientId}: ${rawMessage}`);
            wsAdapter.sendToClient(clientId, 'error', {
              message: 'Invalid message format: missing type'
            });
            return;
          }

          const handled = await wsAdapter.processMessage(clientId, data);

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

      socket.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        matchmakingService.removeFromQueue(clientId);
        wsAdapter.removeClient(clientId);
      });

      socket.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      wsAdapter.sendToClient(clientId, 'welcome', {
        message: 'Connected to matchmaking service',
        userId: clientId
      });
    } catch (error) {
      fastify.log.error(`Error in WebSocket connection handler: ${error.message}`);
      socket.close(1011, "Internal server error");
    }
  });

  registerMessageHandlers(wsAdapter);
  registerTournamentMessageHandlers(wsAdapter);
}

/**
 * Register all message type handlers with the WebSocket adapter
 * @param {WebSocketAdapter} wsAdapter - The WebSocket adapter instance
 */
function registerMessageHandlers(wsAdapter) {
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

  wsAdapter.registerMessageHandler('cancel_matchmaking', async (clientId, payload) => {
    try {
      console.log(`Player ${clientId} is cancelling matchmaking`);
      matchmakingService.removeFromQueue(clientId);
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

  wsAdapter.registerMessageHandler('create_friend_match', async (clientId, payload) => {
    try {
      const { player1, player2, initiator } = payload;
      console.log(`Creating friend match between ${player1} and ${player2}, initiated by ${initiator}`);
      console.log(`Request received from client: ${clientId}`);
  
      const friendMatch = await matchmakingService.createMatch(player1, player2, 'friendly');
      console.log(`Friend match created with ID: ${friendMatch.matchId}`);
  
      if (friendMatch) {
        console.log(`Sending friend_match_created to player1: ${player1}`);
        const sent1 = wsAdapter.sendToClient(player1, 'friend_match_created', {
          matchId: friendMatch.matchId,
          opponent: {
            id: player2,
            elo: friendMatch.player2.elo_score
          },
          isPlayer1: true
        });
  
        console.log(`Sending friend_match_created to player2: ${player2}`);
        const sent2 = wsAdapter.sendToClient(player2, 'friend_match_created', {
          matchId: friendMatch.matchId,
          opponent: {
            id: player1,
            elo: friendMatch.player1.elo_score
          },
          isPlayer1: false
        });
  
        console.log(`Messages sent - Player1: ${sent1}, Player2: ${sent2}`);
  
        setTimeout(async () => {
          console.log(`Starting friend match ${friendMatch.matchId} after countdown`);
          await matchmakingService.updateMatchStartTime(friendMatch.matchId);
          
          wsAdapter.sendToClient(player1, 'game_start', { matchId: friendMatch.matchId });
          wsAdapter.sendToClient(player2, 'game_start', { matchId: friendMatch.matchId });
          
          console.log(`Game start messages sent to both players`);
        }, 3000);
  
        console.log(`Friend match setup complete: ${friendMatch.matchId}`);
      } else {
        console.error(`Failed to create friend match`);
        wsAdapter.sendToClient(clientId, 'error', {
          message: 'Failed to create friend match'
        });
      }
    } catch (error) {
      console.error(`Error creating friend match:`, error);
      wsAdapter.sendToClient(clientId, 'error', {
        message: 'Failed to create friend match',
        details: error.message
      });
    }
  });

  wsAdapter.registerMessageHandler('paddle_move', async (clientId, payload) => {
    const { matchId, position } = payload;
    const opponentId = await matchmakingService.getOpponentId(clientId, matchId);

    if (opponentId) {
      wsAdapter.sendToClient(opponentId, 'opponent_paddle_move', {
        position: position
      });
    }
  });

  wsAdapter.registerMessageHandler('ball_update', async (clientId, payload) => {
    const { matchId, position, velocity, scores } = payload;
    const opponentId = await matchmakingService.getOpponentId(clientId, matchId);

    if (opponentId) {
      const mirroredPosition = {
        x: 1.0 - position.x,
        y: position.y
      };

      const mirroredVelocity = {
        x: -velocity.x,
        y: velocity.y
      };

      wsAdapter.sendToClient(opponentId, 'ball_update', {
        position: mirroredPosition,
        velocity: mirroredVelocity,
        scores: scores
      });
    }
  });

  wsAdapter.registerMessageHandler('score_update', async (clientId, payload) => {
    const { matchId, player1Score, player2Score } = payload;
    const opponentId = await matchmakingService.getOpponentId(clientId, matchId);

    if (opponentId) {
      wsAdapter.sendToClient(opponentId, 'score_update', {
        player1Score: player1Score,
        player2Score: player2Score
      });
    }
  });

  wsAdapter.registerMessageHandler('game_end', async (clientId, payload) => {
    const { matchId, winner, player1Goals, player2Goals } = payload;

    try {
      const match = await matchmakingService.getMatchById(matchId);
      if (!match) {
        throw new Error(`Match with ID ${matchId} not found`);
      }

      if (match.status === 'completed') {
        console.log(`Match ${matchId} already completed, ignoring duplicate game_end message`);
        return;
      }

      if (match.match_type === 'tournament') {
        return;
      }

      const matchPlayers = await matchmakingService.getMatchPlayers(matchId);
      if (!matchPlayers || matchPlayers.length < 2) {
        throw new Error(`Could not find players for match ${matchId}`);
      }

      const player1Id = matchPlayers[0].player_id;
      const player2Id = matchPlayers[1].player_id;
      
      matchmakingService.removeFromQueue(player1Id);
      matchmakingService.removeFromQueue(player2Id);

      const winnerId = Number(winner);
      const player1 = await matchmakingService.getUserWithElo(player1Id);
      const player2 = await matchmakingService.getUserWithElo(player2Id);
	  console.log("OOOOOO 1:", player1?.elo_score);
	  console.log("OOOOOO 2:", player2?.elo_score);
	  
      const player1OldElo = player1?.elo_score || 1000;
      const player2OldElo = player2?.elo_score || 1000;

      const player1Result = winnerId === Number(player1Id) ? 1 : 0;
      const player2Result = winnerId === Number(player2Id) ? 1 : 0;

      let player1NewElo = player1OldElo;
      let player2NewElo = player2OldElo;
      let player1EloChange = 0;
      let player2EloChange = 0;

      if (match.match_type !== 'friendly') {
        player1NewElo = await matchmakingService.calculateNewElo(
          player1OldElo,
          player2OldElo,
          player1Result
        );

        player2NewElo = await matchmakingService.calculateNewElo(
          player2OldElo,
          player1OldElo,
          player2Result
        );

        player1EloChange = player1NewElo - player1OldElo;
        player2EloChange = player2NewElo - player2OldElo;
      }

      await matchmakingService.updateMatchStatus(matchId, winnerId);

      const eloChanges = {
        [player1Id]: player1EloChange,
        [player2Id]: player2EloChange
      };

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

	  matchmakingService.updateUserElo(player1Id, player1NewElo);
	  matchmakingService.updateUserElo(player2Id, player2NewElo);

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

export function initializeWebSocketController(server, fastify) {
  const wsAdapter = createWebSocketAdapter(server);
  setupWebSocketHandlers(wsAdapter, fastify);
  return wsAdapter;
}