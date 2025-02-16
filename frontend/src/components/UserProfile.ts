import { createComponent } from "../utils/StateManager";
import { msg } from "../languages/LanguageController.js";
import logoUrl from "../../public/assets/profile.jpeg";
import goldRank from "../../public/assets/gold-medal.png";
import silverRank from "../../public/assets/silver-medal.png";
import bronzeRank from "../../public/assets/bronze-medal.png";
import { navigate, refreshRouter } from "../router.js";
import { GamesHistory } from "./GmaesHistory";
import { UserInfo } from "./UserInfo";

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
    contentContainer.innerHTML = "";
    contentContainer?.appendChild(GamesHistory());
  });

  infoTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    infoTab.classList.add("bg-[var(--main-color)]");
    contentContainer.innerHTML = "";
    contentContainer?.appendChild(UserInfo());

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
