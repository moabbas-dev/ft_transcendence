import { navigate, refreshRouter } from "../router.js";
import { Lang, msg, setLanguage } from "../languages/LanguageController";
import { PongAnimation } from "../components/PingPongAnimation";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Profile } from "../components/UserProfile.js";

export default {
    render: (container: HTMLElement) => {
    container.innerHTML = `
        <div class="header bg-[var(--main-color)] w-full h-fit"></div>
        <div class="content relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900  h-[calc(100vh-136px)]">
            <canvas id="pongCanvas" class="absolute inset-0 opacity-50 w-full h-full"></canvas>
            <div class="game-options relative z-10 container mx-auto px-4 py-16">
                <h1 class="text-4xl md:text-6xl font-bold text-center mb-12 text-white animate-drop-in">
                    ${msg("choose-mode")}
                </h1>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <!-- Buttons will be inserted here -->
                    <button class="game-mode-btn" data-route="/play/ai">
                        <span>🕹️</span>
                        <div>
                            <h2>VS AI</h2>
                            <p>Test your skills against our smart AI</p>
                        </div>
                    </button>
                    <button class="game-mode-btn" data-route="/play/local-multi">
                        <span>👥</span>
                        <div>
                            <h2>Local Multiplayer</h2>
                            <p>Play with a friend on the same device</p>
                        </div>
                    </button>
                    <button class="game-mode-btn" data-route="/online-tournament">
                        <span>🏆</span>
                        <div>
                            <h2>Online Tournament</h2>
                            <p>Compete in a knockout tournament</p>
                        </div>
                    </button>
                    <button class="game-mode-btn" data-route="/online-multi">
                        <span>🌐</span>
                        <div>
                            <h2>Online Multiplayer</h2>
                            <p>Challenge players worldwide</p>
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
        .game-mode-btn {
          padding: 2rem;
          border: none;
          border-radius: 15px;
          background: linear-gradient(145deg, var(--main-color) 30%, rgba(100,100,255,0.8));
          color: white;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: translateY(0);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          opacity: 0;
          animation: buttonEntrance 0.5s ease forwards;
        }
  
        .game-mode-btn span {
          font-size: 2.5rem;
          transition: transform 0.3s ease;
        }
  
        .game-mode-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          background: linear-gradient(145deg, rgba(100,100,255,0.9), var(--main-color));
        }
  
        .game-mode-btn:hover span {
          transform: scale(1.2);
        }
  
        .game-mode-btn:active {
          transform: translateY(0);
        }
  
        .game-mode-btn div {
          text-align: left;
        }
  
        .game-mode-btn h2 {
          font-size: 1.5rem;
          margin: 0;
        }
  
        .game-mode-btn p {
          margin: 0.5rem 0 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }
  
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
