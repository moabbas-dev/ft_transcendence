import { createComponent } from "../utils/StateManager";


interface GamesHistoryProps {}

export const GamesHistory = createComponent(() => {
    const container = document.createElement("div");
    container.innerHTML = `
    <div class="">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Played</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr class="bg-green-100">
            <td class="px-6 py-4 whitespace-nowrap">User1 vs User2</td>
            <td class="px-6 py-4 whitespace-nowrap">10 - 7</td>
            <td class="px-6 py-4 whitespace-nowrap">Win</td>
            <td class="px-6 py-4 whitespace-nowrap">1h ago</td>
            <td class="px-6 py-4 whitespace-nowrap">6 min</td>
          </tr>
          <tr class="bg-red-100">
            <td class="px-6 py-4 whitespace-nowrap">User3 vs User4</td>
            <td class="px-6 py-4 whitespace-nowrap">7 - 10</td>
            <td class="px-6 py-4 whitespace-nowrap">Lose</td>
            <td class="px-6 py-4 whitespace-nowrap">1w ago</td>
            <td class="px-6 py-4 whitespace-nowrap">8 min</td>
          </tr>
          <tr class="bg-green-100">
            <td class="px-6 py-4 whitespace-nowrap">User7 vs User8</td>
            <td class="px-6 py-4 whitespace-nowrap">10 - 8</td>
            <td class="px-6 py-4 whitespace-nowrap">Win</td>
            <td class="px-6 py-4 whitespace-nowrap">1mo ago</td>
            <td class="px-6 py-4 whitespace-nowrap">5 min</td>
          </tr>
          <tr class="bg-red-100">
            <td class="px-6 py-4 whitespace-nowrap">User5 vs User6</td>
            <td class="px-6 py-4 whitespace-nowrap">6 - 10</td>
            <td class="px-6 py-4 whitespace-nowrap">Lose</td>
            <td class="px-6 py-4 whitespace-nowrap">2y ago</td>
            <td class="px-6 py-4 whitespace-nowrap">7 min</td>
          </tr>
          <tr class="bg-red-100">
            <td class="px-6 py-4 whitespace-nowrap">User5 vs User6</td>
            <td class="px-6 py-4 whitespace-nowrap">6 - 10</td>
            <td class="px-6 py-4 whitespace-nowrap">Lose</td>
            <td class="px-6 py-4 whitespace-nowrap">2y ago</td>
            <td class="px-6 py-4 whitespace-nowrap">7 min</td>
          </tr>
          <tr class="bg-red-100">
            <td class="px-6 py-4 whitespace-nowrap">User5 vs User6</td>
            <td class="px-6 py-4 whitespace-nowrap">6 - 10</td>
            <td class="px-6 py-4 whitespace-nowrap">Lose</td>
            <td class="px-6 py-4 whitespace-nowrap">2y ago</td>
            <td class="px-6 py-4 whitespace-nowrap">7 min</td>
          </tr>
          <tr class="bg-red-100">
            <td class="px-6 py-4 whitespace-nowrap">User5 vs User6</td>
            <td class="px-6 py-4 whitespace-nowrap">6 - 10</td>
            <td class="px-6 py-4 whitespace-nowrap">Lose</td>
            <td class="px-6 py-4 whitespace-nowrap">2y ago</td>
            <td class="px-6 py-4 whitespace-nowrap">7 min</td>
          </tr>
        </tbody>
      </table>
    </div>
    `;
    return container;
});
