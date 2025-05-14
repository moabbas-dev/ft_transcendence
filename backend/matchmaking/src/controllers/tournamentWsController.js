import TournamentService from '../services/tournament.js';

/**
 * events:
 * 	create_tournament
 * 	 sendToClient:
 *    tournament_created
 * 
 *  join_tournament
 *   sendToClient:
 *    tournament_joined
 *    tournament_player_joined
 * 
 *  start_tournament
 *   sendToClient:
 *    tournament_started
 * 
 *  
 *    
 */

export function registerTournamentMessageHandlers(wsAdapter) {
	wsAdapter.registerMessageHandler('create_tournament', async (clientId, payload) => {
		try {
			const { name, playerCount } = payload;
			const tournament = await TournamentService.createTournament(name, playerCount);

			await TournamentService.registerPlayer(tournament.id, clientId);

			wsAdapter.sendToClient(clientId, 'tournament_created', { tournament });
		} catch (error) {
			console.error('Error creating tournament:', error);
			wsAdapter.sendToClient(clientId, 'error', {
				message: `Error creating tournament: ${error.message}`
			});
		}
	});

	wsAdapter.registerMessageHandler('join_tournament', async (clientId, payload) => {
		try {
			const { tournamentId } = payload;

			const result = await TournamentService.registerPlayer(tournamentId, clientId);

			wsAdapter.sendToClient(clientId, 'tournament_joined', {
				tournamentId,
				success: true
			});

			const tournamentDetails = await TournamentService.getTournamentDetails(tournamentId);
			const playerIds = tournamentDetails.players.map(p => p.user_id);

			playerIds.forEach(playerId => {
				wsAdapter.sendToClient(playerId, 'tournament_player_joined', {
					tournamentId,
					players: tournamentDetails.players
				});
			});

			if (tournamentDetails.tournament.status === 'in_progress') {
				playerIds.forEach(playerId => {
					wsAdapter.sendToClient(playerId, 'tournament_started', {
						tournamentId,
						tournament: tournamentDetails.tournament,
						matches: tournamentDetails.matches
					});
				});
			}
		} catch (error) {
			console.error('Error joining tournament:', error);
			wsAdapter.sendToClient(clientId, 'error', {
				message: `Error joining tournament: ${error.message}`
			});
		}
	});

	wsAdapter.registerMessageHandler('start_tournament', async (clientId, payload) => {
		try {
			const { tournamentId } = payload;

			const result = await TournamentService.startTournament(tournamentId);

			const tournamentDetails = await TournamentService.getTournamentDetails(tournamentId);
			const playerIds = tournamentDetails.players.map(p => p.user_id);

			playerIds.forEach(playerId => {
				wsAdapter.sendToClient(playerId, 'tournament_started', {
					tournamentId,
					tournament: tournamentDetails.tournament,
					matches: tournamentDetails.matches
				});
			});
		} catch (error) {
			console.error('Error starting tournament:', error);
			wsAdapter.sendToClient(clientId, 'error', {
				message: `Error starting tournament: ${error.message}`
			});
		}
	});

	wsAdapter.registerMessageHandler('tournament_match_result', async (clientId, payload) => {
		try {
			const { matchId, winnerId } = payload;

			const result = await TournamentService.updateTournamentMatchResult(matchId, winnerId);

			// Get tournament details
			const tournamentId = result.tournamentId;
			const tournamentDetails = await TournamentService.getTournamentDetails(tournamentId);

			// Get all players in this tournament
			const playerIds = tournamentDetails.players.map(p => p.user_id);

			// Notify all players about match result and tournament progression
			playerIds.forEach(playerId => {
				wsAdapter.sendToClient(playerId, 'tournament_match_completed', {
					tournamentId,
					matchId,
					result,
					tournament: tournamentDetails.tournament,
					matches: tournamentDetails.matches
				});
			});

			// If tournament is completed, notify all players
			if (tournamentDetails.tournament.status === 'completed') {
				playerIds.forEach(playerId => {
					wsAdapter.sendToClient(playerId, 'tournament_completed', {
						tournamentId,
						tournament: tournamentDetails.tournament,
						champion: result.champion
					});
				});
			}
		} catch (error) {
			console.error('Error updating tournament match result:', error);
			wsAdapter.sendToClient(clientId, 'error', {
				message: `Error updating tournament match result: ${error.message}`
			});
		}
	});

	// Get tournament details
	wsAdapter.registerMessageHandler('get_tournament_details', async (clientId, payload) => {
		try {
			const { tournamentId } = payload;

			const tournamentDetails = await TournamentService.getTournamentDetails(tournamentId);

			wsAdapter.sendToClient(clientId, 'tournament_details', tournamentDetails);
		} catch (error) {
			console.error('Error getting tournament details:', error);
			wsAdapter.sendToClient(clientId, 'error', {
				message: `Error getting tournament details: ${error.message}`
			});
		}
	});

	// List active tournaments
	wsAdapter.registerMessageHandler('list_tournaments', async (clientId, payload) => {
		try {
			const tournaments = await TournamentService.getActiveTournaments();

			wsAdapter.sendToClient(clientId, 'tournament_list', { tournaments });
		} catch (error) {
			console.error('Error listing tournaments:', error);
			wsAdapter.sendToClient(clientId, 'error', {
				message: `Error listing tournaments: ${error.message}`
			});
		}
	});

	// Tournament match setup handler
	wsAdapter.registerMessageHandler('tournament_match_ready', async (clientId, payload) => {
		try {
			const { matchId } = payload;

			// Get match details
			const matchWithPlayers = await TournamentService.getMatchWithPlayers(matchId);

			if (!matchWithPlayers) {
				throw new Error(`Match ${matchId} not found`);
			}

			const { match, players } = matchWithPlayers;

			// Notify both players about the match
			players.forEach(player => {
				wsAdapter.sendToClient(player.player_id, 'tournament_match_notification', {
					tournamentId: match.tournament_id,
					matchId: match.id,
					matchPlayers: players.map(p => ({
						userId: p.player_id,
						username: p.nickname || `Player ${p.player_id}`,
						elo: p.elo_score
					}))
				});
			});
		} catch (error) {
			console.error('Error setting up tournament match:', error);
			wsAdapter.sendToClient(clientId, 'error', {
				message: `Error setting up tournament match: ${error.message}`
			});
		}
	});
}