import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";

export interface TournamentMatchNotificationProps {
  matchId: string;
  opponent: {
    id: string;
    username: string;
    elo?: number;
    avatar?: string;
  };
  onAccept: (matchId: string) => void;
}

export const TournamentMatchNotification = createComponent((props: TournamentMatchNotificationProps) => {
  const {
    matchId,
    opponent,
    onAccept
  } = props;
  
  const container = document.createElement('div');
  container.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50";
  container.id = `match-notification-${matchId}`;
  
  container.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 transform animate-bounce-in">
      <div class="text-center mb-4">
        <i class="fas fa-trophy text-pongcyan text-4xl"></i>
        <h2 class="text-2xl font-bold text-white drop-shadow-pongcyan mt-2">${t('play.tournaments.matchNotification.title')}</h2>
      </div>
      
      <div class="bg-gray-700 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-4">
          <div class="size-16 rounded-full bg-pongcyan flex items-center justify-center text-white text-2xl font-bold">
            ${opponent.avatar ? 
              `<img src="${opponent.avatar}" alt="${opponent.username}" class="size-full rounded-full object-cover">` :
              opponent.username.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <div class="text-lg font-medium text-white">${opponent.username}</div>
            ${opponent.elo ? `<div class="text-sm text-gray-300">${t('play.tournaments.matchNotification.elo')}: ${opponent.elo}</div>` : ''}
          </div>
        </div>
      </div>
      
      <p class="text-gray-300 mb-6 text-center">
        ${t('play.tournaments.matchNotification.message')}
      </p>
      
      <div class="flex justify-center gap-4">
        <button 
          id="accept-match-btn" 
          class="px-6 py-3 bg-pongcyan text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          ${t('play.tournaments.matchNotification.accept')}
        </button>
      </div>
    </div>
  `;
  
  const acceptBtn = container.querySelector('#accept-match-btn');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      (acceptBtn as HTMLButtonElement).disabled = true;
      acceptBtn.innerHTML = `
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
          Accepting...
        </div>
      `;
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }

      onAccept(matchId);
      console.log("Accepted match:", matchId);
    });
  }
  
  const contentDiv = container.querySelector('div');
  if (contentDiv) {
    contentDiv.classList.add('animate-fade-up', 'animate-once', 'animate-duration-300');
  }
  
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 60000);
  
  return container;
});

export function showTournamentMatchNotification(props: TournamentMatchNotificationProps) {
  const notification = TournamentMatchNotification(props);
  document.body.appendChild(notification);
  
  const notificationSound = document.getElementById('notification-sound') as HTMLAudioElement;
  if (notificationSound) {
    notificationSound.play().catch(e => console.error('Could not play notification sound:', e));
  }
}
