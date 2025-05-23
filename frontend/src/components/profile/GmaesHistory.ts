import axios from "axios";
import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";
import { HistorySection } from "./HistorySection.js";
import getValidAccessToken from "../../../refresh/RefreshToken.js";
import Toast from "../../toast/Toast.js";
import store from "../../../store/store.js";

// Interfaces for API response
interface HistoryItem {
  matchId: number;
  opponent: {
    id: number;
    nickname: string;
  };
  result: string;
  outcome: 'win' | 'lose' | 'draw';
  played: string;
  duration: string;
  eloChange: number;
  matchType: string;
  completedAt: string;
  startedAt: string;
}

interface HistoryResponse {
  player: {
    id: number;
    stats: any;
  };
  matches: HistoryItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const GamesHistory = createComponent((props: { userId: number }) => {
  const container = document.createElement("div");
  let currentPage = 1;
  let pageSize = 10;
  let totalMatches = 0;
  let isLoading = false;

  container.innerHTML = `
    <div class="games-history-container">
      <div class="loading-indicator hidden">
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
      
      <div class="error-message hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p class="error-text"></p>
        <button class="retry-btn mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
          Retry
        </button>
      </div>

      <div class="history-content">
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
            <!-- History rows will be inserted here -->
          </tbody>
        </table>

        <div class="no-matches hidden text-center py-8 text-gray-500">
          <p>No matches found</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-container mt-6">
        <div class="flex items-center justify-between">
          <div class="pagination-info text-sm text-gray-700">
            <!-- Pagination info will be inserted here -->
          </div>
          <div class="pagination-controls flex space-x-2">
            <!-- Pagination buttons will be inserted here -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Get DOM elements
  const loadingIndicator = container.querySelector('.loading-indicator') as HTMLElement;
  const errorMessage = container.querySelector('.error-message') as HTMLElement;
  const errorText = container.querySelector('.error-text') as HTMLElement;
  const retryBtn = container.querySelector('.retry-btn') as HTMLButtonElement;
  const historyContent = container.querySelector('.history-content') as HTMLElement;
  const historyTBody = container.querySelector('.history') as HTMLElement;
  const noMatchesDiv = container.querySelector('.no-matches') as HTMLElement;
  const paginationInfo = container.querySelector('.pagination-info') as HTMLElement;
  const paginationControls = container.querySelector('.pagination-controls') as HTMLElement;

  // Show/hide elements
  function showLoading() {
    isLoading = true;
    loadingIndicator.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    historyContent.classList.add('opacity-50');
  }

  function hideLoading() {
    isLoading = false;
    loadingIndicator.classList.add('hidden');
    historyContent.classList.remove('opacity-50');
  }

  function showError(message: string) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }

  // Fetch history data
  async function fetchHistory(page: number = 1): Promise<void> {
    console.log(`fetchHistory called for page ${page}, userId: ${props.userId}`);
    
    if (isLoading) {
      console.log('Already loading, skipping request');
      return;
    }

    try {
      showLoading();
      hideError();

      const offset = (page - 1) * pageSize;
      const url = `/matchmaking/api/player/history/${store.userId}/${props.userId}?limit=${pageSize}&offset=${offset}`;
      console.log('Making request to:', url);
      const token = await getValidAccessToken();
      const response = await axios.get<HistoryResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('API Response:', response.data);

      const data = response.data;
      currentPage = page;
      totalMatches = data.pagination.total;
      
      console.log('Total matches:', totalMatches);
      console.log('Current page:', currentPage);
      console.log('Matches data:', data.matches);
      
      renderHistory(data.matches);
      renderPagination();

    } catch (error: any) {
      Toast.show(`Error fetching history: ${error.message}`, "error");
      showError('Failed to load match history');
    } finally {
      hideLoading();
    }
  }

  // Render history rows
  function renderHistory(matches: HistoryItem[]): void {
    console.log('renderHistory called with matches:', matches);
    console.log('historyTBody element:', historyTBody);
    
    // Clear existing rows
    historyTBody.innerHTML = '';

    if (matches.length === 0) {
      console.log('No matches found, showing no-matches div');
      historyContent.classList.add('hidden');
      noMatchesDiv.classList.remove('hidden');
      return;
    }

    historyContent.classList.remove('hidden');
    noMatchesDiv.classList.add('hidden');

    // Add each match
    matches.forEach((match, index) => {
      console.log(`Processing match ${index}:`, match);
      const historyRow = HistorySection({
        opponentName: match.opponent.nickname,
        played: match.played.replace(' ago', ''), // Remove 'ago' since HistorySection adds it
        duration: match.duration,
        outcome: match.outcome,
        result: match.result
      });
      console.log(`Created row for match ${index}:`, historyRow);
      historyTBody.appendChild(historyRow);
    });
  }

  // Render pagination
  function renderPagination(): void {
    const totalPages = Math.ceil(totalMatches / pageSize);

    // Update pagination info
    const start = ((currentPage - 1) * pageSize) + 1;
    const end = Math.min(currentPage * pageSize, totalMatches);
    
    paginationInfo.innerHTML = totalMatches > 0 
      ? `Showing ${start}-${end} of ${totalMatches} matches`
      : '';

    // Clear pagination controls
    paginationControls.innerHTML = '';

    if (totalPages <= 1) {
      return;
    }

    // Previous button
    if (currentPage > 1) {
      const prevBtn = createPaginationButton(currentPage - 1, 'Previous');
      prevBtn.classList.add('bg-white', 'border', 'border-gray-300', 'text-gray-500', 'hover:bg-gray-50');
      paginationControls.appendChild(prevBtn);
    }

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      paginationControls.appendChild(createPaginationButton(1, '1'));
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'px-3 py-2 text-gray-500';
        paginationControls.appendChild(ellipsis);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = createPaginationButton(i, i.toString());
      if (i === currentPage) {
        pageBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
      } else {
        pageBtn.classList.add('bg-white', 'text-gray-500', 'border-gray-300', 'hover:bg-gray-50');
      }
      paginationControls.appendChild(pageBtn);
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'px-3 py-2 text-gray-500';
        paginationControls.appendChild(ellipsis);
      }
      paginationControls.appendChild(createPaginationButton(totalPages, totalPages.toString()));
    }

    // Next button
    if (currentPage < totalPages) {
      const nextBtn = createPaginationButton(currentPage + 1, 'Next');
      nextBtn.classList.add('bg-white', 'border', 'border-gray-300', 'text-gray-500', 'hover:bg-gray-50');
      paginationControls.appendChild(nextBtn);
    }
  }

  // Create pagination button
  function createPaginationButton(page: number, text: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'px-3 py-2 text-sm font-medium border rounded-md transition-colors duration-200';
    button.addEventListener('click', () => {
      if (page !== currentPage && !isLoading) {
        fetchHistory(page);
      }
    });
    return button;
  }

  // Event listeners
  retryBtn.addEventListener('click', () => {
    fetchHistory(currentPage);
  });

  // Initial load
  fetchHistory(1);

  return container;
});