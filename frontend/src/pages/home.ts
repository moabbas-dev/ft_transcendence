import { navigate, router } from '../router.js';
import { Lang, msg, setLanguage } from '../languages/LanguageController.js';
import { createComponent } from '../utils/StateManager.js';

export default {
  render: (container:HTMLElement) => {
    container.innerHTML = `
      <div class="w-screen bg-[var(--bg-color)] h-screen">
        <div class="container mx-auto w-full p-4 flex justify-end gap-3">
            <select id="languages" name="languages_options" class="w-12 text-lg bg-[var(--bg-color)] text-white focus:outline-none hover:opacity-80 hover:cursor-pointer">
              <option value="en" selected>en</option>
              <option value="fr">fr</option>
            </select>
          <div class="w-10 h-10 bg-slate-400 rounded-full"><!-- Logo Here as background image --></div>
        </div>
        <div class="container mx-auto h-[calc(100vh - 10px)]">
          <div class="grid grid-cols-2 place-content-center">
            <div class="h-fit bg-black hidden sm:block">
            </div>
            <div class="flex flex-col gap-4 justify-center">
              <h1 class="text-4xl sm:text-9xl text-white text-start drop-shadow-[1px_1px_20px_white] animate-pulse">${msg('home.title')}</h1>
              <p class="text-white text-2xl sm:text-4xl">
                ${msg('home.tagline')}
              </p>
              <div class="flex justify-start items-center">
                <button class="text-lg register-btn rounded-ss-lg rounded-ee-xl transition-all duration-200 text-white hover:opacity-80 flex justify-center items-center bg-[var(--main-color)] px-3 py-2 ">${msg('home.register')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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
      router();
    });
  },
};
