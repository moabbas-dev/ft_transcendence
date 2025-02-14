import { navigate, refreshRouter } from "../router.js";
import { Lang, msg, setLanguage } from "../languages/LanguageController.js";
import { createComponent } from "../utils/StateManager.js";
import { PongAnimation } from "../components/PingPongAnimation.js";
import { Header } from "../components/header";

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="header"> </div>
      <div class="w-screen bg-[var(--bg-color)] h-[100dvh]">
        
        <div class="container mx-auto grid place-content-center h-[calc(100vh-72px)]">
          <div class="grid grid-cols-2 place-content-center gap-3">
            <div class="h-full bg-[var(--bg-color)] hidden sm:flex items-center">
              <canvas id="pongCanvas" class="w-full h-[50vh] border-2 border-white rounded-lg"></canvas>
            </div>
            <div class="flex flex-col gap-4 justify-center max-sm:w-screen max-sm:px-3">
              <h1 class="text-5xl max-sm:text-center max-sm:font-bold sm:text-6xl lg:text-9xl text-white text-start drop-shadow-[1px_1px_20px_white] animate-pulse">${msg(
                "home.title"
              )}</h1>
              <p class="text-white text-2xl max-sm:text-center lg:text-4xl">
                ${msg("home.tagline")}
              </p>
              <div class="flex justify-center sm:justify-start items-center">
                <button class="text-lg register-btn rounded-ss-lg rounded-ee-xl transition-all duration-200 text-white hover:opacity-80 flex justify-center items-center bg-[var(--main-color)] px-3 py-2 ">${msg(
                  "home.register"
                )}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);
    let searchBtn = document.querySelector("#search-btn");
    let searchBar = document.querySelector("#search-bar-container");

    searchBtn?.addEventListener("click", () => {
      searchBtn.classList.toggle("fa-times");
      searchBar?.classList.toggle("hidden");
    });
    const account = container.querySelector(".account")!;
    const account_list = container.querySelector(".account-list")!;
    const close_list = container.querySelector(".close-list")!;
    account.addEventListener("click", () => {
      account_list.classList.toggle("hidden");
      close_list.classList.toggle("hidden");
      account_list.classList.toggle("flex");
    });

    close_list.addEventListener("click", () => {
      account_list.classList.toggle("hidden");
      close_list.classList.toggle("hidden");
    });
    const register_btn = document.querySelector(".register-btn")!;
    register_btn.addEventListener("click", (e: Event) => {
      navigate("/register");
    });

    const languageSelect = document.getElementById(
      "languages"
    ) as HTMLSelectElement;

    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      languageSelect.value = savedLanguage;
      setLanguage(languageSelect.value as Lang);
    }

    languageSelect.addEventListener("change", function (e: Event) {
      const selectedLanguage = this.value;
      localStorage.setItem("selectedLanguage", selectedLanguage);
      setLanguage(selectedLanguage as Lang);
      refreshRouter();
    });

    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas);
    }
  },
};
