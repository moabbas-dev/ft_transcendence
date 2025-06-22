import { t } from "../../languages/LanguageController.js";
import { TournamentClient } from "./TournamentClient.js";
import store from "../../../store/store.js";
import { CreateTournamentForm } from "./CreateTournamentForm.js";
import { Tournament, TournamentList, fetchTournaments } from "./TournamentList.js";
import { tournamentClient } from "../../main.js";
import { navigate } from "../../router.js";

interface TournamentListProps {
	tournaments: Tournament[];
	onJoinTournament: (tournamentId: string) => void;
	onTournamentSelected: (tournament: Tournament) => void;
}

export default {
	render: (container: HTMLElement) => {
		const userId = store.userId;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const client = tournamentClient || new TournamentClient(`${protocol}//${window.location.hostname}:${window.location.port}/matchmaking/`, userId as string);
		if (!tournamentClient) {
			client.initialize().catch(err => {
			  console.error("NO GLOBAL TOURNAMENT CLIENT:", err);
			});
		}

		let currentTournamentId: string | null = null;
		let currentView: 'list' | 'create' | 'waiting' | 'brackets' | 'results' = 'list';
		let tournaments: Tournament[] = [];

		container.className = "bg-ponghover w-full h-dvh flex flex-col items-center justify-center";
		container.innerHTML = `
			<div class="container size-full p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center gap-4">
				<h1 class="text-2xl font-bold text-white drop-shadow-pongcyan">${t('play.tournaments.title')}</h1>
				
				<div class="tabs flex justify-center gap-2 border-b w-full border-gray-700">
					<button id="tab-create" class="tab-btn py-2 px-2 sm:px-4 text-white bg-pongcyan drop-shadow-pongcyan rounded-t-lg">${t('play.tournaments.createTab')}</button>
					<button id="tab-join" class="tab-btn py-2 px-2 sm:px-4 text-gray-300 hover:bg-gray-700 rounded-t-lg">${t('play.tournaments.joinTab')}</button>
					<button id="tab-active" class="tab-btn py-2 px-2 sm:px-4 text-gray-300 hover:bg-gray-700 rounded-t-lg">${t('play.tournaments.myTournamentsTab')}</button>
				</div>
				
				<div id="main-content" class="w-full h-[calc(100%-20%)] flex-1 p-4 bg-gray-900 rounded-lg">
					<!-- Main content will be rendered here -->
				</div>
			</div>
		`;

		showCreateTournamentForm();

		const tabButtons = container.querySelectorAll('.tab-btn');
		tabButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				tabButtons.forEach(b => {
					b.classList.remove('bg-pongcyan', 'text-white', 'drop-shadow-pongcyan');
					b.classList.add('text-gray-300', 'hover:bg-gray-700');
				});

				btn.classList.add('bg-pongcyan', 'text-white', 'drop-shadow-pongcyan');
				btn.classList.remove('text-gray-300', 'hover:bg-gray-700');

				const tabId = btn.id.replace('tab-', '');
				showTabContent(tabId);
			});
		});

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
			mainContent.innerHTML = `
				<div class="text-center py-8">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pongcyan"></div>
				<p class="mt-2 text-gray-400">${t('play.tournaments.joinTournament.loading')}</p>
				</div>
			`;

			fetchTournaments((fetchedTournaments) => {
				tournaments = fetchedTournaments;
				
				if (mainContent) {
					mainContent.innerHTML = '';
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
			currentView = 'list';
			const mainContent = container.querySelector('#main-content');
			if (!mainContent) return;
			
			mainContent.innerHTML = `
			  <div class="text-center py-8">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pongcyan"></div>
				<p class="mt-2 text-gray-400">${t('play.tournaments.myTournaments.loading')}</p>
			  </div>
			`;
		  
			const onUserTournamentList = (data: any) => {
			  tournaments = data.tournaments || [];
			  
			  if (mainContent) {
				mainContent.innerHTML = '';
				
				if (tournaments.length === 0) {
				  mainContent.innerHTML = `
					<div class="text-center py-8 text-gray-400">
					  <i class="fas fa-trophy text-4xl mb-4 opacity-30"></i>
					  <p>${t('play.tournaments.myTournaments.noTournaments')}</p>
					  <p class="text-sm mt-2">${t('play.tournaments.myTournaments.createOrJoin')}</p>
					</div>
				  `;
				} else {
				  mainContent.appendChild(TournamentList({
					tournaments,
					onJoinTournament: (tournamentId: string) => {
					  navigate(`/tournaments/${tournamentId}`);
					},
					onTournamentSelected: (tournament: Tournament) => {
					  currentTournamentId = tournament.id;
					  navigate(`/tournaments/${tournament.id}`);
					}
				  } as TournamentListProps));
				}
			  }
			  
			  client.off('user_tournament_list', onUserTournamentList);
			};
			
			client.on('user_tournament_list', onUserTournamentList);
			client.listUserTournaments();
		}
		return container;
	}
};