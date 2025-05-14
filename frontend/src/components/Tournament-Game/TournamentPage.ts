import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";
import { TournamentClient } from "./TournamentClient.js";
import { Player, WaitingRoom } from "./WaitingRoom.js";
import TournamentBrackets from "./TournamentBrackets.js";
import { renderResultsTab } from "./TournamentResults.js";
import { OnlineGameBoard } from "../Online-Game/components/OnlineGameBoard.js";
import store from "../../../store/store.js";

export interface TournamentPageProps {
	userId: string;
}

export const TournamentPage = createComponent((props: TournamentPageProps) => {
	const userId = props.userId || store.userId;

	// WebSocket connection URL - replace with your actual WebSocket URL
	const wsUrl = `ws://${window.location.host}`;

	// Create tournament client
	const client = new TournamentClient(wsUrl, userId as string);

	// Tournament state
	let currentTournamentId: string | null = null;
	let currentView: 'list' | 'create' | 'waiting' | 'brackets' | 'results' = 'list';

	const container = document.createElement('div');
	container.className = "w-full h-full flex flex-col";
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
        ${renderCreateTab()}
      </div>
    </div>
  `;

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

	// Initialize event listeners
	initEventListeners();

	// Initialize WebSocket event listeners
	initWebSocketListeners();

	// Helper functions
	function initEventListeners() {
		// Create tournament form submission
		container.addEventListener('submit', (e) => {
			const target = e.target as HTMLFormElement;
			if (target && target.id === 'create-tournament-form') {
				e.preventDefault();
				const nameInput = target.querySelector('#tournament-name') as HTMLInputElement;
				const countSelect = target.querySelector('#player-count') as HTMLSelectElement;

				if (nameInput && countSelect) {
					const name = nameInput.value;
					const playerCount = parseInt(countSelect.value);

					client.createTournament(name, playerCount);
				}
			}
		});
	}

	function initWebSocketListeners() {
		client.on('tournament_created', (data) => {
			currentTournamentId = data.tournament.id;
			showWaitingRoom({
				tournamentId: currentTournamentId,
				playerCount: data.tournament.player_count,
				players: [{
					userId: userId,
					username: store.nickname || `Player ${userId}`,
					joinedAt: new Date().toISOString()
				}],
				isCreator: true
			});
		});

		// Tournament joined response
		client.on('tournament_joined', (data) => {
			if (data.success) {
				currentTournamentId = data.tournamentId;
				client.getTournamentDetails(data.tournamentId);
			}
		});

		// Tournament details response
		client.on('tournament_details', (data) => {
			if (currentTournamentId === data.tournament.id) {
				if (data.tournament.status === 'registering') {
					showWaitingRoom({
						tournamentId: data.tournament.id,
						playerCount: data.tournament.player_count,
						players: data.players.map((p: any) => ({
							userId: p.user_id,
							username: p.nickname || `Player ${p.user_id}`,
							avatar: p.avatar_url,
							rank: p.elo ? `ELO: ${p.elo}` : undefined,
							joinedAt: p.joined_at
						})),
						isCreator: data.tournament.creator_id === userId
					});
				} else if (data.tournament.status === 'in_progress') {
					showTournamentBrackets(data);
				} else if (data.tournament.status === 'completed') {
					showTournamentResults(data);
				}
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
			}
		});

		// Tournament match completed
		client.on('tournament_match_completed', (data) => {
			// This will be handled by the TournamentBrackets component
		});

		// Tournament completed
		client.on('tournament_completed', (data) => {
			if (currentTournamentId === data.tournamentId) {
				showTournamentResults(data);
			}
		});

		// Tournament list
		client.on('tournament_list', (data) => {
			if (currentView === 'list') {
				renderTournamentList(data.tournaments);
			}
		});

		// Tournament match notification
		client.on('tournament_match_notification', (data) => {
			// This will be handled by the TournamentBrackets component or a separate function
		});
	}

	function showTabContent(tab: string) {
		const mainContent = container.querySelector('#main-content');
		if (!mainContent) return;

		switch (tab) {
			case 'create':
				mainContent.innerHTML = renderCreateTab();
				currentView = 'create';
				break;
			case 'join':
				mainContent.innerHTML = renderJoinTab();
				currentView = 'list';
				// Fetch tournaments list
				client.listTournaments();
				break;
			case 'active':
				mainContent.innerHTML = renderActiveTab();
				// TODO: Fetch user's active tournaments
				break;
		}
	}

	function renderCreateTab() {
		return `
      <div id="create-tab" class="tab-content">
        <h2 class="text-xl text-white mb-4">${t('play.tournaments.createTournament.title')}</h2>
        <form id="create-tournament-form" class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2" for="tournament-name">${t('play.tournaments.createTournament.name')}</label>
            <input type="text" id="tournament-name" class="w-full p-2 bg-gray-800 text-white rounded" required>
          </div>
          <div>
            <label class="block text-gray-300 mb-2" for="player-count">${t('play.tournaments.createTournament.playerCount')}</label>
            <select id="player-count" class="w-full p-2 bg-gray-800 text-white rounded">
              <option value="4">4 ${t('play.tournaments.createTournament.players')}</option>
              <option value="8">8 ${t('play.tournaments.createTournament.players')}</option>
            </select>
          </div>
          <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ${t('play.tournaments.createTournament.createButton')}
          </button>
        </form>
      </div>
    `;
	}

	function renderJoinTab() {
		return `
      <div id="join-tab" class="tab-content">
        <h2 class="text-xl text-white mb-4">${t('play.tournaments.joinTournament.title')}</h2>
        <div class="mb-4">
          <input type="text" id="tournament-search" placeholder="${t('play.tournaments.joinTournament.searchPlaceholder')}" class="w-full p-2 bg-gray-800 text-white rounded">
        </div>
        <div id="tournament-list" class="space-y-3">
          <div class="text-gray-400 text-center py-8">${t('play.tournaments.joinTournament.loading')}</div>
        </div>
      </div>
    `;
	}

	function renderActiveTab() {
		return `
      <div id="active-tab" class="tab-content">
        <h2 class="text-xl text-white mb-4">${t('play.tournaments.myTournaments.title')}</h2>
        <div id="my-tournaments" class="space-y-3">
          <div class="text-gray-400 text-center py-8">${t('play.tournaments.myTournaments.loading')}</div>
        </div>
      </div>
    `;
	}

	function renderTournamentList(tournaments: any[]) {
		const tournamentList = container.querySelector('#tournament-list');
		if (!tournamentList) return;

		if (!tournaments || tournaments.length === 0) {
			tournamentList.innerHTML = `
        <div class="text-gray-400 text-center py-8">
          ${t('play.tournaments.joinTournament.noTournaments')}
        </div>
      `;
			return;
		}

		tournamentList.innerHTML = '';

		tournaments.forEach(tournament => {
			const tournamentItem = document.createElement('div');
			tournamentItem.className = "tournament-item p-4 bg-gray-800 rounded-lg";

			// Determine if tournament is full
			const isFull = tournament.registered_players >= tournament.player_count;

			tournamentItem.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h3 class="tournament-name text-lg font-medium text-white">${tournament.name}</h3>
          <span class="text-sm text-gray-400">${tournament.player_count} ${t('play.tournaments.createTournament.players')}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-300">${tournament.registered_players}/${tournament.player_count} ${t('play.tournaments.joinTournament.registered')}</span>
          <button 
            data-id="${tournament.id}" 
            class="join-btn px-3 py-1 ${isFull ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded"
            ${isFull ? 'disabled' : ''}
          >
            ${isFull ? t('play.tournaments.joinTournament.full') : t('play.tournaments.joinTournament.join')}
          </button>
        </div>
      `;

			tournamentList.appendChild(tournamentItem);

			// Add join button event listener if not full
			if (!isFull) {
				const joinBtn = tournamentItem.querySelector('.join-btn');
				if (joinBtn) {
					joinBtn.addEventListener('click', () => {
						const tournamentId = joinBtn.getAttribute('data-id');
						if (tournamentId) {
							client.joinTournament(tournamentId);
						}
					});
				}
			}
		});

		// Add event listener for search input
		const searchInput = container.querySelector('#tournament-search') as HTMLInputElement;
		if (searchInput) {
			searchInput.addEventListener('input', () => {
				const searchValue = searchInput.value.toLowerCase();
				const items = tournamentList.querySelectorAll('.tournament-item');

				items.forEach(item => {
					const name = item.querySelector('.tournament-name')?.textContent?.toLowerCase() || '';
					if (name.includes(searchValue)) {
						(item as HTMLElement).style.display = 'block';
					} else {
						(item as HTMLElement).style.display = 'none';
					}
				});
			});
		}
	}

	function showWaitingRoom(waitingRoomProps: any) {
		currentView = 'waiting';

		const mainContent = container.querySelector('#main-content');
		if (!mainContent) return;

		mainContent.innerHTML = '';
		mainContent.appendChild(WaitingRoom({
			...waitingRoomProps,
			client,
			onPlayerJoin: (player: Player) => {
				console.log('Player joined:', player);
			},
			onTournamentStart: () => {
				// Tournament is starting, get details to show brackets
				client.getTournamentDetails(currentTournamentId!);
			}
		}));
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
			tournamentId: data.tournament.id,
			playersCount: data.tournament.player_count,
			matches: formattedMatches,
			client,
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
		const client = new TournamentClient(window.location.origin.replace('http', 'ws'), userId);

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

	// Function to show match notification
	function showMatchNotification(matchId: string, opponent: any) {
		// Create a modal notification
		const modal = document.createElement('div');
		modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50';
		modal.innerHTML = `
	  <div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
		<h2 class="text-2xl font-bold text-white mb-4">Your Match is Ready!</h2>
		<div class="bg-gray-700 p-4 rounded-lg mb-4">
		  <div class="flex items-center gap-4">
			<div class="size-12 rounded-full bg-pongcyan flex items-center justify-center text-white text-xl font-bold">
			  ${opponent?.username ? opponent.username.charAt(0).toUpperCase() : '?'}
			</div>
			<div>
			  <div class="text-lg text-white font-medium">${opponent?.username || 'Opponent'}</div>
			  <div class="text-sm text-gray-300">ELO: ${opponent?.elo || 'N/A'}</div>
			</div>
		  </div>
		</div>
		<p class="text-gray-300 mb-6">Your tournament match is ready to begin. Click below to start playing!</p>
		<div class="flex justify-end gap-4">
		  <button id="start-match-btn" class="px-4 py-2 bg-pongcyan text-white rounded hover:bg-blue-600 transition-colors">
			Start Match
		  </button>
		</div>
	  </div>
	`;

		document.body.appendChild(modal);

		// Add event listener to start match button
		const startBtn = modal.querySelector('#start-match-btn');
		if (startBtn) {
			startBtn.addEventListener('click', () => {
				document.body.removeChild(modal);

				// Start the match
				// You need to get the match data first
				const client = new TournamentClient(window.location.origin.replace('http', 'ws'), userId as string);
				client.on('tournament_details', (data) => {
					const match = data.matches.find((m: any) => m.id === matchId);
					if (match) {
						startTournamentMatch(matchId, {
							players: match.players.map((p: any) => ({
								userId: p.user_id,
								username: p.nickname || `Player ${p.user_id}`,
								elo: p.elo_before
							})),
							tournamentName: data.tournament.name,
							round: match.round
						}, userId as string);
					}
				});

				// Fetch tournament details to get match data
				// client.getTournamentDetails(data.tournamentId);
			});
		}
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

	// Showing match notification would be handled by the tournament brackets component or when client receives match notification

	return container;
});
