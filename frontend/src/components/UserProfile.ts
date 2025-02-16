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
  // The actual modal container
  const container = document.createElement("div");
  // Insert modal HTML
  container.innerHTML = `
    <!-- Overlay -->
    <div class="overlay absolute top-0 left-0 w-full h-full z-[80] bg-black/50"></div>
    <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[90] w-full md:w-1/2 2xl:w-3/6 h-[100dvh] md:h-full max-h-[90dvh] p-4 bg-white border rounded-lg border-gray-300 shadow-md flex flex-col gap-2">
      <!-- Close Button (X) -->
      <div class="flex justify-start">
          <i class="fas fa-times text-2xl cursor-pointer hover:text-red-600" id="close-button"></i>
      </div>

      <!-- Header (Nickname, Online, Avatar, Rank) -->
      <div class="flex items-center justify-end gap-4">
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
            class="w-20 h-20 object-cover rounded-full border-2 border-[var(--main-color)]"
        >
      </div>

      <!-- Tabs (Statistics, History, Info) -->
        <div class="flex space-x-4 border-b border-gray-300">
          <button 
              id="info-tab" 
              class="flex-1 py-2 text-white text-center transition-all  focus:outline-none bg-[var(--main-color)]"
            >
              Info
          </button>
          <button 
            id="statistics-tab" 
            class="flex-1 py-2 text-center transition-all focus:outline-none"
          >
            Statistics
          </button>
          <button 
            id="history-tab" 
            class="flex-1 py-2 text-center transition-all focus:outline-none"
          >
            History
          </button>
        </div>

        <!-- Content Container -->
        <div id="content-container" class="text-gray-700 h-fit overflow-auto">
        
        </div>
    </div>
  `;  

  // Query elements
  const closeButton = container.querySelector("#close-button")!
  const statisticsTab = container.querySelector("#statistics-tab")!
  const historyTab = container.querySelector("#history-tab")!
  const infoTab = container.querySelector("#info-tab")!
  const contentContainer = container.querySelector("#content-container")!
  const overlay = container.querySelector('.overlay')!

  // Close the modal on X click
  closeButton?.addEventListener("click", () => {
    container.remove()
  });

  // Helper function to clear active background from all tabs
  function clearActiveTabs() {
    statisticsTab?.classList.remove("bg-[var(--main-color)]");
    statisticsTab?.classList.remove("text-white");
    historyTab?.classList.remove("bg-[var(--main-color)]");
    historyTab?.classList.remove("text-white");
    infoTab?.classList.remove("bg-[var(--main-color)]");
    infoTab?.classList.remove("text-white");
  }

  // User Profile by default
  contentContainer?.appendChild(UserInfo());

  statisticsTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    statisticsTab.classList.add("bg-[var(--main-color)]", "text-white");
    
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
        options: {
          responsive: false,
          maintainAspectRatio: false
        },
      };
      new Chart(pieCtx, pieConfig);
    }
  });

  historyTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    historyTab.classList.add("bg-[var(--main-color)]", "text-white");
    contentContainer.innerHTML = "";
    contentContainer?.appendChild(GamesHistory());
  });

  infoTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    infoTab.classList.add("bg-[var(--main-color)]", "text-white");
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

  return container;
});
