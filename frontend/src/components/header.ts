import { createComponent } from "../utils/StateManager";
import { Lang, msg, setLanguage } from "../languages/LanguageController.js";
import logoUrl from "../../public/assets/ft_transcendencee.png";

interface ChatProps {}

export const Header = createComponent((props: ChatProps) => {
    const container = document.createElement("header");
    container.className = "fixed top-0 left-0 right-0 bg-[var(--main-color)] z-[1000] flex items-center justify-between px-[9%]";

    container.innerHTML = `

        <!-- <div id="menu-bar" class="fas fa-bars"></div> -->


        <img src="${logoUrl}" alt="Logo" class="w-16">

        <nav class="navbar flex ml-16">
            <div class="flex flex-col justify-center items-center mx-[0.8rem] text-[white] hover:cursor-pointer">
                <i class="fa-solid fa-play text-[2rem]"></i>
                <a href="#" class="hover:underline hover:text-[var(--bg-hover)]">Play</a>
            </div>
            <div class="flex flex-col justify-center items-center mx-[0.8rem] text-[white] hover:cursor-pointer">
                <i class="fa-solid fa-ranking-star text-[2rem]"></i>
                <a href="#" class="text-[white] mx-[0.8rem] hover:underline hover:text-[var(--bg-hover)]">Leaderboard</a>
            </div>
            <div class="flex flex-col justify-center items-center mx-[0.8rem] text-[white] hover:cursor-pointer">
                <i class="fa-solid fa-comments text-[2rem]"></i>
                <a href="#" class="text-[white]  mx-[0.8rem] hover:underline hover:text-[var(--bg-hover)]">Chat</a>
            </div>
        </nav>

        <div class="container mx-auto w-full p-4 flex justify-end gap-4">
            <div class="p-4">
                <i class="fas fa-search text-white text-[2rem]" id="search-btn"></i>
                <i class="fa-solid fa-bell text-white text-[2rem]"></i>
            </div>
            <select id="languages" name="languages_options" title="Select your language" class="text-lg bg-[var(--main-color)] text-white text-[2.5rem] focus:outline-none hover:opacity-80 hover:cursor-pointer">
                <option value="en" selected>en</option>
                <option value="fr">fr</option>
            </select>
            <div class="account relative flex gap-3 text-white">
                <div class="flex gap-3 hover:cursor-pointer hover:underline">
                    <div class="flex items-center justify-center text-lg font-bold">
                        <p>Guest</p>
                    </div>
                        <div class="w-10 h-10 bg-slate-400 rounded-full bg-[url('./assets/guest.png')] bg-cover"><!-- Logo Here as background image --></div>
                    </div>
                    <ul class="account-list py-4 rounded-md shadow-md shadow-white right-0 text-nowrap absolute z-10 bottom-[-114px] bg-white text-[var(--bg-color)] hidden flex-col gap-1">
                        <li class="px-4 hover:text-[var(--main-color)] hover:cursor-pointer hover:bg-slate-100">
                            ${msg("home.register")}
                        </li>
                        <li class="px-4 hover:text-[var(--main-color)] hover:cursor-pointer hover:bg-slate-100">
                            ${msg("home.register")}
                        </li>
                        <li class="font-bold px-4 hover:text-[var(--main-color)] hover:cursor-pointer hover:bg-slate-100">
                            ${msg("home.register")}
                        </li>
                    </ul>
                </div>
            <div class="close-list hidden z-0 absolute top-0 left-0 w-full h-full"></div>
        </div>
    `;
    return container;
});
