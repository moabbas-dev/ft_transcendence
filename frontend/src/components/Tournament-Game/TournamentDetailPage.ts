import store from "../../../store/store";
import { t } from "../../languages/LanguageController";
import { fetchUserDetails, tournamentClient } from "../../main";
import { navigate } from "../../router";
import { TournamentClient } from "./TournamentClient";
import { showTournamentMatchNotification } from "./TournamentMatchNotification";
import { WaitingRoom } from "./WaitingRoom";

interface Player {
	user_id: string;
	nickname?: string;
	avatar_url?: string;
	joined_at?: string;
}

interface UserDetails {
	id: string;
	nickname?: string;
	avatar_url?: string;
}

export default {
  render: async (container: HTMLElement, params?: { [key: string]: string }) => {
	  
	if (!params || !params.tournamentId) {
		console.error("Tournament ID is required");
		navigate("/play/tournaments");
		return;
	}
		
	const tournamentId = params.tournamentId;
    const userId = store.userId;

    const client = tournamentClient || new TournamentClient(`ws://${window.location.hostname}:3001`, userId as string);
    
    if (!tournamentClient) {
      await client.initialize().catch(err => {
        console.error("Failed to initialize tournament client:", err);
      });
    }

    container.className = "bg-ponghover w-full h-dvh flex flex-col items-center justify-center";
    container.innerHTML = `
      <div class="p-4 bg-gray-800 rounded-lg shadow-lg">
        <div class="flex justify-between items-center gap-2 mb-4">
          <h1 class="text-2xl font-bold text-white">${t('play.tournaments.tournamentDetails')}</h1>
          <button id="back-button" class="px-4 py-2 bg-pongcyan text-white rounded hover:bg-blue-700">
            ${t('play.tournaments.backToTournaments')}
          </button>
        </div>
        
        <div id="tournament-content" class="p-4 bg-gray-900 rounded-lg">
          <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pongcyan"></div>
            <p class="mt-2 text-gray-400">${t('play.tournaments.loading')}</p>
          </div>
        </div>
      </div>
    `;

    const backButton = container.querySelector('#back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigate('/play/tournaments');
      });
    }

    client.getTournamentDetails(tournamentId);

    client.on('tournament_details', async (data) => {
      if (data.tournament.id === tournamentId) {
        try {
          const userIds = data.players.map((p: any) => p.user_id);
          const userDetails = await fetchUserDetails(userIds);
		  const enrichedPlayers = data.players.map((player: Player) => {
			const userInfo = userDetails?.find((u: UserDetails) => u.id === player.user_id);
			return {
				...player,
				nickname: userInfo?.nickname || `Player ${player.user_id}`,
				avatar_url: userInfo?.avatar_url
			};
		  });
          
          data.players = enrichedPlayers;
          
          if (data.tournament.status === 'registering') {
            showWaitingRoom(container, data, client, userId as string);
          } else if (data.tournament.status === 'in_progress') {
            showTournamentBrackets(container, data, client, userId as string);
          } else if (data.tournament.status === 'completed') {
            showTournamentResults(container, data);
          }
        } catch (error) {
          console.error('Error processing tournament details:', error);
        }
      }
    });

    client.on('tournament_player_joined', (data) => {
      if (data.tournamentId === tournamentId) {
        client.getTournamentDetails(tournamentId);
      }
    });

    client.on('tournament_started', (data) => {
      if (data.tournamentId === tournamentId) {
        showTournamentBrackets(container, data, client, userId as string);
      }
    });

    client.on('tournament_match_completed', (data) => {
      if (data.tournamentId === tournamentId) {
        showTournamentBrackets(container, data, client, userId as string);
      }
    });

    client.on('tournament_completed', (data) => {
      if (data.tournamentId === tournamentId) {
        showTournamentResults(container, data);
      }
    });

    client.on('tournament_match_notification', (data) => {
      if (data.tournamentId === tournamentId) {
        showTournamentMatchNotification({
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          opponent: data.opponent,
          onAccept: (matchId) => {
            startTournamentMatch(container, matchId, {
              players: data.matchPlayers,
              tournamentName: "Tournament Match",
              round: data.round || 1
            }, userId as string, client);
          }
        });
      }
    });
  }
};

interface WaitingRoomPlayer {
	userId: string;
	username: string;
	avatar?: string;
	joinedAt?: string;
}

interface WaitingRoomData {
	tournamentId: string;
	playerCount: number;
	players: WaitingRoomPlayer[];
	isCreator: boolean;
	client: TournamentClient;
	onTournamentStart: () => void;
}

function showWaitingRoom(container: HTMLElement, data: { tournament: { id: string; player_count: number; creator_id: string }; players: Player[] }, client: TournamentClient, userId: string): void {
	const content = container.querySelector('#tournament-content');
	if (!content) return;

	const waitingRoomData: WaitingRoomData = {
		tournamentId: data.tournament.id,
		playerCount: data.tournament.player_count,
		players: data.players.map((p) => ({
			userId: p.user_id,
			username: p.nickname || `Player ${p.user_id}`,
			avatar: p.avatar_url,
			joinedAt: p.joined_at
		})),
		isCreator: data.tournament.creator_id === userId,
		client,
		onTournamentStart: () => {
			// Will be handled by tournament_started event
		}
	};

	content.innerHTML = '';
	content.appendChild(WaitingRoom(waitingRoomData));
}

function showTournamentBrackets(container: HTMLElement, data: any, client: TournamentClient, userId: string) {
  // Implementation similar to TournamentPage
  // Format matches for brackets, handle match clicks
  // ...
}

function showTournamentResults(container: HTMLElement, data: any) {
  // Implementation similar to TournamentPage
  // Format results, render results tab
  // ...
}

function startTournamentMatch(container: HTMLElement, matchId: string, matchData: any, userId: string, client: TournamentClient) {
  // Implementation similar to TournamentPage
  // Set up game board and start match
  // ...
}