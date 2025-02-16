import { createComponent } from "../utils/StateManager";
import { msg } from "../languages/LanguageController.js";
import logoUrl from "../../public/assets/profile.jpeg";
import goldRank from "../../public/assets/gold-medal.png";
import silverRank from "../../public/assets/silver-medal.png";
import bronzeRank from "../../public/assets/bronze-medal.png";
import { navigate, refreshRouter } from "../router.js";

export const Profile = createComponent(() => {
  // A wrapper for our popup + overlay
  const overlay = document.createElement("div");
  overlay.className = `
    fixed inset-0 z-[9999]
    flex items-center justify-center
    bg-black/50
  `;

  // The actual modal container
  const container = document.createElement("div");
  container.className = `
    relative w-3/6 max-w-full h-auto p-4
    bg-white border rounded-lg border-gray-300 shadow-md
  `;

  // Insert modal HTML
  container.innerHTML = `
    <!-- Close Button (X) -->
    <div class="flex justify-start mb-2">
        <i class="fas fa-times text-2xl cursor-pointer hover:text-red-600" id="close-button"></i>
    </div>

    <!-- Header (Nickname, Online, Avatar, Rank) -->
    <div class="flex items-center justify-end gap-4 mb-4">
        <div>
            <p class="font-bold text-lg">afarachi</p>
            <p class="text-green-500">Online 🟢</p>
            <div class="flex items-center gap-1">
                <p>Rank:</p>
                <img src="${goldRank}" class="w-6">
            </div>
        </div>
        <img 
            src="${logoUrl}" 
            alt="profile picture" 
            class="w-20 h-20 object-cover rounded border border-blue-800"
        >
    </div>

    <!-- Tabs (Statistics, History, Info) -->
    <div class="flex space-x-4 border-b border-gray-300 mb-4">
    <button 
        id="info-tab" 
        class="flex-1 py-2 text-center  focus:outline-none bg-[var(--main-color)]"
      >
        Info
      </button>
      <button 
        id="statistics-tab" 
        class="flex-1 py-2 text-center  focus:outline-none"
      >
        Statistics
      </button>
      <button 
        id="history-tab" 
        class="flex-1 py-2 text-center  focus:outline-none"
      >
        History
      </button>
    </div>

    <!-- Content Container -->
    <div id="content-container" class="text-gray-700">
    
    </div>
  `;

  // Insert container into overlay
  overlay.appendChild(container);

  // Query elements
  const closeButton = container.querySelector("#close-button") as HTMLElement | null;
  const statisticsTab = container.querySelector("#statistics-tab") as HTMLElement | null;
  const historyTab = container.querySelector("#history-tab") as HTMLElement | null;
  const infoTab = container.querySelector("#info-tab") as HTMLElement | null;
  const contentContainer = container.querySelector("#content-container") as HTMLElement | null;

  // Close the modal on X click
  closeButton?.addEventListener("click", () => {
    overlay.remove();
  });

  // Helper function to clear active background from all tabs
  function clearActiveTabs() {
    statisticsTab?.classList.remove("bg-[var(--main-color)]");
    historyTab?.classList.remove("bg-[var(--main-color)]");
    infoTab?.classList.remove("bg-[var(--main-color)]");
  }

  // Update content when tabs are clicked and set the active background
  statisticsTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    statisticsTab.classList.add("bg-[var(--main-color)]");
    contentContainer.innerHTML = `
      <h2 class="text-lg font-bold mb-2">Statistics</h2>
      <p>Here you could display user statistics (e.g., games won, lost, Elo rating, etc.).</p>
    `;
  });

  historyTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    historyTab.classList.add("bg-[var(--main-color)]");
    contentContainer.innerHTML = `
    <h2 class="text-lg font-bold mb-2">History</h2>
    <div class="max-h-64 overflow-y-auto">
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
        </tbody>
      </table>
    </div>

    `;
  });

  infoTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    infoTab.classList.add("bg-[var(--main-color)]");
    contentContainer.innerHTML = `
    <div class="flex flex-col">    
        <div class="flex space-x-4">
            <div>
                <label class="block font-semibold">First name:</label>
                <input type="text" class="border border-gray-300 p-1 w-48" placeholder="First name">
            </div>
            <div>
                <label class="block font-semibold">Last name:</label>
                <input type="text" class="border border-gray-300 p-1 w-48" placeholder="Last name">
            </div>    
            <div>
                <label class="block font-semibold">Age:</label>
                <input type="text" class="border border-gray-300 p-1 w-48" placeholder="Age">
            </div>
        </div>

        <div class="flex space-x-4 mt-2">
            <div>
                <label class="block font-semibold">Country:</label>
                <input type="text" class="border border-gray-300 p-1 w-48" placeholder="Country">
            </div>
            <div>
                <label class="block font-semibold">Email:</label>
                <input type="text" class="border border-gray-300 p-1 w-48" placeholder="Email">
            </div>
            <div>
                <label class="block font-semibold">Gender:</label>
                <input type="text" class="border border-gray-300 p-1 w-48" placeholder="Male/Female">
            </div>
        </div>
        
        <!-- 2FA Toggle -->
        <div class="flex flex-col justify-start gap-2 mt-4">
            <span class="font-semibold">Enable 2FA</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="twoFactorToggle" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 
                peer-focus:ring-blue-300 rounded-full peer 
                peer-checked:after:translate-x-full 
                peer-checked:after:border-white 
                after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                after:bg-white after:border-gray-300 after:border 
                after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-blue-600"></div>
            </label>
        </div>
        <!-- Save Button on the right side -->
        <div class="flex justify-end mt-4">
            <button type="submit" class="bg-[var(--main-color)] p-1 w-40 text-white">Save</button>
        </div>
    </div>
    `;

    const toggle = contentContainer.querySelector("#twoFactorToggle") as HTMLInputElement | null;
    if (toggle) {
      toggle.addEventListener("change", (event) => {
        const isChecked = (event.target as HTMLInputElement).checked;
        console.log("2FA Toggle is now:", isChecked ? "Enabled" : "Disabled");
        // Here you can call an API or handle logic to enable/disable 2FA
      });
    }
  });

  return overlay;
});
