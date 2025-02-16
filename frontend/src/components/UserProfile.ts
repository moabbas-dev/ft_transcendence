import { createComponent } from "../utils/StateManager";
import { msg } from "../languages/LanguageController.js";
import logoUrl from "../../public/assets/profile.jpeg";
import goldRank from "../../public/assets/gold-medal.png";
import silverRank from "../../public/assets/silver-medal.png";
import bronzeRank from "../../public/assets/bronze-medal.png";
import { navigate, refreshRouter } from "../router.js";
import { GamesHistory } from "./GmaesHistory";
import { UserInfo } from "./UserInfo";
import { UserStatistics } from "./UserStatistics";
import Chart from 'chart.js/auto';



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

  statisticsTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    statisticsTab.classList.add("bg-[var(--main-color)]");
    
    // Set up the content with three canvases
    contentContainer.innerHTML = "";
    contentContainer?.appendChild(UserStatistics());

    // Initialize the Elo Rating Line Chart
    const statsCtx = document.getElementById("statsChart") as HTMLCanvasElement | null;
    if (statsCtx) {
      const lineData = {
        labels: ["January", "February", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Elo Rating",
            data: [1500, 1520, 1510, 1530, 1540, 1550],
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };
      const lineConfig = {
        type: "line" as const,
        data: lineData,
        options: {},
      };
      new Chart(statsCtx, lineConfig);
    }
  
    // Initialize the Wins/Losses Bar Chart
    const barCtx = document.getElementById("barChart") as HTMLCanvasElement | null;
    if (barCtx) {
      const barData = {
        labels: ["January", "February", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Wins",
            data: [5, 7, 8, 6, 9, 10],
            backgroundColor: "rgb(75, 192, 192)",
          },
          {
            label: "Losses",
            data: [2, 3, 1, 4, 3, 2],
            backgroundColor: "rgb(255, 99, 132)",
          },
        ],
      };
      const barConfig = {
        type: "bar" as const,
        data: barData,
        options: {},
      };
      new Chart(barCtx, barConfig);
    }
  
    // Initialize the Win Rate Pie Chart
    const pieCtx = document.getElementById("pieChart") as HTMLCanvasElement | null;
    if (pieCtx) {
      const pieData = {
        labels: ["Wins", "Losses"],
        datasets: [
          {
            label: "Win Rate",
            data: [70, 30], // For example: 70% wins, 30% losses
            backgroundColor: [
              "rgb(75, 192, 192)",
              "rgb(255, 99, 132)"
            ],
            hoverOffset: 4,
          },
        ],
      };
      const pieConfig = {
        type: "pie" as const,
        data: pieData,
        options: {},
      };
      new Chart(pieCtx, pieConfig);
    }
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
