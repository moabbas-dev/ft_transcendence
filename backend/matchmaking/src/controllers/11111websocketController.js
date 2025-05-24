import matchmakingService from '../services/matchmaking.js'

export function setupWebSocketHandlers(wsAdapter, fastify) {
  wsAdapter.wss.on('connection', async (socket, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    console.log(`WebSocket connection URL: ${url}`);
    
    const userId = url.searchParams.get('userId');
        
    if (!userId) {
      fastify.log.error('WebSocket connection attempt without userId');
      socket.close(1008, "Missing user identification");
      return;
    }
    
    // Use the actual user ID directly instead of a temporary one
    const clientId = userId;
    await matchmakingService.getUserWithElo(clientId);
    // Register the new client with user data
    wsAdapter.registerClient(clientId, socket, { userId });
    
    fastify.log.info(`New WebSocket connection from user: ${clientId}`);
    
    // socket.on('message', async (message) => {
    //   console.log(`1Received message from ${clientId}: ${message}`);
    //   try {

    //     let data;
    //     let messageType;
        
    //     // Try to parse as JSON first
    //     try {
    //       const messageStr = typeof message === 'string' ? message : message.toString();
          
    //       // Check if the message is a simple command string
    //       if (messageStr === 'find_match' || messageStr === 'cancel_matchmaking') {
    //         messageType = messageStr;
    //         data = { type: messageStr };
    //       } else {
    //         // Try to parse as JSON
    //         data = JSON.parse(messageStr);
    //         messageType = data.type;
    //       }
    //     } catch (parseError) {
    //       console.error(`Failed to parse message: ${parseError.message}`);
    //       socket.send(JSON.stringify({
    //         type: 'error',
    //         payload: { message: 'Invalid message format: not valid JSON' }
    //       }));
    //       return;
    //     }
        
    //     if (!messageType) {
    //       console.error(`Message missing type: ${message}`);
    //       socket.send(JSON.stringify({
    //         type: 'error',
    //         payload: { message: 'Invalid message format: missing type' }
    //       }));
    //       return;
    //     }
        
    //     console.log(`Processing message type: ${messageType}`);
        
    //     switch (messageType) {
    //       case 'find_match':
    //         console.log(`Processing find_match request from ${clientId}`);
    //         const match = await matchmakingService.addToQueue(clientId);
    //         console.log(`FIND_MATCH result:`, match);
    //         if (match) {
    //           wsAdapter.sendToClient(match.player1.id, 'match_found', {
    //             matchId: match.matchId,
    //             opponent: {
    //               id: match.player2.id,
    //               elo: match.player2.elo_score
    //             }
    //           });
              
    //           wsAdapter.sendToClient(match.player2.id, 'match_found', {
    //             matchId: match.matchId,
    //             opponent: {
    //               id: match.player1.id,
    //               elo: match.player1.elo_score
    //             }
    //           });
              
    //           setTimeout(() => {
    //             wsAdapter.sendToClient(match.player1.id, 'game_start', { matchId: match.matchId });
    //             wsAdapter.sendToClient(match.player2.id, 'game_start', { matchId: match.matchId });
    //           }, 3000);
    //           console.log(`The game will start in 3 seconds between ${match.player1.id} and ${match.player2.id}`);
    //         } else {
    //           socket.send(JSON.stringify({
    //             type: 'waiting_for_match',
    //             payload: { position: matchmakingService.getQueuePosition(clientId) }
    //           }));
    //         }
    //         break;
            
    //       case 'cancel_matchmaking':
    //         matchmakingService.removeFromQueue(clientId);
    //         socket.send(JSON.stringify({
    //           type: 'matchmaking_cancelled',
    //           payload: {}
    //         }));
    //         break;
            
    //       case 'friend_match_request':
    //         const { friendId } = data.payload;
            
    //         const inviteSent = wsAdapter.sendToClient(friendId, 'friend_match_invite', {
    //           fromId: clientId
    //         });
            
    //         if (inviteSent) {
    //           socket.send(JSON.stringify({
    //             type: 'friend_invite_sent',
    //             payload: { friendId }
    //           }));
    //         } else {
    //           socket.send(JSON.stringify({
    //             type: 'friend_invite_failed',
    //             payload: { friendId, reason: 'Friend is offline' }
    //           }));
    //         }
    //         break;
            
    //       case 'friend_match_accept':
    //         const { fromId } = data.payload;
            
    //         const friendMatch = await matchmakingService.createMatch(
    //           fromId, 
    //           clientId, 
    //           'friendly'
    //         );
            
    //         if (friendMatch) {
    //           wsAdapter.sendToClient(fromId, 'friend_match_created', {
    //             matchId: friendMatch.matchId,
    //             opponent: {
    //               id: clientId,
    //               elo: friendMatch.player2.elo_score
    //             }
    //           });
              
    //           socket.send(JSON.stringify({
    //             type: 'friend_match_created',
    //             payload: {
    //               matchId: friendMatch.matchId,
    //               opponent: {
    //                 id: fromId,
    //                 elo: friendMatch.player1.elo_score
    //               }
    //             }
    //           }));
              
    //           setTimeout(() => {
    //             wsAdapter.sendToClient(fromId, 'game_start', { matchId: friendMatch.matchId });
    //             wsAdapter.sendToClient(clientId, 'game_start', { matchId: friendMatch.matchId });
    //           }, 3000);
    //         }
    //         break;
            
    //       case 'paddle_move':
    //         const { matchId, position } = data.payload;
    //         const opponentId = await getOpponentId(clientId, matchId);
            
    //         if (opponentId) {
    //           wsAdapter.sendToClient(opponentId, 'opponent_paddle_move', {
    //             position
    //           });
    //         }
    //         break;
            
    //       case 'ball_update':
    //         const { matchId: ballMatchId, ballData } = data.payload;
    //         const ballOpponentId = await getOpponentId(clientId, ballMatchId);
            
    //         if (ballOpponentId) {
    //           wsAdapter.sendToClient(ballOpponentId, 'ball_sync', {
    //             ballData
    //           });
    //         }
    //         break;
            
    //       case 'goal_scored':
    //         const { matchId: goalMatchId, scoringPlayer, newScore } = data.payload;
    //         const goalOpponentId = await getOpponentId(clientId, goalMatchId);
            
    //         if (goalOpponentId) {
    //           wsAdapter.sendToClient(goalOpponentId, 'goal_update', {
    //             scoringPlayer,
    //             newScore
    //           });
              
    //           wsAdapter.sendToClient(clientId, 'goal_update', {
    //             scoringPlayer,
    //             newScore
    //           });
    //         }
    //         break;
            
    //       case 'match_complete':
    //         const { matchId: completedMatchId, winner, finalScore } = data.payload;
    //         const matchResult = await matchmakingService.updateMatchResult(
    //           completedMatchId, 
    //           { goals: finalScore }, 
    //           winner
    //         );
            
    //         const completeOpponentId = await getOpponentId(clientId, completedMatchId);

    //         if (completeOpponentId) {
    //           const formattedResults = {
    //             matchId: completedMatchId,
    //             winner,
    //             finalScore,
    //             eloChange: {}
    //           };
              
    //           if (matchResult.winner) {
    //             formattedResults.eloChange[matchResult.winner.playerId] = 
    //               matchResult.winner.eloAfter - matchResult.winner.eloBefore;
    //             formattedResults.eloChange[matchResult.loser.playerId] = 
    //               matchResult.loser.eloAfter - matchResult.loser.eloBefore;
    //           } else if (matchResult.draw) {
    //             matchResult.draw.forEach(player => {
    //               formattedResults.eloChange[player.playerId] = 
    //                 player.eloAfter - player.eloBefore;
    //             });
    //           }
              
    //           wsAdapter.sendToClient(clientId, 'match_results', formattedResults);
    //           wsAdapter.sendToClient(completeOpponentId, 'match_results', formattedResults);
              
    //           completeMatch(completedMatchId);
    //         }
    //         break;
    //     }
        
    //   } catch (err) {
    //     fastify.log.error(`Error processing WebSocket message: ${err.message}`);
    //     socket.send(JSON.stringify({
    //       type: 'error',
    //       payload: { message: 'Invalid message format' }
    //     }));
    //   }
    // });
    
    socket.on('close', () => {
      fastify.log.info(`WebSocket connection closed: ${clientId}`);
      
      matchmakingService.removeFromQueue(clientId);
      
      wsAdapter.removeClient(clientId);
    });
  });
  
  const activeMatches = new Map();
  const userMatches = new Map();
  
  async function getOpponentId(playerId, matchId) {
    const matchData = activeMatches.get(matchId);
    if (!matchData) {
      const matchWithPlayers = await matchmakingService.getMatchWithPlayers(matchId);
      if (!matchWithPlayers) return null;
      
      const players = matchWithPlayers.players.map(p => p.player_id);
      return players.find(id => id != playerId);
    }
    
    return matchData.player1Id === playerId ? matchData.player2Id : matchData.player1Id;
  }
  
  async function trackMatch(matchId, player1Id, player2Id) {
    activeMatches.set(matchId, { player1Id, player2Id });
    userMatches.set(player1Id, matchId);
    userMatches.set(player2Id, matchId);
  }
  
  function completeMatch(matchId) {
    const matchData = activeMatches.get(matchId);
    if (matchData) {
      userMatches.delete(matchData.player1Id);
      userMatches.delete(matchData.player2Id);
      activeMatches.delete(matchId);
    }
  }
}