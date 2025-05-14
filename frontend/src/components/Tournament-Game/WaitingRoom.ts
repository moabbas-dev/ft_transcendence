import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";
import { TournamentClient } from "./TournamentClient.js";

export interface Player {
  userId: string;
  username: string;
  avatar?: string;
  rank?: string;
  joinedAt: string;
}

export interface WaitingRoomProps {
  tournamentId: string;
  playerCount: number;
  client: TournamentClient;
  players: Player[];
  isCreator: boolean;
  onPlayerJoin?: (player: Player) => void;
  onTournamentStart?: () => void;
}

export const WaitingRoom = createComponent((props: WaitingRoomProps ) => {
  const {
    tournamentId,
    playerCount,
    client,
    players = [],
    isCreator = false,
    onPlayerJoin,
    onTournamentStart
  } = props;

  const container = document.createElement('div');
  container.className = "flex flex-col gap-6";
  container.innerHTML = `
    <div class="text-2xl font-semibold">${t('play.tournaments.createTournament.waitingRoom')}</div>
    <div class="flex flex-col gap-4 bg-[rgba(100,100,255,0.1)] rounded-lg p-4">
      <div class="flex justify-between items-center">
        <div class="sm:text-lg font-medium">${t('play.tournaments.createTournament.currentParticipants')}</div>
        <div class="text-sm text-gray-300">${t('play.tournaments.createTournament.tournamentStart')} <span class="player-max-display">${playerCount}</span> ${t('play.tournaments.createTournament.tournamentStartContinue')}</div>
      </div>
      <div id="waiting-players" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <!-- Player slots will be dynamically generated -->
      </div>

      <div class="flex justify-between">
        ${isCreator && players.length === playerCount ? 
          `<button id="start-tournament" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">${t('play.tournaments.createTournament.startTournament')}</button>` : ''}
        <button id="leave-tournament" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">${t('play.tournaments.createTournament.leaveTournament')}</button>
      </div>
    </div>
  `;

  renderWaitingRoomSlots(container, playerCount?? 0, players);

  const startButton = container.querySelector('#start-tournament');
  if (startButton) {
    startButton.addEventListener('click', () => {
      client.startTournament(tournamentId);
      if (onTournamentStart) onTournamentStart();
    });
  }

  const leaveButton = container.querySelector('#leave-tournament');
  if (leaveButton) {
    leaveButton.addEventListener('click', () => {
      // TODO: Implement tournament leave functionality
      // For now, just navigate back to tournaments list
      window.history.back();
    });
  }

  client.on('tournament_player_joined', (data) => {
    if (data.tournamentId === tournamentId) {
      renderWaitingRoomSlots(container, playerCount?? 0, data.players);
      if (onPlayerJoin) onPlayerJoin(data.newPlayer);
      
      if (isCreator && data.players.length === playerCount) {
        const startButton = container.querySelector('#start-tournament');
        if (startButton) {
          startButton.classList.remove('opacity-50', 'cursor-not-allowed');
          startButton.removeAttribute('disabled');
        }
      }
    }
  });

  client.on('tournament_started', (data) => {
    if (data.tournamentId === tournamentId && onTournamentStart) {
      onTournamentStart();
    }
  });

  return container;
});

export function renderWaitingRoomSlots(container: HTMLElement, playerCount: number, players: Player[] = []) {
  const waitingPlayersContainer = container.querySelector('#waiting-players');
  const playerMaxDisplay = container.querySelectorAll('.player-max-display');
  
  if (waitingPlayersContainer) {
    waitingPlayersContainer.innerHTML = '';

    playerMaxDisplay.forEach(el => {
      el.textContent = playerCount.toString();
    });

    for (let i = 0; i < playerCount; i++) {
      const playerData = i < players.length ? players[i] : null;

      if (playerData) {
        waitingPlayersContainer.innerHTML += `
          <div class="bg-[rgba(100,100,255,0.2)] p-4 rounded-lg flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-full bg-pongcyan">
                ${playerData.avatar ? 
                  `<img src="${playerData.avatar}" alt="avatar" class="size-full rounded-full object-cover" />` :
                  `<div class="size-full rounded-full flex items-center justify-center bg-pongcyan text-white text-xl font-bold">${playerData.username ? playerData.username.charAt(0).toUpperCase() : '?'}</div>`
                }
              </div>
              <div>
                <div class="font-medium">${playerData.username || 'Unknown Player'}</div>
                <div class="text-sm text-gray-300">${t('play.tournaments.createTournament.rank')} ${playerData.rank || 'Unranked'}</div>
              </div>
            </div>
          </div>
        `;
      } else {
        waitingPlayersContainer.innerHTML += `
          <div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
            <div class="text-[rgba(255,255,255,0.5)]">${t('play.tournaments.createTournament.waitingForPlayers')}</div>
          </div>
        `;
      }
    }
  }
}
