import { navigate } from "../router.js";
import { t } from "../languages/LanguageController.js";
import { PongAnimation } from "../components/partials/PingPongAnimation.js";
import { Header } from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";
import chatService from "../utils/chatWebSocketService.js";
import store from "../../store/store.js";
import { account } from '../appwriteConfig.js';
import axios from "axios";
import Toast from "../toast/Toast.js";
import { jwtDecode } from "jwt-decode";
import { PongLoading } from "../components/partials/PongLoading.js";

export default {
  render: async (container: HTMLElement) => {
    container.className = 'flex flex-col h-dvh'
    container.innerHTML = `
    <div class="profile"></div>
    <div class="header bg-pongblue w-full h-fit"></div>
    <div class="w-full overflow-x-none bg-gradient-to-br from-pongdark via-[#0a1128] to-pongdark flex-1 flex items-center justify-center">
      <div class="container mx-auto grid place-content-center px-4">
        <div class="flex items-center justify-center gap-5">
          <div class="xl:w-1/2 h-full hidden sm:flex items-center">
            <div class="relative">
              <canvas id="pongCanvas" class="w-full h-[50vh] border-4 border-pongblue rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] transform transition-transform animate-flip-up animate-duration-[3s]"></canvas>
              <div class="absolute inset-0 bg-pongblue opacity-20 rounded-2xl animate-flip-down animate-duration-[3s]"></div>
            </div>
          </div>
          <div class="flex flex-col gap-3 justify-center max-sm:w-full max-sm:px-3">
            <div class="bg-[rgba(59,130,246,0.1)] border border-pongblue/20 rounded-xl p-6 transform transition-transform hover:scale-[1.02]">
              <h1 class="text-nowrap text-5xl max-sm:text-center max-sm:font-bold sm:text-6xl lg:text-8xl xl:text-9xl text-white text-start drop-shadow-[0_0_10px_#0F6292] animate-fade-right animate-once animate-duration-700 animate-ease-linear">
                ${t("home.title")}
              </h1>
              <p class="text-white text-2xl max-sm:text-center lg:text-4xl mt-4 opacity-80 animate-fade-left sm:animate-fade-right animate-once animate-duration-700 animate-delay-700 animate-ease-linear">
                ${t("home.tagline")}
              </p>
            </div>
            <div class="flex flex-wrap justify-center sm:justify-start items-center gap-4">
              ${store.userId ? `
              <button id="chat-friends-btn" class="group relative text-lg rounded-lg text-white flex justify-center items-center bg-pongblue px-6 py-3 
                transition-all duration-300 ease-in-out
                hover:bg-pongblue/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
                focus:outline-none focus:ring-2 focus:ring-pongblue focus:ring-offset-2
                animate-fade-up animate-duration-700 animate-delay-1000 animate-ease-linear">
                <span class="relative z-10">Chat with Friends</span>
              </button>
              <button id="play-online-btn" class="group relative text-lg rounded-lg text-white flex justify-center items-center bg-pongblue px-6 py-3 
                transition-all duration-300 ease-in-out
                hover:bg-pongblue/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
                focus:outline-none focus:ring-2 focus:ring-pongblue focus:ring-offset-2
                animate-fade-up animate-duration-700 animate-delay-[1200ms] animate-ease-linear">
                <span class="relative z-10">Play Online</span>
              </button>
              <button id="start-tournament-btn" class="group relative text-lg rounded-lg text-white flex justify-center items-center bg-pongblue px-6 py-3 
                transition-all duration-300 ease-in-out
                hover:bg-pongblue/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
                focus:outline-none focus:ring-2 focus:ring-pongblue focus:ring-offset-2
                animate-fade-up animate-duration-700 animate-delay-[1400ms] animate-ease-linear">
                <span class="relative z-10">Start a Tournament</span>
              </button>
              ` : `
              <button id="register-btn" class="group relative text-lg rounded-lg text-white flex justify-center items-center bg-pongblue px-6 py-3 
                transition-all duration-300 ease-in-out
                hover:bg-pongblue/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
                focus:outline-none focus:ring-2 focus:ring-pongblue focus:ring-offset-2
                animate-fade-up animate-duration-700 animate-delay-1000 animate-ease-linear">
                <span class="relative z-10">${t("home.register")}</span>
              </button>
              <button id="ai-btn" class="group relative text-lg rounded-lg text-white flex justify-center items-center bg-pongblue px-6 py-3 
                transition-all duration-300 ease-in-out
                hover:bg-pongblue/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
                focus:outline-none focus:ring-2 focus:ring-pongblue focus:ring-offset-2
                animate-fade-up animate-duration-700 animate-delay-[1200ms] animate-ease-linear">
                <span class="relative z-10">${t("home.playAI")}</span>
              </button>
              <button id="local-btn" class="group relative text-lg rounded-lg text-white flex justify-center items-center bg-pongblue px-6 py-3 
                transition-all duration-300 ease-in-out
                hover:bg-pongblue/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
                focus:outline-none focus:ring-2 focus:ring-pongblue focus:ring-offset-2
                animate-fade-up animate-duration-700 animate-delay-[1400ms] animate-ease-linear">
                <span class="relative z-10">${t("home.playLocaly")}</span>
              </button>
              `}

            </div>
          </div>
        </div>
      </div>
    </div> 
    `;

    if(window.location.href.endsWith(':5173/#') && localStorage.getItem("googleAuthClicked")) {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black opacity-40 z-50';
      container.appendChild(overlay);
      container.classList.add('overflow-hidden', 'pointer-events-none', 'items-center', 'justify-center');  
      const loadingContainer = document.createElement('div');
      loadingContainer.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] bg-white rounded-lg shadow-pongblue shadow-lg p-4 z-60';
      loadingContainer.appendChild(PongLoading({text: "Signing you in..."}));
      container.appendChild(loadingContainer);
    }

    //header
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);

    //footer
    const footerComp = Footer()
    container.appendChild(footerComp)

    container.querySelector("#register-btn")?.addEventListener("click", () => {
      navigate("/register");
    });

    container.querySelector('#local-btn')?.addEventListener('click', () => {
      navigate('/play/local-multi')
    })

    container.querySelector('#ai-btn')?.addEventListener('click', () => {
      navigate('/play/local-ai')
    })

    container.querySelector("#play-online-btn")?.addEventListener("click", () => {
      navigate("/play/online-game");
    })

    container.querySelector("#chat-friends-btn")?.addEventListener("click", () => {
      navigate("/chat");
    })

    container.querySelector("#start-tournament-btn")?.addEventListener("click", () => {
      navigate("/play/tournaments");
    })

    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas);
    }

    const getGoogleProfilePhoto = async (): Promise<string | null> => {
      try {
        // Get current session and access token
        const session = await account.getSession('current');
        const accessToken = session.providerAccessToken;
    
        if (!accessToken) {
          throw new Error('No Google access token available');
        }
    
        // Fetch user profile from Google People API
        const response = await axios.get(
          'https://people.googleapis.com/v1/people/me?personFields=photos',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
    
        // Extract profile photo URL
        const [profilePhoto] = response.data.photos || [];
        return profilePhoto?.url || null;
      } catch (error) {
        console.error('Error fetching Google profile photo:', error);
        return null;
      }
    };

    const checkUserAfterAuth = async (): Promise<void> => {
      try {
        // localStorage.removeItem("googleAuth");
        const appwiteUser = await account.get();
        console.log(appwiteUser.$id);
        const photoUrl = await getGoogleProfilePhoto();
        console.log(photoUrl); // this works 100%
        const session = await account.getSession('current');
        try {
          const data = await axios.post("http://localhost:8001/auth/google/signIn", { email: appwiteUser.email, name: appwiteUser.name, country: session.countryName});
          if (!data.data.require2FA) {
            if (data.data.accessToken) {
              const decodedToken: any = jwtDecode(data.data.accessToken);
              store.update("accessToken", data.data.accessToken);
              store.update("refreshToken", data.data.refreshToken);
              store.update("sessionUUID", data.data.sessUUID);
              store.update("userId", decodedToken.userId);
              store.update("email", decodedToken.email);
              store.update("nickname", decodedToken.nickname);
              store.update("fullName", decodedToken.fullName);
              store.update("age", decodedToken.age);
              store.update("country", decodedToken.country);
              store.update("createdAt", decodedToken.createdAt);
              store.update("avatarUrl", decodedToken.avatarUrl);
              store.update("is2faEnabled", decodedToken.is2fa);
              store.update("isLoggedIn", true);
              navigate("/");
              Toast.show(`Login successful, Welcome ${decodedToken.fullName}!`, "success");
            }
          } else {
            store.update("sessionUUID", data.data.sessUUID);
            navigate("/register/twofactor");
            Toast.show("First step is complete! Now moving to the 2fa code validation", "success");
          }
          try {
            await axios.post(`http://localhost:8001/auth/google_upload/${store.sessionUUID}?photo=${photoUrl as string}`, undefined, {
              headers:{
                Authorization: `Bearer ${store.accessToken}`,
              }
            })
            store.update("avatarUrl", photoUrl as string);
          } catch(err) {
            console.log(err);
          }
          localStorage.removeItem("googleAuthClicked");
        } catch (err: any) {
          localStorage.removeItem("googleAuthClicked");
          if (err.response) {
            if (err.response.status === 404 || err.response.status === 403)
              Toast.show(`Error: ${err.response.data.message}`, "error");
            else if (err.response.status === 500)
              Toast.show(`Server error: ${err.response.data.error}`, "error");
            else
              Toast.show(`Unexpected error: ${err.response.data}`, "error");
          } else if (err.request)
            Toast.show(`No response from server: ${err.request}`, "error");
          else
            Toast.show(`Error setting up the request: ${err.message}`, "error");
          console.log(err);
        }
      } catch (err: any) {
        localStorage.removeItem("googleAuthClicked");
        Toast.show(`Error! cannot fetch user data! ${err.message}`, "error");
      }
    }

    if (localStorage.getItem("googleAuthClicked") === "true")
      await checkUserAfterAuth();
  },
};

window.addEventListener("DOMContentLoaded", async () => {
  await initializeWebSocket();
});

// Initialize WebSocket connection
async function initializeWebSocket() {
  try {
    const username = store.nickname;
    const userId = store.userId;

    if (!username || !userId) {
      // console.error("User information not found in sessionStorage");
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
