import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";
import { TournamentClient } from "./TournamentClient.js";
import store from "../../../store/store.js";

export interface Tournament {
  id: string;
  name: string;
  status: 'registering' | 'in_progress' | 'completed';
  player_count: number;
  registered_players: number;
  created_at: string;
  creator_id?: string;
}

export interface TournamentListProps {
  tournaments: Tournament[];
  onJoinTournament?: (tournamentId: string) => void;
  onTournamentSelected?: (tournament: Tournament) => void;
}

export const TournamentList = createComponent((props: TournamentListProps) => {
  const {
    tournaments = [],
    onJoinTournament,
    onTournamentSelected
  } = props;
  
  const container = document.createElement('div');
  container.className = "w-full h-full flex flex-col gap-4";
  container.innerHTML = `
    <div>
      <input
        type="text"
        id="tournament-search"
        class="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-pongcyan outline-none"
        placeholder="${t('play.tournaments.joinTournament.searchPlaceholder')}"
      >
    </div>

    <div id="tournament-container" class="flex flex-col gap-3 flex-grow overflow-auto">
    
    </div>
  `
  const tournamentsContainer = container.querySelector('#tournament-container') as HTMLDivElement;

  if (tournaments.length === 0) {
    tournamentsContainer.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-trophy text-4xl mb-4 opacity-30"></i>
        <p>${t('play.tournaments.joinTournament.noTournaments')}</p>
      </div>
    `;
  } else {
    const sortedTournaments = [...tournaments].sort((a, b) => {
      if (a.status === 'registering' && b.status !== 'registering') return -1;
      if (a.status !== 'registering' && b.status === 'registering') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    sortedTournaments.forEach(tournament => {
      const tournamentItem = document.createElement('div');
      tournamentItem.className = "tournament-item bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-pongcyan transition-colors cursor-pointer";
      tournamentItem.dataset.id = tournament.id;
      
    
      const isFull = tournament.registered_players >= tournament.player_count;
      const canJoin = tournament.status === 'registering' && !isFull;
      
    
      let statusBadge = '';
      if (tournament.status === 'registering') {
        statusBadge = `<span class="inline-block bg-pongcyan text-white text-xs px-2 py-1 rounded">${t('play.tournaments.joinTournament.registering')}</span>`;
      } else if (tournament.status === 'in_progress') {
        statusBadge = `<span class="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded">${t('play.tournaments.joinTournament.inProgress')}</span>`;
      }
      
      tournamentItem.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="tournament-name text-lg font-semibold text-white">${tournament.name}</h3>
            ${statusBadge}
          </div>
          <span class="text-sm text-gray-400">${tournament.player_count} ${t('play.tournaments.createTournament.players')}</span>
        </div>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div class="bg-pongcyan h-full" style="width: ${(tournament.registered_players / tournament.player_count) * 100}%"></div>
            </div>
            <span class="text-sm text-gray-300">${tournament.registered_players}/${tournament.player_count}</span>
          </div>
          ${canJoin ? 
            `<button 
              class="join-btn px-4 py-1 bg-pongcyan text-white rounded hover:bg-cyan-700 transition-colors"
              data-id="${tournament.id}"
            >
              ${t('play.tournaments.joinTournament.join')}
            </button>` : 
            (isFull ? 
              `<span class="text-sm text-gray-400">${t('play.tournaments.joinTournament.full')}</span>` : 
              '')
          }
        </div>
      `;
      
      tournamentsContainer.appendChild(tournamentItem);
      
    
      const joinBtn = tournamentItem.querySelector('.join-btn');
      if (joinBtn) {
        joinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tournamentId = joinBtn.getAttribute('data-id');
          if (tournamentId && onJoinTournament) {
            onJoinTournament(tournamentId);
          }
        });
      }
      
      tournamentItem.addEventListener('click', () => {
        if (onTournamentSelected) {
          onTournamentSelected(tournament);
        }
      });
    });
  }
  
  const searchInput = container.querySelector('#tournament-search') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const searchValue = searchInput.value.toLowerCase();
      const items = tournamentsContainer.querySelectorAll('.tournament-item');
      
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
  
  return container;
});

export async function fetchTournaments(callback: (tournaments: Tournament[]) => void, existingClient: TournamentClient) {
  const useExistingClient = !!existingClient;
  const client = existingClient || new TournamentClient(window.location.origin.replace('http', 'ws'), store.userId as string);
  
  const onTournamentList = (data: any) => {
    callback(data.tournaments || []);
    if (!useExistingClient) {
      console.error("NO GLOBAL TOURNAMENT CLIENT");
      client.off('tournament_list', onTournamentList);
      client.disconnect();
    }
  };
  
  client.on('tournament_list', onTournamentList);
  
  await client.initialize();
  await client.listTournaments();
}
