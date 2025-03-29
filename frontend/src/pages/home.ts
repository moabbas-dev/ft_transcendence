import { navigate } from "../router.js";
import { t } from "../languages/LanguageController.js";
import { PongAnimation } from "../components/partials/PingPongAnimation.js";
import {Header}  from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";
import chatService from "../utils/chatWebSocketService.js";
import store from "../../store/store.js";

export default {
  render: async (container: HTMLElement) => {
    container.className = 'flex flex-col h-dvh'
    container.innerHTML = `
      <div class="profile"></div>
      <div class="header bg-pongblue w-full h-fit"></div>
      <div class="w-full overflow-x-none bg-pongdark flex-1 flex items-center justify-center">
        <div class="container mx-auto grid place-content-center">
          <div class="flex items-center justify-center gap-3">
            <div class="xl:w-1/2 h-full bg-pongdark hidden sm:flex items-center">
              <canvas id="pongCanvas" class="w-full h-[50vh] border-2 border-white rounded-lg"></canvas>
            </div>
            <div class="flex flex-col gap-4 justify-center max-sm:w-full max-sm:px-3">
              <h1 class="text-5xl max-sm:text-center max-sm:font-bold sm:text-6xl lg:text-8xl xl:text-9xl text-white text-start drop-shadow-[1px_1px_20px_white] animate-fade-right animate-once animate-duration-700 animate-ease-linear">
                ${t("home.title")}
              </h1>
              <p class="text-white text-2xl max-sm:text-center lg:text-4xl animate-fade-left sm:animate-fade-right animate-once animate-duration-700 animate-delay-700 animate-ease-linear">
                ${t("home.tagline")}
              </p>
              <div class="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3">
                <button id="register-btn" class="text-lg rounded-ss-lg rounded-ee-xl text-white flex justify-center items-center bg-pongblue px-3 py-2 animate-fade-up animate-duration-700 animate-delay-1000 animate-ease-linear">${t(
                  "home.register"
                )}</button>
                <button id="ai-btn" class="text-lg rounded-ss-lg rounded-ee-xl text-white flex justify-center items-center bg-pongblue px-3 py-2 animate-fade-up animate-duration-700 animate-delay-[1200ms] animate-ease-linear">
                  ${t("home.playAI")}
                </button>
                <button id="local-btn" class="text-lg rounded-ss-lg rounded-ee-xl text-white flex justify-center items-center bg-pongblue px-3 py-2 animate-fade-up animate-duration-700 animate-delay-[1400ms] animate-ease-linear">
                  ${t("home.playLocaly")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    await initializeWebSocket();

    // Initialize WebSocket connection
    async function initializeWebSocket() {
      try {
        const username = store.nickname;
        const userId = store.userId;

        if (!username || !userId) {
          console.error("User information not found in localStorage");
          return;
        }

        // Connect to WebSocket server
        await chatService.connect();

        console.log("Connected to chat service");
      } catch (error) {
        console.error("Failed to connect to chat service:", error);
      } finally {
      }
    }

    //header
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);

    //footer
    const footerComp = Footer()
    container.appendChild(footerComp)

    container.querySelector("#register-btn")!.addEventListener("click", () => {
      navigate("/register");
    });

    container.querySelector('#local-btn')!.addEventListener('click', () => {
      navigate('/play/local-multi')
    })

    container.querySelector('#ai-btn')!.addEventListener('click', () => {
      navigate('/play/local-ai')
    })

    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas);
    }
  },
};
