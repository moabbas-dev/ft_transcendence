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
    <div class="header z-50 fixed top-0 w-full bg-black"></div>
    
    <div class="content flex-1 relative bg-black overflow-y-auto sm:overflow-hidden pt-16 sm:pt-20">
        <canvas id="pongCanvas" class="absolute left-0 top-0 w-full h-full opacity-30 z-0"></canvas>
        
        <!-- Neon glow effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-pongcyan/5 to-transparent opacity-20 z-5 pointer-events-none"></div>
        
        <div class="game-options relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-0 flex flex-col gap-6 sm:gap-8 min-h-[calc(100vh-4rem)] sm:h-full w-full items-center justify-center">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-pongcyan drop-shadow-[0_0_15px_#00f7ff] animate-fade-down animate-once animate-duration-700">
                ${t("play.title")}
            </h1>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto w-full">
                <!-- VS AI Button -->
                <button class="game-mode-btn p-4 sm:p-6 border border-pongcyan sm:border-2 rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,247,255,0.4)] hover:shadow-[0_0_25px_rgba(0,247,255,0.6)] animate-fade-right animate-once animate-duration-700" data-route="/play/local-ai">
                    <span class="group-hover:scale-110 text-xl sm:text-2xl md:text-3xl transition-transform duration-300 ease-in-out text-pongcyan drop-shadow-[0_0_10px_#00f7ff]">
                      <i class="fa-solid fa-robot"></i>
                    </span>
                    <div class="flex flex-col gap-0.5 sm:gap-1">
                        <h2 class="text-base sm:text-lg md:text-xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#00f7ff]">${t('play.vsAI')}</h2>
                        <p class="text-xs sm:text-sm opacity-90">${t('play.vsAIInfo')}</p>
                    </div>
                </button>
                
                <!-- Local Multiplayer Button -->
                <button class="game-mode-btn p-4 sm:p-6 border border-pongcyan sm:border-2 rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,247,255,0.4)] hover:shadow-[0_0_25px_rgba(0,247,255,0.6)] animate-fade-left animate-once animate-duration-700 animate-delay-100" data-route="/play/local-multi">
                    <span class="group-hover:scale-110 text-xl sm:text-2xl md:text-3xl transition-transform duration-300 ease-in-out text-pongcyan drop-shadow-[0_0_10px_#00f7ff]">
                      <i class="fa-solid fa-user-group"></i>
                    </span>
                    <div class="flex flex-col gap-0.5 sm:gap-1">
                        <h2 class="text-base sm:text-lg md:text-xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#00f7ff]">${t('play.localPlayer')}</h2>
                        <p class="text-xs sm:text-sm opacity-90">${t('play.localPlayerInfo')}</p>
                    </div>
                </button>
                
                <!-- Tournament Button -->
                <button class="game-mode-btn p-4 sm:p-6 border border-pongpink sm:border-2 rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,0,228,0.4)] hover:shadow-[0_0_25px_rgba(255,0,228,0.6)] animate-fade-right animate-once animate-duration-700 animate-delay-200" data-route="/play/tournaments">
                    <span class="group-hover:scale-110 text-xl sm:text-2xl md:text-3xl transition-transform duration-300 ease-in-out text-pongpink drop-shadow-[0_0_10px_#ff00e4]">
                      <i class="fa-solid fa-trophy"></i>
                    </span>
                    <div class="flex flex-col gap-0.5 sm:gap-1">
                        <h2 class="text-base sm:text-lg md:text-xl font-bold text-pongpink drop-shadow-[0_0_5px_#ff00e4] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#ff00e4]">${t('play.tournament')}</h2>
                        <p class="text-xs sm:text-sm opacity-90">${t('play.tournamentInfo')}</p>
                    </div>
                </button>
                
                <!-- Online Multiplayer Button -->
                <button id="online-multiplayer" class="game-mode-btn p-4 sm:p-6 border border-pongpink sm:border-2 rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,0,228,0.4)] hover:shadow-[0_0_25px_rgba(255,0,228,0.6)] animate-fade-left animate-once animate-duration-700 animate-delay-300">
                    <span class="group-hover:scale-110 text-xl sm:text-2xl md:text-3xl transition-transform duration-300 ease-in-out text-pongpink drop-shadow-[0_0_10px_#ff00e4]">
                      <i class="fa-solid fa-globe"></i>
                    </span>
                    <div class="flex flex-col gap-0.5 sm:gap-1">
                        <h2 class="text-base sm:text-lg md:text-xl font-bold text-pongpink drop-shadow-[0_0_5px_#ff00e4] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#ff00e4]">${t('play.online')}</h2>
                        <p class="text-xs sm:text-sm opacity-90">${t('play.onlineInfo')}</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
    
    <div class="footer"></div>
    
    <!-- Touch control hints for mobile -->
    <div class="touch-hints fixed bottom-20 left-0 right-0 flex justify-center z-20 pointer-events-none animate-fade-up animate-once animate-duration-700 animate-delay-500 xs:hidden">
      <div class="bg-black/70 text-white text-xs px-3 py-2 rounded-full border border-pongcyan shadow-[0_0_10px_rgba(0,247,255,0.4)]">
        <span class="text-pongcyan"><i class="fa-solid fa-hand-pointer text-xs mr-1"></i></span> ${t('play.tapToSelect')}
      </div>
    </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      /* Custom 'xs' breakpoint for screens larger than mobile but smaller than sm */
      @media (min-width: 440px) {
        .xs\\:hidden { display: none; }
      }
      
      /* Fix for iOS height issues */
      @supports (-webkit-touch-callout: none) {
        .h-dvh {
          height: 100vh; /* fallback for iOS */
        }
      }
      
      /* Fix for better touch handling */
      @media (hover: none) {
        .game-mode-btn:active {
          transform: scale(0.98);
        }
      }
    `;
    document.head.appendChild(style);

    ensureViewportMeta();

    const headerContainer = container.querySelector(".header");
    const header = Header();
    headerContainer?.appendChild(header);

    const footerContainer = container.querySelector(".footer");
    const footerComp = Footer();
    footerContainer?.appendChild(footerComp);

    document.querySelectorAll(".game-mode-btn").forEach((button) => {
      button.addEventListener("click", (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        if (target.dataset.route)
          navigate(target.dataset.route);
      });
      
      button.addEventListener("touchstart", () => {
        button.classList.add("active");
      }, { passive: true });
      
      button.addEventListener("touchend", () => {
        button.classList.remove("active");
      }, { passive: true });
    });

    const onlineMuliplayerBtn = container.querySelector('#online-multiplayer')!
    onlineMuliplayerBtn.addEventListener('click', () => {
      navigate('/play/online-game')
    });

    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      setupResponsiveCanvas(canvas);
      new PongAnimation(canvas);
    }
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (canvas) {
          setupResponsiveCanvas(canvas);
        }
      }, 100);
    });
  },
};

function ensureViewportMeta() {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    document.head.appendChild(viewport);
  }
}

function setupResponsiveCanvas(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement;
  if (parent) {
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }
}