import { createComponent } from "../../utils/StateManager.js";
import logoUrl from "/src/assets/profile.jpeg";
import goldRank from "/src/assets/gold-medal.png";
import { GamesHistory } from "./GmaesHistory.js";
import { UserInfo } from "./UserInfo.js";
import { UserStatistics } from "./UserStatistics.js";
import Chart from 'chart.js/auto';
import store from "../../../store/store.js";
import axios from "axios";
import { t } from "../../languages/LanguageController.js";

interface ProfileProps {
  uName: string,
}


export const Profile = createComponent((props: ProfileProps) => {

  if (props && props.uName) {
    const token = store.accessToken;
    // Make the API call with proper authorization headers
    axios.get(`http://localhost:8001/auth/users/nickname/${props.uName}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      // Store or use the user data
      const userData = response.data;
      updateUIWithUserData(userData, container);
      
    })
    .catch(error => {
      console.error("Error fetching user data:", error.response.data.message);
    });
  }
  
  // A wrapper for our popup + overlay
  // The actual modal container
  const container = document.createElement("div");
  // Insert modal HTML
  container.innerHTML = `
    <!-- Overlay -->
    <div class="overlay absolute top-0 left-0 w-full h-full z-[80] bg-black/50"></div>
    <div class="user-container absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[90] w-full md:w-[70%] 2xl:w-3/6 h-[100dvh] md:h-full max-h-[90dvh] p-4 bg-white border rounded-lg border-gray-300 shadow-md flex flex-col gap-2">
      <!-- Close Button (X) -->
      <div class="flex justify-start">
          <i class="fas fa-times text-2xl cursor-pointer hover:text-red-600" id="close-button"></i>
      </div>

      <!-- Header (Nickname, Online, Avatar, Rank) -->
      
      <div class="flex items-center gap-4 justify-end">
          <div class="flex gap-2 mr-10 mt-8">
            <button id="message-user" class="bg-pongblue text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors">
              <i class="fas fa-envelope mr-1"></i> ${t('profile.message')}
            </button>
            <button id="add-friend" class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition-colors">
              <i class="fas fa-user-plus mr-1"></i> ${t('profile.add')}
            </button>
            <button id="block-user" class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition-colors">
              <i class="fas fa-ban mr-1"></i> ${t('profile.block')}
            </button>
        </div>
        <div class="flex">
        <div>
            <p id="name" class="font-bold text-lg">${store.nickname}</p>
            <div class="flex items-center gap-1">
                <p>${t('profile.rank')}</p>
                <img src="${goldRank}" class="w-6">
            </div>
        </div>
        <div class="relative">
          <img 
              src="${logoUrl}" 
              alt="profile picture" 
              class="w-20 h-20 object-cover rounded-full border-2 border-pongblue"
          >
          <span class="absolute bottom-0 left-0 h-5 w-5 rounded-full
            bg-green-500 border border-white"></span>
        </div>

        </div>
            
      </div>
      

      

      <!-- Tabs (Statistics, History, Info) -->
        <div class="flex space-x-4 border-b border-gray-300">
          <button 
              id="info-tab" 
              class="flex-1 py-2 text-white text-center transition-all  focus:outline-none bg-pongblue"
            >
            ${t('profile.infoTab.title')}
          </button>
          <button 
            id="statistics-tab" 
            class="flex-1 py-2 text-center transition-all focus:outline-none"
          >
          ${t('profile.statisticsTab.title')}
          </button>
          <button 
            id="history-tab" 
            class="flex-1 py-2 text-center transition-all focus:outline-none"
          >
          ${t('profile.historyTab.title')}
          </button>
        </div>

        <!-- Content Container -->
        <div id="content-container" class="text-gray-700 h-fit overflow-auto">
        
        </div>
    </div>
  `;

  function updateUIWithUserData(userData : any, container: HTMLDivElement) {
    // Update nickname
    const nicknameElement = container.querySelector('#name');
    if (nicknameElement) {
      nicknameElement.textContent = userData.nickname || store.nickname;
    }
    
    // Update other elements as needed
    // For example, rank, avatar image, etc.
    
    // You could also pass this data to your sub-components
    // For example, when creating UserInfo, UserStatistics, etc.
  }

  // Query elements
  const closeButton = container.querySelector("#close-button")!
  const statisticsTab = container.querySelector("#statistics-tab")!
  const historyTab = container.querySelector("#history-tab")!
  const infoTab = container.querySelector("#info-tab")!
  const contentContainer = container.querySelector("#content-container")!
  const overlay = container.querySelector('.overlay')!

  overlay.addEventListener("click", () => {
    container.remove()
  })

  // Close the modal on X click
  closeButton?.addEventListener("click", () => {
    container.remove()
  });

  // Helper function to clear active background from all tabs
  function clearActiveTabs() {
    statisticsTab?.classList.remove("bg-pongblue");
    statisticsTab?.classList.remove("text-white");
    historyTab?.classList.remove("bg-pongblue");
    historyTab?.classList.remove("text-white");
    infoTab?.classList.remove("bg-pongblue");
    infoTab?.classList.remove("text-white");
  }

  // User Profile by default
  contentContainer?.appendChild(UserInfo({
    uName: props.uName,
  }));

  statisticsTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    statisticsTab.classList.add("bg-pongblue", "text-white");
    
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
    historyTab.classList.add("bg-pongblue", "text-white");
    contentContainer.innerHTML = "";
    contentContainer?.appendChild(GamesHistory());
  });

  infoTab?.addEventListener("click", () => {
    if (!contentContainer) return;
    clearActiveTabs();
    infoTab.classList.add("bg-pongblue", "text-white");
    contentContainer.innerHTML = "";
    console.log(props.uName);
    contentContainer?.appendChild(UserInfo({
      uName: props.uName,
    }));

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
