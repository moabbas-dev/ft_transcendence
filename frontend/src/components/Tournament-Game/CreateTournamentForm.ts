import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";
import { TournamentClient } from "./TournamentClient.js";
import store from "../../../store/store.js";

export interface CreateTournamentFormProps {
  onTournamentCreated?: (tournament: any) => void;
  client?: TournamentClient;
}

export const CreateTournamentForm = createComponent((props: CreateTournamentFormProps) => {
  const { onTournamentCreated, client } = props;
  
  const container = document.createElement('div');
  container.className = "w-full";
  container.innerHTML = `
    <div class="w-full bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 class="text-xl font-bold text-white mb-4">${t('play.tournaments.createTournament.title')}</h2>
      
      <form id="create-tournament-form" class="space-y-4">
        <div>
          <label for="tournament-name" class="block text-gray-300 mb-2">${t('play.tournaments.createTournament.name')}</label>
          <input 
            type="text" 
            id="tournament-name" 
            class="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-pongcyan outline-none"
            placeholder="${t('play.tournaments.createTournament.namePlaceholder')}"
            required
          >
        </div>
        
        <div>
          <label for="player-count" class="block text-gray-300 mb-2">${t('play.tournaments.createTournament.playerCount')}</label>
          <div class="grid grid-cols-2 gap-4">
            <div class="player-count-option border-2 border-gray-600 rounded-lg p-4 cursor-pointer hover:border-pongcyan" data-count="4">
              <div class="text-lg font-bold text-white text-center">4</div>
              <div class="text-sm text-gray-400 text-center">${t('play.tournaments.createTournament.players')}</div>
            </div>
            <div class="player-count-option border-2 border-gray-600 rounded-lg p-4 cursor-pointer hover:border-pongcyan" data-count="8">
              <div class="text-lg font-bold text-white text-center">8</div>
              <div class="text-sm text-gray-400 text-center">${t('play.tournaments.createTournament.players')}</div>
            </div>
          </div>
          <input type="hidden" id="player-count-input" value="4">
        </div>
        
        <button 
          type="submit" 
          class="w-full py-3 bg-pongcyan text-white font-medium rounded-lg hover:bg-pongcyan/80 drop-shadow-pongcyan transition-colors"
        >
          ${t('play.tournaments.createTournament.createButton')}
        </button>
      </form>
    </div>
  `;
  
  const playerCountOptions = container.querySelectorAll('.player-count-option');
  const playerCountInput = container.querySelector('#player-count-input') as HTMLInputElement;
  
  playerCountOptions.forEach(option => {
    option.addEventListener('click', () => {
      playerCountOptions.forEach(opt => {
        opt.classList.remove('border-pongcyan', 'drop-shadow-pongcyan');
        opt.classList.add('border-gray-600');
      });
      
      option.classList.remove('border-gray-600');
      option.classList.add('border-pongcyan', "drop-shadow-pongcyan");
      
      const count = option.getAttribute('data-count');
      if (count && playerCountInput) {
        playerCountInput.value = count;
      }
    });
  });
  
  playerCountOptions[0].classList.remove('border-gray-600');
  playerCountOptions[0].classList.add('border-pongcyan', 'drop-shadow-pongcyan');
  
  const form = container.querySelector('#create-tournament-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = container.querySelector('#tournament-name') as HTMLInputElement;
    const countInput = container.querySelector('#player-count-input') as HTMLInputElement;
    
    if (!nameInput?.value || !countInput?.value) return;
    
    const name = nameInput.value.trim();
    const playerCount = parseInt(countInput.value);
    
    if (name.length < 3) {
      alert(t('play.tournaments.createTournament.nameError'));
      return;
    }
    
    const tournamentClient = client || new TournamentClient(window.location.origin.replace('http', 'ws'), store.userId as string);
    if (!client) {
      tournamentClient.on('tournament_created', (data) => {
        if (onTournamentCreated) {
          onTournamentCreated(data.tournament);
        }
        tournamentClient.disconnect();
      })
      await tournamentClient.initialize();
    } else {
      const onCreated = (data: any) => {
        if (onTournamentCreated) {
          console.log('Tournament created, received details:', data);
          onTournamentCreated(data.tournament);
        }
        tournamentClient.off('tournament_created', onCreated);
      };
      
      tournamentClient.on('tournament_created', onCreated);
    }
    
    tournamentClient.createTournament(name, playerCount);
    
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
          ${t('play.tournaments.createTournament.creating')}
        </div>
      `;
    }
  });
  
  return container;
});