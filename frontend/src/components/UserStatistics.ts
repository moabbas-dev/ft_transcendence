import { createComponent } from "../utils/StateManager";


interface UserStatisticsProps {}

export const UserStatistics = createComponent(() => {
    const container = document.createElement("div");
    container.innerHTML = `
        <div class="flex flex-col max-h-64 overflow-y-auto">
        <p class="mb-4">Overview</p> 
        <div class="flex space-x-4">
          <div>🏆 Wins: 7</div>
          <div>👎 Losses: 3</div>
        </div>
        <!-- Elo Rating Line Chart -->
        <canvas id="statsChart" class="mt-4" width="400" height="200"></canvas>
        <!-- Bar Chart for Wins/Losses per Month -->
        <canvas id="barChart" class="mt-4" width="400" height="200"></canvas>
        <!-- Pie Chart for Win Rate Percentage -->
        <canvas id="pieChart" class="mt-4" width="400" height="200"></canvas>
      </div>
    `;

    
    return container;
});
