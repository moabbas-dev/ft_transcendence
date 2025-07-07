import moabbasImg from '/src/assets/moabbas.jpg';
import afarachiImg from '/src/assets/afarachi.jpg';
import jfatfatImg from '/src/assets/jfatfat.jpg';
import { t } from '../languages/LanguageController';
import { navigate } from "../router.js";

export default {
  render: (container: HTMLElement) => {
    container.className = 'flex flex-col h-dvh';
    container.innerHTML = `
      <div class="bg-black w-full h-fit p-2 sm:p-4 flex items-center justify-between border-b-2 border-pongcyan shadow-[0_5px_15px_rgba(0,247,255,0.5)]">
        <button id="home-btn" class="text-xs sm:text-lg rounded-lg text-white flex justify-center items-center bg-black border-2 border-pongpink px-2 sm:px-4 py-1 sm:py-2 
          transition-all duration-300 ease-in-out
          hover:text-pongpink hover:shadow-[0_0_15px_rgba(255,0,228,0.7)]
          focus:outline-none
          animate-fade-right animate-duration-700 animate-ease-linear">
          <i class="fas fa-home group-hover:rotate-12 transition-transform duration-300"></i>
        </button>
        
        <div class="logo flex flex-col items-center text-center font-bold text-white text-sm sm:text-xl transition-all duration-300 hover:animate-pulse">
          <span class="home-btn cursor-pointer text-pongcyan drop-shadow-[0_0_10px_#00f7ff] transition-all duration-300 hover:drop-shadow-[0_0_20px_#00f7ff] hover:text-white">
            ft_transcendence
          </span>
          <span class="text-pongpink text-[10px] sm:text-xs transition-all duration-300 hover:text-white drop-shadow-[0_0_5px_#ff00e4]">
            Neon Pong
          </span>
        </div>

        <div class="w-[60px] sm:w-[100px]"></div> <!-- Spacer for balance -->
      </div>
      
      <section class="w-full overflow-y-none bg-black flex-1 flex items-center justify-center py-4 sm:py-8 px-2 sm:px-4">
      <div class="container mx-auto grid place-content-center">
          <div class="flex flex-col gap-6 sm:gap-10 items-center justify-center px-2 sm:px-4">
            
            <div class="bg-[rgba(0,0,0,0.7)] border-2 border-pongpink rounded-xl p-4 sm:p-6 transform transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,0,228,0.4)] animate-fade-down animate-once animate-duration-700 w-full max-w-lg mx-auto">
              <h1 class="text-center text-xl sm:text-3xl md:text-5xl font-bold text-pongpink drop-shadow-[0_0_10px_#ff00e4]">
                ${t('about.title')}
              </h1>
            </div>
            
            <div class="flex flex-col md:flex-row justify-center items-stretch gap-4 sm:gap-8 w-full">
              <!-- Moabbas - Frontend -->
              <div class="flex flex-col items-center bg-black border-2 border-pongcyan p-3 sm:p-6 rounded-xl shadow-[0_0_20px_rgba(0,247,255,0.4)] transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,247,255,0.6)] animate-fade-right animate-once animate-duration-700 animate-delay-300 w-full">
                <div class="relative mb-3 sm:mb-6">
                  <img 
                    src="${moabbasImg}" 
                    alt="Moabbas - Frontend Developer"
                    class="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-pongcyan"
                  >
                  <div class="absolute inset-0 rounded-full border-2 border-pongcyan opacity-50 animate-ping"></div>
                </div>
                <h3 class="text-lg sm:text-2xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] mb-1">Moabbas</h3>
                <p class="text-pongpink font-medium mb-2 sm:mb-3 text-sm sm:text-base"><bdi>Frontend ${t('about.developer')}</bdi></p>
                <p class="text-white text-center text-xs sm:text-base">
                  ${t('about.moabbasInfo')}
                </p>
              </div>

              <!-- Afarachi - Fullstack -->
              <div class="flex flex-col items-center bg-black border-2 border-pongcyan p-3 sm:p-6 rounded-xl shadow-[0_0_20px_rgba(255,0,228,0.4)] transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,247,255,0.6)] animate-fade-up animate-once animate-duration-700 animate-delay-500 w-full">
                <div class="relative mb-3 sm:mb-6">
                  <img 
                    src="${afarachiImg}" 
                    alt="Afarachi - Fullstack Developer"
                    class="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-pongcyan"
                  >
                  <div class="absolute inset-0 rounded-full border-2 border-pongcyan opacity-50 animate-ping"></div>
                </div>
                <h3 class="text-lg sm:text-2xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] mb-1">Afarachi</h3>
                <p class="text-pongpink font-medium mb-2 sm:mb-3 text-sm sm:text-base"><bdi>Fullstack ${t('about.developer')}</bdi></p>
                <p class="text-white text-center text-xs sm:text-base">
                  ${t('about.afarachiInfo')}
                </p>
              </div>

              <!-- Jfatfat - Backend -->
              <div class="flex flex-col items-center bg-black border-2 border-pongcyan p-3 sm:p-6 rounded-xl shadow-[0_0_20px_rgba(0,247,255,0.4)] transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,247,255,0.6)] animate-fade-left animate-once animate-duration-700 animate-delay-300 w-full">
                <div class="relative mb-3 sm:mb-6">
                  <img 
                    src="${jfatfatImg}" 
                    alt="Jfatfat - Backend Developer"
                    class="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-pongcyan"
                  >
                  <div class="absolute inset-0 rounded-full border-2 border-pongcyan opacity-50 animate-ping"></div>
                </div>
                <h3 class="text-lg sm:text-2xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] mb-1">Jfatfat</h3>
                <p class="text-pongpink font-medium mb-2 sm:mb-3 text-sm sm:text-base"><bdi>Backend ${t('about.developer')}</bdi></p>
                <p class="text-white text-center text-xs sm:text-base">
                  ${t('about.jfatfatInfo')}
                </p>
              </div>
            </div>

            <div class="bg-[rgba(0,0,0,0.7)] border-2 border-pongcyan rounded-xl p-3 sm:p-6 transform transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,247,255,0.4)] max-w-2xl animate-fade-up animate-once animate-duration-700 animate-delay-700 w-full">
              <p class="text-sm sm:text-lg text-white text-center">
                ${t('about.conclusion')}
              </p>
              <p class="text-black text-center text-xs sm:text-sm mt-2 sm:mt-4 animate-pulse">Mr. Walid please 125 :)</p>
            </div>
          </div>
        </div>
      </section>
    `;

    container.querySelector(".home-btn")?.addEventListener("click", () => {
      navigate("/");
    });

    const homeButton = container.querySelector("#home-btn");
    homeButton?.addEventListener("click", () => {
      navigate("/");
    });
  },
};