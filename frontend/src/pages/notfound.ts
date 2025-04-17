import { t } from "../languages/LanguageController.js";
import { navigate } from "../router.js";
import { Footer } from "../components/header_footer/footer.js";

export default {
  render: (container: HTMLElement) => {
    container.className = 'flex flex-col h-dvh';
    container.innerHTML = `
      <div class="bg-black w-full h-fit p-4 z-10 flex items-center justify-between border-b-2 border-pongcyan shadow-[0_5px_15px_#00f7ff]">     
        <div class="logo flex flex-col items-center text-center font-bold text-white text-xl transition-all duration-300 hover:animate-pulse">
          <span class="text-pongcyan drop-shadow-[0_0_10px_#00f7ff] transition-all duration-300 hover:drop-shadow-[0_0_20px_#00f7ff] hover:text-white">
            ft_transcendence
          </span>
          <span class="text-pongpink text-xs transition-all duration-300 hover:text-white drop-shadow-[0_0_5px_#ff00e4]">
            Neon Pong
          </span>
        </div>
        
      </div>
      
      <section class="w-full overflow-x-none bg-black flex-1 flex items-center justify-center p-4">
        <div class="max-w-2xl mx-auto text-center">
          <div class="flex flex-col items-center justify-center gap-8">
            
            <!-- 404 Display -->
            <div class="relative animate-pulse">
              <div class="absolute inset-0 blur-xl bg-pongpink opacity-30"></div>
              <h1 class="text-8xl sm:text-9xl font-bold text-pongpink drop-shadow-[0_0_15px_#ff00e4] animate-bounce animate-duration-[3s] relative z-10">
                404
              </h1>
            </div>
            
            <!-- Ghost Icon -->
            <div class="relative animate-float">
              <i class="fas fa-ghost text-7xl sm:text-8xl text-pongcyan drop-shadow-[0_0_15px_#00f7ff]"></i>
              <div class="absolute top-0 left-0 w-full h-full animate-ping opacity-30 text-7xl sm:text-8xl">
                <i class="fas fa-ghost text-pongcyan"></i>
              </div>
            </div>
            
            <!-- Error Message -->
            <div class="bg-[rgba(0,0,0,0.7)] border-2 border-pongpink rounded-xl p-6 transform transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,0,228,0.4)] animate-fade-up animate-once animate-duration-700">
              <h2 class="text-2xl sm:text-3xl font-bold text-pongpink drop-shadow-[0_0_5px_#ff00e4] mb-4">
                ${t('notfound.title')}
              </h2>
              <p class="text-white mb-6">
                ${t('notfound.message')}
              </p>
              
              <!-- Home Button -->
              <button id="home-btn" class="group relative text-lg rounded-lg text-white flex mx-auto justify-center items-center bg-black border-2 border-pongcyan px-6 py-3 
                transition-all duration-300 ease-in-out
                hover:text-pongcyan hover:shadow-[0_0_15px_rgba(0,247,255,0.7)]
                focus:outline-none">
                <i class="fas fa-home mr-2 group-hover:scale-110 transition-transform duration-300"></i>
                <span class="relative z-10 drop-shadow-[0_0_5px_#00f7ff]">${t('notfound.homeBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
    
    // Add footer
    const footerComp = Footer();
    container.appendChild(footerComp);
    
    
    container.querySelector("#home-btn")?.addEventListener("click", () => {
      navigate("/");
    });
  },
};