import { navigate } from "../router.js";
import { t } from "../languages/LanguageController.js";
import { PongAnimation } from "../components/partials/PingPongAnimation.js";
import { Header } from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";
import axios from "axios";
import store from "../../store/store.js";
import { jwtDecode } from "jwt-decode";
import Toast from "../toast/Toast.js";

export default {
  render: async (container: HTMLElement) => {
    container.innerHTML = `
    <div class="profile"></div>
    <div class="header bg-pongblue w-full h-fit"></div>
    <div class="content relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-[calc(100vh-56px-68px)] sm:h-[calc(100vh-136px)]">
        <canvas id="pongCanvas" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:top-0 sm:left-0 z-0 w-full h-[inherit] opacity-30 inset-0 rotate-90 origin-center sm:rotate-0"></canvas>
        
        <!-- Particle effects overlay -->
        <div class="absolute inset-0 z-5 pointer-events-none"></div>
        
        <div class="game-options relative z-10 container mx-auto max-sm:px-4 flex flex-col gap-5 sm:gap-8 md:gap-10 h-full w-full items-center justify-center">
            <h1 class="text-4xl md:text-6xl font-bold text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-fade-down animate-once">
                ${t("play.title")}
            </h1>
            
            <div class="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                <button class="game-mode-btn max-[350px]:size-[120px] max-sm:size-[150px] max-sm:justify-center p-3 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-[0_8px_24px_rgba(66,153,225,0.4)] active:translate-y-0 active:shadow-inner animate-fade-up animate-once backdrop-blur-sm" data-route="/play/local-ai">
                    <span class="group-hover:scale-[1.2] max-[350px]:text-[2rem] text-[2.5rem] transition-transform duration-300 ease-in-out">
                      <i class="fa-solid fa-robot drop-shadow-[0_5px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_8px_10px_rgba(66,153,225,0.6)]"></i>
                    </span>
                    <div class="flex flex-col gap-1 text-center sm:text-left">
                        <h2 class="max-[350px]:text-lg text-2xl font-bold sm:text-start">${t('play.vsAI')}</h2>
                        <p class="hidden sm:block text-[0.9rem] opacity-90 sm:text-start">${t('play.vsAIInfo')}</p>
                    </div>
                </button>
                
                <button class="game-mode-btn max-[350px]:size-[120px] max-sm:size-[150px] max-sm:justify-center p-3 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-[0_8px_24px_rgba(66,153,225,0.4)] active:translate-y-0 active:shadow-inner animate-fade-up animate-once animate-delay-100 backdrop-blur-sm" data-route="/play/local-multi">
                    <span class="group-hover:scale-[1.2] max-[350px]:text-[2rem] text-[2.5rem] transition-transform duration-300 ease-in-out">
                      <i class="fa-solid fa-user-group drop-shadow-[0_5px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_8px_10px_rgba(66,153,225,0.6)]"></i>
                    </span>
                    <div class="flex flex-col gap-1 text-center sm:text-left">
                        <h2 class="max-[350px]:text-lg text-2xl font-bold sm:text-start">${t('play.localPlayer')}</h2>
                        <p class="hidden sm:block text-[0.9rem] opacity-90 sm:text-start">${t('play.localPlayerInfo')}</p>
                    </div>
                </button>
                
                <button class="game-mode-btn max-[350px]:size-[120px] max-sm:size-[150px] max-sm:justify-center p-3 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-[0_8px_24px_rgba(66,153,225,0.4)] active:translate-y-0 active:shadow-inner animate-fade-up animate-once animate-delay-200 backdrop-blur-sm" data-route="/play/tournaments">
                    <span class="group-hover:scale-[1.2] max-[350px]:text-[2rem] text-[2.5rem] transition-transform duration-300 ease-in-out">
                      <i class="fa-solid fa-trophy drop-shadow-[0_5px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_8px_10px_rgba(66,153,225,0.6)]"></i>
                    </span>
                    <div class="flex flex-col gap-1 text-center sm:text-left">
                        <h2 class="max-[350px]:text-lg text-2xl font-bold sm:text-start">${t('play.tournament')}</h2>
                        <p class="hidden sm:block text-[0.9rem] opacity-90 sm:text-start">${t('play.tournamentInfo')}</p>
                    </div>
                </button>
                
                <button id="online-multiplayer" class="game-mode-btn max-[350px]:size-[120px] max-sm:size-[150px] max-sm:justify-center p-3 sm:p-8 border-none rounded-2xl group bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue text-white flex max-sm:flex-col items-center gap-3 sm:gap-6 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-[0_8px_24px_rgba(66,153,225,0.4)] active:translate-y-0 active:shadow-inner animate-fade-up animate-once animate-delay-300 backdrop-blur-sm">
                    <span class="group-hover:scale-[1.2] max-[350px]:text-[2rem] text-[2.5rem] transition-transform duration-300 ease-in-out">
                      <i class="fa-solid fa-globe drop-shadow-[0_5px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_8px_10px_rgba(66,153,225,0.6)]"></i>
                    </span>
                    <div class="flex flex-col gap-1 text-center sm:text-left">
                        <h2 class="max-[350px]:text-lg text-2xl font-bold sm:text-start">${t('play.online')}</h2>
                        <p class="hidden sm:block text-[0.9rem] opacity-90 sm:text-start">${t('play.onlineInfo')}</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
    <div class="footer"></div>
`;

    if (localStorage.getItem("googleAuth") && localStorage.getItem("googleAuth") === "true") {
      try {
        const googleData = await axios.get("http://localhost:8001/auth/google/signIn", {
          withCredentials: true,
        });
        const decodedToken: any = jwtDecode(googleData.data.accessToken);
        store.update("accessToken", googleData.data.accessToken);
        store.update("refreshToken", googleData.data.refreshToken);
        store.update("sessionId", googleData.data.sessionId);
        store.update("userId", decodedToken.userId);
        store.update("email", decodedToken.email);
        store.update("nickname", decodedToken.nickname);
        store.update("fullName", decodedToken.fullName);
        store.update("age", decodedToken.age);
        store.update("country", decodedToken.country);
        store.update("createdAt", decodedToken.createdAt);
        store.update("avatarUrl", decodedToken.avatarUrl);
        store.update("isLoggedIn", true);
        Toast.show(`Login successful, Welcome ${store.fullName}!`, "success");
        localStorage.removeItem("googleAuth");
      } catch (error: any) {
        localStorage.removeItem("googleAuth");
        if (error.response) {
          if (error.response.status === 401) {
            if (error.response.data.key !== "cookie")
              Toast.show(`Error: ${error.response.data.message}`, "error");
          }
          else if (error.response.status === 500)
            Toast.show(`Server error: ${error.response.data.error}`, "error");
          else
            Toast.show(`Unexpected error: ${error.response}`, "error");
        } else if (error.request)
          Toast.show(`No response from server: ${error.request}`, "error");
        else
          Toast.show(`Error setting up the request: ${error.message}`, "error");
      }
    }
    //header
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);

    //footer
    const footer = container.querySelector(".footer")!;
    const footerComp = Footer();
    footer.appendChild(footerComp);

    // Add button interactions
    document.querySelectorAll(".game-mode-btn").forEach((button) => {
      button.addEventListener("click", (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        if (target.dataset.route)
          navigate(target.dataset.route);
      });
    });

    const onlineMuliplayerBtn = container.querySelector('#online-multiplayer')!
    onlineMuliplayerBtn.addEventListener('click', () => {
      navigate('/play/online-game')
    })
    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas);
    }
  },
};
