import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";

export interface TournamentMatchResultProps {
  matchId: string;
  tournamentId: string;
  isWinner: boolean;
  playerScore: number;
  opponentScore: number;
  eloChange: number;
  opponent: {
    id: string;
    username: string;
    avatar?: string;
  };
  onContinue: () => void;
}

export const TournamentMatchResult = createComponent((props: TournamentMatchResultProps) => {
  const {
    matchId,
    tournamentId,
    isWinner,
    playerScore,
    opponentScore,
    eloChange,
    opponent,
    onContinue
  } = props;
  
  const container = document.createElement('div');
  container.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50";
  
  const resultClass = isWinner ? 'text-green-500' : 'text-red-500';
  const resultText = isWinner ? t('play.tournaments.matchResult.victory') : t('play.tournaments.matchResult.defeat');
  const resultIcon = isWinner ? 'fa-trophy' : 'fa-times-circle';
  
  container.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 transform animate-fade-up animate-once animate-duration-300">
      <div class="text-center mb-6">
        <i class="fas ${resultIcon} ${resultClass} text-5xl"></i>
        <h2 class="text-3xl font-bold ${resultClass} mt-2">${resultText}</h2>
      </div>
      
      <div class="bg-gray-700 rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center">
          <div class="text-center">
            <div class="text-sm text-gray-400">${t('play.tournaments.matchResult.you')}</div>
            <div class="text-3xl font-bold text-white">${playerScore}</div>
          </div>
          
          <div class="text-xl text-gray-400">VS</div>
          
          <div class="text-center">
            <div class="text-sm text-gray-400">${opponent.username}</div>
            <div class="text-3xl font-bold text-white">${opponentScore}</div>
          </div>
        </div>
      </div>
      
      <div class="text-center mb-6">
        <div class="text-sm text-gray-400">${t('play.tournaments.matchResult.eloChange')}</div>
        <div class="text-2xl font-bold ${eloChange >= 0 ? 'text-green-500' : 'text-red-500'}">
          ${eloChange >= 0 ? '+' : ''}${eloChange}
        </div>
      </div>
      
      <div class="flex justify-center">
        <button 
          id="continue-btn" 
          class="px-6 py-3 bg-pongcyan text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          ${t('play.tournaments.matchResult.continue')}
        </button>
      </div>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
      

      onContinue();
    });
  }
  
  return container;
});

export function showTournamentMatchResult(props: TournamentMatchResultProps) {
  const resultScreen = TournamentMatchResult(props);
  document.body.appendChild(resultScreen);
  
  const soundId = props.isWinner ? 'victory-sound' : 'defeat-sound';
  const sound = document.getElementById(soundId) as HTMLAudioElement;
  if (sound) {
    sound.play().catch(e => console.error(`Could not play ${props.isWinner ? 'victory' : 'defeat'} sound:`, e));
  }
}