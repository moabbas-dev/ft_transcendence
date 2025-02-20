import { navigate } from "../router.js";
import { msg} from "../languages/LanguageController.js";
import { PongAnimation } from "../components/PingPongAnimation.js";
import { Header } from "../components/header.js";
import { Footer } from "../components/footer.js";

export default {
    render: (container: HTMLElement) => {
    container.innerHTML = `
        <div class="header bg-[var(--main-color)] w-full h-fit"></div>
        <div class="content relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900  h-[calc(100vh-136px)]">
            <canvas id="pongCanvas" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:top-0 sm:left-0 z-0 sm:w-full sm:h-full opacity-50 inset-0 rotate-90 origin-center sm:rotate-0"></canvas>
            <div class="game-options relative z-10 container mx-auto max-sm:px-4 flex flex-col gap-5 sm:gap-8 md:gap-10 h-full items-center justify-center">
                <h1 class="text-4xl md:text-6xl font-bold text-center text-white animate-fade-down animate-once">
                    ${msg("choose-mode")}
                </h1>
                <div class="grid grid-cols-2 gap-4 md:gap-8">
                <!-- Buttons will be inserted here -->
                    <button class="game-mode-btn max-sm:size-[150px] max-sm:justify-center p-2 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-[var(--main-color)] to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-[var(--main-color)] text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform translate-y-0 shadow-md active:translate-y-0 animate-fade-up animate-once" data-route="/local-ai">
                        <span class="group-hover:scale-[1.2] text-[2.5rem] transition-transform duration-300 ease-in-out">
                          <i class="fa-solid fa-robot"></i>
                        </span>
                        <div class="flex flex-col gap-1 text-center sm:text-left">
                            <h2 class="text-2xl">VS AI</h2>
                            <p class="hidden sm:block text-[0.9rem]">Test your skills against our smart AI</p>
                        </div>
                    </button>
                    <button class="game-mode-btn max-sm:size-[150px] max-sm:justify-center p-2 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-[var(--main-color)] to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-[var(--main-color)] text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform translate-y-0 shadow-md active:translate-y-0 animate-fade-up animate-once" data-route="/play/local-multi">
                        <span class="group-hover:scale-[1.2] text-[2.5rem] transition-transform duration-300 ease-in-out">
                          <i class="fa-solid fa-user-group"></i>
                        </span>
                        <div class="flex flex-col gap-1 text-center sm:text-left">
                            <h2 class="text-2xl">Local Multiplayer</h2>
                            <p class="hidden sm:block text-[0.9rem]">Play with a friend on the same device</p>
                        </div>
                    </button>
                    <button class="game-mode-btn max-sm:size-[150px] max-sm:justify-center p-2 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-[var(--main-color)] to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-[var(--main-color)] text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform translate-y-0 shadow-md active:translate-y-0 animate-fade-up animate-once" data-route="/online-tournament">
                        <span class="group-hover:scale-[1.2] text-[2.5rem] transition-transform duration-300 ease-in-out">
                          <i class="fa-solid fa-trophy"></i>
                        </span>
                        <div class="flex flex-col gap-1 text-center sm:text-left">
                            <h2 class="text-2xl">Online Tournament</h2>
                            <p class="hidden sm:block text-[0.9rem]">Compete in a knockout tournament</p>
                        </div>
                    </button>
                    <button class="game-mode-btn max-sm:size-[150px] max-sm:justify-center p-2 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-[var(--main-color)] to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-[var(--main-color)] text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform translate-y-0 shadow-md active:translate-y-0 animate-fade-up animate-once" data-route="/online-multi">
                        <span class="group-hover:scale-[1.2] text-[2.5rem] transition-transform duration-300 ease-in-out">
                          <i class="fa-solid fa-globe"></i>
                        </span>
                        <div class="flex flex-col gap-1 text-center sm:text-left">
                            <h2 class="text-2xl">Online Multiplayer</h2>
                            <p class="hidden sm:block text-[0.9rem]">Challenge players worldwide</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
        <div class="footer"></div>
      `;

    //header
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);

    //footer
    const footer = container.querySelector(".footer")!;
    const footerComp = Footer();
    footer.appendChild(footerComp);
    // Add animations and styles
    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes buttonEntrance {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
  
        @keyframes backgroundFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
  
        .animate-drop-in {
          animation: dropIn 0.8s ease-out forwards;
        }
  
        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
    container.appendChild(style);

    // Add button interactions
    document.querySelectorAll(".game-mode-btn").forEach((button) => {
      button.addEventListener("click", (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        navigate(target.dataset.route!);
      });
    });

    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas);
    }
  },
};
