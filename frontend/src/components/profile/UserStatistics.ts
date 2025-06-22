/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserStatistics.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 16:34:13 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 16:34:13 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createComponent } from "../../utils/StateManager.js";
import axios from "axios";
import Chart from 'chart.js/auto';
import Toast from "../../toast/Toast.js";
import store from "../../../store/store.js";
import { t } from "../../languages/LanguageController.js";

interface ChartData {
  barChart: Array<{ month: string; wins: number; losses: number }>;
  lineChart: Array<{ month: string; eloRating: number }>;
  pieChart: Array<{ label: string; value: number; percentage: string }>;
}

interface StatsResponse {
  player: {
    id: number;
    stats: {
      totalMatches: number;
      wins: number;
      losses: number;
      draws: number;
      winRate: string;
      averageDuration: string;
      currentElo: number;
      chartData: ChartData;
    };
  };
}

export const UserStatistics = createComponent((props: { userId: number }) => {
  const container = document.createElement("div");
  container.className = 'flex flex-col gap-2';

  container.innerHTML = `
    <div class="flex flex-col gap-4 justify-center">
      <div id="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading statistics...</span>
      </div>
      
      <div id="error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p id="error-text">Failed to load statistics</p>
        <button id="retry-btn" class="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
          Retry
        </button>
      </div>
      
      <div id="charts-container" class="hidden flex flex-col gap-4 justify-center">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-2 text-center">${t("profile.statisticsTab.EloProgression")}</h3>
          <div class="h-64">
            <canvas id="statsChart" class="w-full h-full"></canvas>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-2 text-center">${t("profile.statisticsTab.monthly")}</h3>
          <div class="h-64">
            <canvas id="barChart" class="w-full h-full"></canvas>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-2 text-center">${t("profile.statisticsTab.overall")}</h3>
          <div class="h-64 flex justify-center">
            <canvas id="pieChart" class="w-64 h-64"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  const loadingDiv = container.querySelector('#loading')!;
  const errorDiv = container.querySelector('#error')!;
  const errorText = container.querySelector('#error-text')!;
  const retryBtn = container.querySelector('#retry-btn')!;
  const chartsContainer = container.querySelector('#charts-container')!;

  function destroyChartById(canvasId: string) {
    const canvas = container.querySelector(`#${canvasId}`) as HTMLCanvasElement;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
  }

  function clearCanvas(canvasId: string) {
    const canvas = container.querySelector(`#${canvasId}`) as HTMLCanvasElement;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function showLoading() {
    loadingDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    chartsContainer.classList.add('hidden');
  }

  function showError(message: string) {
    loadingDiv.classList.add('hidden');
    chartsContainer.classList.add('hidden');
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  function showCharts() {
    loadingDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    chartsContainer.classList.remove('hidden');
  }

  function createLineChart(data: ChartData['lineChart']) {
    destroyChartById('statsChart');
    clearCanvas('statsChart');

    const ctx = (container.querySelector('#statsChart') as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item.month),
        datasets: [{
          label: 'ELO Rating',
          data: data.map(item => item.eloRating),
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4ECDC4',
          pointBorderColor: '#4ECDC4',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
  }

  function createBarChart(data: ChartData['barChart']) {
    destroyChartById('barChart');
    clearCanvas('barChart');

    const ctx = (container.querySelector('#barChart') as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.month),
        datasets: [
          {
            label: 'Wins',
            data: data.map(item => item.wins),
            backgroundColor: '#4ECDC4',
            borderColor: '#4ECDC4',
            borderWidth: 1
          },
          {
            label: 'Losses',
            data: data.map(item => item.losses),
            backgroundColor: '#FF6B8A',
            borderColor: '#FF6B8A',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  function createPieChart(data: ChartData['pieChart']) {
    destroyChartById('pieChart');
    clearCanvas('pieChart');

    const ctx = (container.querySelector('#pieChart') as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: ['#4ECDC4', '#FF6B8A'],
          borderColor: ['#4ECDC4', '#FF6B8A'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const item = data[context.dataIndex];
                return `${item.label}: ${item.value} (${item.percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  async function fetchStats() {
    try {
      showLoading();
      const response = await axios.get<StatsResponse>(`/matchmaking/api/player/stats/${store.userId}/${props.userId}`, {
        withCredentials: true,
      });
      const statsData = response.data.player.stats;

      createLineChart(statsData.chartData.lineChart);
      createBarChart(statsData.chartData.barChart);
      createPieChart(statsData.chartData.pieChart);

      showCharts();
    } catch (error: any) {
      Toast.show(`Error fetching statistics: ${error.message}`, "error");
      showError(error.response?.data?.error || 'Failed to load statistics');
    }
  }

  retryBtn.addEventListener('click', () => fetchStats());

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (Array.from(mutation.removedNodes).includes(container)) {
        ['statsChart', 'barChart', 'pieChart'].forEach(destroyChartById);
        observer.disconnect();
      }
    });
  });

  if (container.parentNode) {
    observer.observe(container.parentNode, {
      childList: true,
      subtree: false
    });
  }

  (container as any).refresh = fetchStats;
  (container as any).cleanup = () => ['statsChart', 'barChart', 'pieChart'].forEach(destroyChartById);

  fetchStats();

  return container;
});
