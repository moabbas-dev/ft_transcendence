import { navigate, refreshRouter } from "../router.js";
import { Lang, msg, setLanguage } from "../languages/LanguageController.js";
import { PongAnimation } from "../components/partials/PingPongAnimation.js";
import {Header}  from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="profile"> </div>
      <div class="header bg-pongblue w-full h-fit"> </div>
      <div class="w-full overflow-x-none bg-pongdark">
        <div class="container mx-auto grid place-content-center h-[calc(100vh-68px)]">
          <div class="grid sm:grid-cols-2 place-content-center gap-3">
            <div class="h-full bg-pongdark hidden sm:flex items-center">
              <canvas id="pongCanvas" class="w-full h-[50vh] border-2 border-white rounded-lg"></canvas>
            </div>
            <div class="flex flex-col gap-4 justify-center max-sm:w-full max-sm:px-3">
              <h1 class="text-5xl max-sm:text-center max-sm:font-bold sm:text-6xl lg:text-8xl xl:text-9xl text-white text-start drop-shadow-[1px_1px_20px_white] animate-fade-right animate-once animate-duration-700 animate-ease-linear">
                ${msg("home.title")}
              </h1>
              <p class="text-white text-2xl max-sm:text-center lg:text-4xl animate-fade-left sm:animate-fade-right animate-once animate-duration-700 animate-delay-700 animate-ease-linear">
                ${msg("home.tagline")}
              </p>
              <div class="flex justify-center sm:justify-start items-center">
                <button class="text-lg register-btn rounded-ss-lg rounded-ee-xl transition-all duration-200 text-white hover:opacity-80 flex justify-center items-center bg-pongblue px-3 py-2 animate-fade-up animate-once animate-duration-700 animate-delay-1000 animate-ease-linear">${msg(
                  "home.register"
                )}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer"> </div>
    `;
    //header
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);

    
    //footer
    const footer = container.querySelector('.footer')!
    const footerComp = Footer()
    footer.appendChild(footerComp)

    const register_btn = document.querySelector(".register-btn")!;
    register_btn.addEventListener("click", () => {
      navigate("/register");
    });

    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas);
    }
  },
};
