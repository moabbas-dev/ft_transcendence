import { navigate } from "../router.js";
import { t } from "../languages/LanguageController.js";
import { PongAnimation } from "../components/partials/PingPongAnimation.js";
import { Header } from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";

export default {
  render: async (container: HTMLElement) => {
    container.className = 'flex flex-col h-dvh';
    container.innerHTML = `
    <div class="profile"></div>
    <div class="header z-50"></div>
    
    <div class="content flex-1 relative overflow-hidden bg-black">
        <canvas id="pongCanvas" class="absolute left-0 top-0 w-full h-full opacity-30 z-0"></canvas>
        
        <!-- Neon glow effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-pongcyan/5 to-transparent opacity-20 z-5 pointer-events-none"></div>
        
        <div class="game-options relative z-10 container mx-auto px-4 flex flex-col gap-8 h-full w-full items-center justify-center">
            <h1 class="text-4xl md:text-6xl font-bold text-center text-pongcyan drop-shadow-[0_0_15px_#00f7ff] animate-fade-down animate-once animate-duration-700">
                ${t("play.title")}
            </h1>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto w-full">
                <!-- VS AI Button -->
                <button class="game-mode-btn p-6 border-2 border-pongcyan rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,247,255,0.4)] hover:shadow-[0_0_25px_rgba(0,247,255,0.6)] animate-fade-right animate-once animate-duration-700" data-route="/play/local-ai">
                    <span class="group-hover:scale-110 text-3xl transition-transform duration-300 ease-in-out text-pongcyan drop-shadow-[0_0_10px_#00f7ff]">
                      <i class="fa-solid fa-robot"></i>
                    </span>
                    <div class="flex flex-col gap-1">
                        <h2 class="text-xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#00f7ff]">${t('play.vsAI')}</h2>
                        <p class="text-sm opacity-90">${t('play.vsAIInfo')}</p>
                    </div>
                </button>
                
                <!-- Local Multiplayer Button -->
                <button class="game-mode-btn p-6 border-2 border-pongcyan rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,247,255,0.4)] hover:shadow-[0_0_25px_rgba(0,247,255,0.6)] animate-fade-left animate-once animate-duration-700 animate-delay-100" data-route="/play/local-multi">
                    <span class="group-hover:scale-110 text-3xl transition-transform duration-300 ease-in-out text-pongcyan drop-shadow-[0_0_10px_#00f7ff]">
                      <i class="fa-solid fa-user-group"></i>
                    </span>
                    <div class="flex flex-col gap-1">
                        <h2 class="text-xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#00f7ff]">${t('play.localPlayer')}</h2>
                        <p class="text-sm opacity-90">${t('play.localPlayerInfo')}</p>
                    </div>
                </button>
                
                <!-- Tournament Button -->
                <button class="game-mode-btn p-6 border-2 border-pongpink rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,0,228,0.4)] hover:shadow-[0_0_25px_rgba(255,0,228,0.6)] animate-fade-right animate-once animate-duration-700 animate-delay-200" data-route="/play/tournaments">
                    <span class="group-hover:scale-110 text-3xl transition-transform duration-300 ease-in-out text-pongpink drop-shadow-[0_0_10px_#ff00e4]">
                      <i class="fa-solid fa-trophy"></i>
                    </span>
                    <div class="flex flex-col gap-1">
                        <h2 class="text-xl font-bold text-pongpink drop-shadow-[0_0_5px_#ff00e4] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#ff00e4]">${t('play.tournament')}</h2>
                        <p class="text-sm opacity-90">${t('play.tournamentInfo')}</p>
                    </div>
                </button>
                
                <!-- Online Multiplayer Button -->
                <button id="online-multiplayer" class="game-mode-btn p-6 border-2 border-pongpink rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,0,228,0.4)] hover:shadow-[0_0_25px_rgba(255,0,228,0.6)] animate-fade-left animate-once animate-duration-700 animate-delay-300">
                    <span class="group-hover:scale-110 text-3xl transition-transform duration-300 ease-in-out text-pongpink drop-shadow-[0_0_10px_#ff00e4]">
                      <i class="fa-solid fa-globe"></i>
                    </span>
                    <div class="flex flex-col gap-1">
                        <h2 class="text-xl font-bold text-pongpink drop-shadow-[0_0_5px_#ff00e4] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#ff00e4]">${t('play.online')}</h2>
                        <p class="text-sm opacity-90">${t('play.onlineInfo')}</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
    
    <div class="footer"></div>
    `;

    // Add header component
    const headerContainer = container.querySelector(".header");
    const header = Header();
    headerContainer?.appendChild(header);

    // Add footer component
    const footerContainer = container.querySelector(".footer");
    const footerComp = Footer();
    footerContainer?.appendChild(footerComp);

    // Add button interactions
    document.querySelectorAll(".game-mode-btn").forEach((button) => {
      button.addEventListener("click", (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        if (target.dataset.route)
          navigate(target.dataset.route);
      });
    });

    // Online multiplayer button handler
    const onlineMuliplayerBtn = container.querySelector('#online-multiplayer')!
    onlineMuliplayerBtn.addEventListener('click', () => {
      navigate('/play/online-game')
    });

    // Initialize Pong animation
    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas);
    }
  },
};