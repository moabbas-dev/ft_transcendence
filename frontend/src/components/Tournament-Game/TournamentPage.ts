import { t } from "../../languages/LanguageController.js";
import { TournamentClient } from "./TournamentClient.js";
import { Player, WaitingRoom } from "./WaitingRoom.js";
import TournamentBrackets from "./TournamentBrackets.js";
import { renderResultsTab } from "./TournamentResults.js";
import { OnlineGameBoard } from "../Online-Game/components/OnlineGameBoard.js";
import store from "../../../store/store.js";
import { fetchUserDetails } from "../../main.js";
import { CreateTournamentForm } from "./CreateTournamentForm.js";
import { Tournament, TournamentList, fetchTournaments } from "./TournamentList.js";
import { showTournamentMatchNotification } from "./TournamentMatchNotification.js";
import { tournamentClient } from "../../main.js";
import { navigate } from "../../router.js";

export default {
	render: (container: HTMLElement) => {
		const userId = store.userId;
	
		// Create a single tournament client instance
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const client = tournamentClient || new TournamentClient(`${protocol}//${window.location.hostname}:${window.location.port}/matchmaking/`, userId as string);
		
		if (!tournamentClient) {
			client.initialize().catch(err => {
			  console.error("NO GLOBAL TOURNAMENT CLIENT:", err);
			});
		  }

		// Tournament state
		let currentTournamentId: string | null = null;
		let currentView: 'list' | 'create' | 'waiting' | 'brackets' | 'results' = 'list';
		let tournaments: Tournament[] = [];

		container.className = "bg-ponghover w-full h-dvh flex flex-col items-center justify-center";
		container.innerHTML = `
    <div class="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold text-white mb-4">${t('play.tournaments.title')}</h1>
      
      <div class="tabs flex border-b border-gray-700 mb-4">
        <button id="tab-create" class="tab-btn py-2 px-4 text-white bg-blue-600 rounded-t-lg mr-2">${t('play.tournaments.createTab')}</button>
        <button id="tab-join" class="tab-btn py-2 px-4 text-gray-300 hover:bg-gray-700 rounded-t-lg mr-2">${t('play.tournaments.joinTab')}</button>
        <button id="tab-active" class="tab-btn py-2 px-4 text-gray-300 hover:bg-gray-700 rounded-t-lg">${t('play.tournaments.myTournamentsTab')}</button>
      </div>
      
      <div id="main-content" class="p-4 bg-gray-900 rounded-lg">
        <!-- Main content will be rendered here -->
      </div>
    </div>
  `;

		// Initialize the create tournament form first
		showCreateTournamentForm();

		// Tab switching logic
		const tabButtons = container.querySelectorAll('.tab-btn');
		tabButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				// Remove active class from all buttons
				tabButtons.forEach(b => {
					b.classList.remove('bg-blue-600', 'text-white');
					b.classList.add('text-gray-300', 'hover:bg-gray-700');
				});

				// Add active class to clicked button
				btn.classList.add('bg-blue-600', 'text-white');
				btn.classList.remove('text-gray-300', 'hover:bg-gray-700');

				// Show appropriate tab content
				const tabId = btn.id.replace('tab-', '');
				showTabContent(tabId);
			});
		});

		// Initialize WebSocket event listeners
		initWebSocketListeners();

		function showTabContent(tab: string) {
			const mainContent = container.querySelector('#main-content');
			if (!mainContent) return;

			switch (tab) {
				case 'create':
					showCreateTournamentForm();
					break;
				case 'join':
					showJoinTournamentTab();
					break;
				case 'active':
					showActiveTournamentsTab();
					break;
			}
		}

		function showCreateTournamentForm() {
			currentView = 'create';
			const mainContent = container.querySelector('#main-content');
			if (!mainContent) return;

			mainContent.innerHTML = '';
			mainContent.appendChild(CreateTournamentForm({
				onTournamentCreated: (tournament: { id: string; playerCount?: number; player_count?: number }) => {
					navigate(`/tournaments/${tournament.id}`);
				}, client
			}));
		}

		function showJoinTournamentTab() {
			currentView = 'list';
			const mainContent = container.querySelector('#main-content');
			if (!mainContent) return;

			// Show loading state
			mainContent.innerHTML = `
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pongcyan"></div>
          <p class="mt-2 text-gray-400">${t('play.tournaments.joinTournament.loading')}</p>
        </div>
      `;

			// Fetch tournaments
			fetchTournaments((fetchedTournaments) => {
				tournaments = fetchedTournaments;
				
				if (mainContent) {
					mainContent.innerHTML = '';
					interface TournamentListProps {
						tournaments: Tournament[];
						onJoinTournament: (tournamentId: string) => void;
						onTournamentSelected: (tournament: Tournament) => void;
					}

					mainContent.appendChild(TournamentList({
						tournaments,
						onJoinTournament: (tournamentId: string) => {
							client.joinTournament(tournamentId);
							navigate(`/tournaments/${tournamentId}`);
						},
						onTournamentSelected: (tournament: Tournament) => {
							currentTournamentId = tournament.id;
							navigate(`/tournaments/${tournament.id}`);
						}
					} as TournamentListProps));
				}
			}, client);
		}

		function showActiveTournamentsTab() {
			// This would show tournaments the user is participating in
			// For simplicity, we'll just reuse the join tab but filter for tournaments
			// that include this user
			currentView = 'list';
			const mainContent = container.querySelector('#main-content');
			if (!mainContent) return;

			// Show loading state
			mainContent.innerHTML = `
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pongcyan"></div>
          <p class="mt-2 text-gray-400">${t('play.tournaments.myTournaments.loading')}</p>
        </div>
      `;

			// For real implementation, you would need a backend route to get user's tournaments
			// For now, we'll just use the existing tournaments and filter client-side
			client.listTournaments();
		}

		function initWebSocketListeners() {
			// Tournament joined response
			client.on('tournament_joined', (data) => {
				if (data.success) {
					currentTournamentId = data.tournamentId;
					client.getTournamentDetails(data.tournamentId);
				}
			});

			// Tournament player joined
			client.on('tournament_player_joined', (data) => {
				// This will be handled by the WaitingRoom component
			});

			// Tournament started
			client.on('tournament_started', (data) => {
				if (currentTournamentId === data.tournamentId) {
					showTournamentBrackets(data);
				} else {
					console.error("[TournamentPage]: Ids don't match");
				  }
			});

			// Tournament match completed
			client.on('tournament_match_completed', (data) => {
				// This will be handled by the TournamentBrackets component
				if (currentTournamentId === data.tournamentId && currentView === 'brackets') {
					// Refresh brackets with updated data
					showTournamentBrackets(data);
				}
			});

			// Tournament completed
			client.on('tournament_completed', (data) => {
				if (currentTournamentId === data.tournamentId) {
					showTournamentResults(data);
				}
			});

			// Tournament list
			client.on('tournament_list', (data) => {
				tournaments = data.tournaments || [];
				
				if (currentView === 'list') {
					const mainContent = container.querySelector('#main-content');
					if (!mainContent) return;
					
					mainContent.innerHTML = '';
					interface TournamentListProps {
						tournaments: Tournament[];
						onJoinTournament: (tournamentId: string) => void;
						onTournamentSelected: (tournament: Tournament) => void;
					}

					mainContent.appendChild(TournamentList({
						tournaments,
						onJoinTournament: (tournamentId: string) => {
							client.joinTournament(tournamentId);
						},
						onTournamentSelected: (tournament: Tournament) => {
							currentTournamentId = tournament.id;
							client.getTournamentDetails(tournament.id);
						}
					} as TournamentListProps));
				}
			});

			// Tournament match notification
			client.on('tournament_match_notification', (data) => {
				// Show match notification popup
				showTournamentMatchNotification({
					tournamentId: data.tournamentId,
					matchId: data.matchId,
					opponent: data.opponent,
					onAccept: (matchId) => {
						// Start the match
						startTournamentMatch(matchId, {
							players: data.matchPlayers,
							tournamentName: "Tournament Match",
							round: data.round || 1
						}, userId as string);
					}
				});
			});
		}

		function showTournamentBrackets(data: any) {
			currentView = 'brackets';

			const mainContent = container.querySelector('#main-content');
			if (!mainContent) return;

			mainContent.innerHTML = '';

			// Add tournament name header
			const header = document.createElement('div');
			header.className = 'flex justify-between items-center mb-4';
			header.innerHTML = `
      <h2 class="text-xl text-white font-bold">${data.tournament.name}</h2>
      <div class="text-sm text-gray-400">${data.tournament.player_count} ${t('play.tournaments.createTournament.players')}</div>
    `;

			mainContent.appendChild(header);

			// Convert tournament matches to the format expected by TournamentBrackets
			const formattedMatches = formatMatchesForBrackets(data);

			mainContent.appendChild(TournamentBrackets({
				playersCount: data.tournament.player_count,
				matches: formattedMatches,
				onMatchClick: (matchId: string) => {
					// Find the match in tournament data
					const match = data.matches.find((m: any) => m.id === matchId);
					if (!match) return;

					// Check if this player is part of this match
					const matchPlayers = match.players || [];
					const isPlayerInMatch = matchPlayers.some((p: any) => p.user_id === userId);

					// Only allow interaction if player is in this match and match is not completed
					if (isPlayerInMatch && match.status !== 'completed') {
						// Start the match
						startTournamentMatch(matchId, {
							players: matchPlayers.map((p: any) => ({
								userId: p.user_id,
								username: p.nickname || `Player ${p.user_id}`,
								elo: p.elo_before
							})),
							tournamentName: data.tournament.name,
							round: match.round
						}, userId as string);
					}
				}
			}));
		}

		function formatMatchesForBrackets(tournamentData: any) {
			return tournamentData.matches.map((match: any) => {
				const player1 = (match.players || []).find((p: any) => p.position === 1);
				const player2 = (match.players || []).find((p: any) => p.position === 2);

				return {
					id: match.id,
					round: match.round || 0,
					position: match.position || 0,
					player1: player1 ? {
						id: player1.user_id,
						username: player1.nickname || `Player ${player1.user_id}`
					} : undefined,
					player2: player2 ? {
						id: player2.user_id,
						username: player2.nickname || `Player ${player2.user_id}`
					} : undefined,
					winner: match.winner_id ? {
						id: match.winner_id,
						username: tournamentData.players.find((p: any) => p.user_id === match.winner_id)?.nickname || `Player ${match.winner_id}`
					} : undefined,
					score1: match.player1_score,
					score2: match.player2_score,
					isCompleted: match.status === 'completed'
				};
			});
		}

		// Function to handle starting a tournament match
		function startTournamentMatch(matchId: string, matchData: any, userId: string) {
			// Clear the current view
			const mainContent = document.querySelector('#main-content');
			if (!mainContent) return;

			mainContent.innerHTML = '';

			// Create a match header
			const matchHeader = document.createElement('div');
			matchHeader.className = 'flex justify-between items-center p-4 bg-gray-800 mb-4';

			// Get opponent info
			const opponent = matchData.players.find((p: any) => p.userId !== userId);
			const isPlayer1 = matchData.players[0].userId === userId;

			matchHeader.innerHTML = `
	  <div class="flex items-center gap-4">
		<div class="text-xl text-white font-bold">Tournament Match</div>
		<div class="text-pongcyan">${matchData.tournamentName || 'Round'} ${matchData.round || ''}</div>
	  </div>
	  <div class="flex items-center gap-4">
		<div class="flex flex-col items-end">
		  <div class="text-lg text-white">
			<span id="player-score1">0</span> - <span id="player-score2">0</span>
		  </div>
		  <div class="text-sm text-gray-300">vs ${opponent ? opponent.username : 'Opponent'}</div>
		</div>
		${opponent && opponent.avatar ?
					`<div class="size-10 rounded-full overflow-hidden">
			 <img src="${opponent.avatar}" alt="${opponent.username}" class="size-full object-cover">
		   </div>` :
					`<div class="size-10 rounded-full bg-pongcyan flex items-center justify-center text-white font-bold">
			 ${opponent && opponent.username ? opponent.username.charAt(0).toUpperCase() : '?'}
		   </div>`
				}
	  </div>
	`;

			mainContent.appendChild(matchHeader);

			// Create canvas for the game
			const canvas = document.createElement('canvas');
			canvas.width = 800;
			canvas.height = 600;
			canvas.className = 'bg-black mx-auto';
			mainContent.appendChild(canvas);

			// Create tournament client for the game
			// const client = new TournamentClient(window.location.origin.replace('http', 'ws'), userId);
			// we will discuss the line above later when we start the game through tournament

			// Initialize the game using OnlineGameBoard
			const opponentId = opponent ? opponent.userId : matchData.players.find((p: any) => p.userId !== userId)?.userId;

			if (!opponentId) {
				console.error('Could not find opponent ID');
				return;
			}

			new OnlineGameBoard(
				canvas,
				matchHeader,
				client,
				matchId,
				userId,
				opponentId,
				isPlayer1
			);
		}

		function showTournamentResults(data: any) {
			currentView = 'results';

			const mainContent = container.querySelector('#main-content') as HTMLElement;
			if (!mainContent) return;

			mainContent.innerHTML = '';

			// Add tournament name header
			const header = document.createElement('div');
			header.className = 'flex justify-between items-center mb-4';
			header.innerHTML = `
      <h2 class="text-xl text-white font-bold">${data.tournament.name} - ${t('play.tournaments.results')}</h2>
      <div class="text-sm text-gray-400">${data.tournament.player_count} ${t('play.tournaments.createTournament.players')}</div>
    `;

			mainContent.appendChild(header);

			// Format results data
			const results = data.players.map((player: any) => {
				return {
					userId: player.user_id,
					username: player.nickname || `Player ${player.user_id}`,
					avatarUrl: player.avatar_url,
					place: player.placement || (player.user_id === data.champion ? 1 : 2)
				};
			});

			// Render results
			renderResultsTab(mainContent, results);

			// Add a button to go back to tournaments
			const backButton = document.createElement('button');
			backButton.className = 'mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700';
			backButton.textContent = t('play.tournaments.backToTournaments');
			backButton.addEventListener('click', () => {
				// Reset tournament state
				currentTournamentId = null;

				// Go back to tournaments list
				showTabContent('join');
			});

			mainContent.appendChild(backButton);
		}

		return container;
	}
};