import { navigate, refreshRouter } from '../router.js';
import { Lang, msg, setLanguage } from '../languages/LanguageController.js';
import { createComponent } from '../utils/StateManager.js';
import { PongAnimation } from '../components/PingPongAnimation.js';

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="w-screen bg-[var(--bg-color)] h-screen">
        <div class="container mx-auto w-full p-4 flex justify-end gap-4">
            <select id="languages" name="languages_options" title="Select your language" class="text-lg bg-[var(--bg-color)] text-white focus:outline-none hover:opacity-80 hover:cursor-pointer">
              <option value="en" selected>en</option>
              <option value="fr">fr</option>
            </select>
          <div class="account relative flex gap-3 text-white">
            <div class="flex gap-3 hover:text-[var(--main-color)] hover:cursor-pointer hover:underline">
              <div class="flex items-center justify-center text-lg font-bold">
                <p>Guest</p>
              </div>
              <div class="w-10 h-10 bg-slate-400 rounded-full bg-[url('./assets/guest.png')] bg-cover"><!-- Logo Here as background image --></div>
            </div>
            <ul class="account-list py-4 rounded-md shadow-md shadow-white right-0 text-nowrap absolute z-10 bottom-[-114px] bg-white text-[var(--bg-color)] hidden flex-col gap-1">
              <li class="px-4 hover:text-[var(--main-color)] hover:cursor-pointer hover:bg-slate-100">
                ${msg('home.register')}
              </li>
              <li class="px-4 hover:text-[var(--main-color)] hover:cursor-pointer hover:bg-slate-100">
              ${msg('home.register')}
              </li>
              <li class="font-bold px-4 hover:text-[var(--main-color)] hover:cursor-pointer hover:bg-slate-100">
              ${msg('home.register')}
              </li>
            </ul>
          </div>
          <div class="close-list hidden z-0 absolute top-0 left-0 w-full h-full"></div>
        </div>
        <div class="container mx-auto grid place-content-center h-[calc(100vh-72px)]">
          <div class="grid grid-cols-2 place-content-center gap-3">
            <div class="h-full bg-[var(--bg-color)] hidden sm:flex items-center">
              <canvas id="pongCanvas" class="w-full h-[50vh] border-2 border-white rounded-lg"></canvas>
            </div>
            <div class="flex flex-col gap-4 justify-center max-sm:w-screen max-sm:px-3">
              <h1 class="text-5xl max-sm:text-center max-sm:font-bold sm:text-6xl lg:text-9xl text-white text-start drop-shadow-[1px_1px_20px_white] animate-pulse">${msg('home.title')}</h1>
              <p class="text-white text-2xl max-sm:text-center lg:text-4xl">
                ${msg('home.tagline')}
              </p>
              <div class="flex justify-center sm:justify-start items-center">
                <button class="text-lg register-btn rounded-ss-lg rounded-ee-xl transition-all duration-200 text-white hover:opacity-80 flex justify-center items-center bg-[var(--main-color)] px-3 py-2 ">${msg('home.register')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const account = container.querySelector('.account')!;
    const account_list = container.querySelector('.account-list')!;
    const close_list = container.querySelector('.close-list')!;
    account.addEventListener('click', () => {
      account_list.classList.toggle('hidden')
      close_list.classList.toggle('hidden')
      account_list.classList.toggle('flex')
    })

    close_list.addEventListener('click', () => {
      account_list.classList.toggle('hidden')
      close_list.classList.toggle('hidden')
    })
    const register_btn = document.querySelector('.register-btn')!;
    register_btn.addEventListener('click', (e: Event) => {
      navigate('/register')
    })

    const languageSelect = document.getElementById("languages") as HTMLSelectElement;

    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      languageSelect.value = savedLanguage;
      setLanguage(languageSelect.value as Lang)
    }

    languageSelect.addEventListener("change", function (e: Event) {
      const selectedLanguage = this.value;
      localStorage.setItem("selectedLanguage", selectedLanguage);
      setLanguage(selectedLanguage as Lang)
      refreshRouter();
    });

    const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
    if (canvas) {
      new PongAnimation(canvas)
    }
  },
};
