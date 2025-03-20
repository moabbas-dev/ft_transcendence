import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";
import { HistorySection } from "./HistorySection.js";

export const GamesHistory = createComponent(() => {
    const container = document.createElement("div");
    container.innerHTML = `
    <div class="">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase tracking-wider">${t('profile.historyTab.oponent')}</th>
            <th class="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase tracking-wider">${t('profile.historyTab.result')}</th>
            <th class="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase tracking-wider">${t('profile.historyTab.outcome')}</th>
            <th class="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase tracking-wider">${t('profile.historyTab.played')}</th>
            <th class="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase tracking-wider">${t('profile.historyTab.duration')}</th>
          </tr>
        </thead>
        <tbody class="history bg-white divide-y divide-gray-200">
          <!-- History Sections Here -->
        </tbody>
      </table>
    </div>
    `;
    const history = container.querySelector('.history');
    history?.appendChild(HistorySection({ opponentName: 'User1', resPlayer: 10, resOpponent: 8, played: '1mo', duration: '5 min' }));
    history?.appendChild(HistorySection({ opponentName: 'User2', resPlayer: 6, resOpponent: 10, played: '2mo', duration: '7 min' }));
    history?.appendChild(HistorySection({ opponentName: 'User3', resPlayer: 8, resOpponent: 8, played: '2mo', duration: '11 min' }));
    history?.appendChild(HistorySection({ opponentName: 'User4', resPlayer: 7, resOpponent: 9, played: '5mo', duration: '8 min' }));
    history?.appendChild(HistorySection({ opponentName: 'User5', resPlayer: 10, resOpponent: 5, played: '1y', duration: '6 min' }));
    history?.appendChild(HistorySection({ opponentName: 'User6', resPlayer: 10, resOpponent: 9, played: '2y', duration: '9 min' }));
    history?.appendChild(HistorySection({ opponentName: 'User7', resPlayer: 9, resOpponent: 9, played: '2y', duration: '6 min' }));
    return container;
});
