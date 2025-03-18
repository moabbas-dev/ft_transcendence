import { createComponent } from "../../utils/StateManager.js";

export const UserStatistics = createComponent(() => {
    const container = document.createElement("div");
    container.className = 'flex flex-col gap-2'
    container.innerHTML = `
      <!-- Elo Rating Line Chart -->
      <div class="flex flex-col gap-4 justify-center">
        <canvas id="statsChart" class="w-full flex justify-center" height="250"></canvas>
        <!-- Bar Chart for Wins/Losses per Month -->
        <canvas id="barChart" class="w-full flex justify-center" height="250"></canvas>
        <!-- Pie Chart for Win Rate Percentage -->
        <div class="w-full flex justify-center ">
          <canvas id="pieChart" class="w-[250px] h-[250px]"></canvas>
        </div>
      </div>
    `;
    return container;
});
