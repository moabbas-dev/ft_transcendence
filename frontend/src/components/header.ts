import { createComponent } from "../utils/StateManager";
import { msg } from "../languages/LanguageController.js";
import logoUrl from "/src/assets/ft_transcendencee.png";
import { navigate } from "../router.js";
import { Notification } from "./Notification.js";
import { Profile } from "./UserProfile.js";

export const Header = createComponent(() => {
    const container = document.createElement("header");
    container.className = "container mx-auto relative p-2 flex items-center justify-between text-white max-sm:gap-2";
    container.innerHTML = `
        <!-- <div id="menu-bar" class="fas fa-bars"></div> -->
        <div class="flex items-center justify-start w-1/2 gap-2 sm:gap-8">
            <img src="${logoUrl}" alt="Logo" class="w-10 sm:w-12 hover:drop-shadow-[1px_1px_20px_white]">
            <nav class="navbar items-center gap-4 hidden sm:flex">
                <div class="nav-child playPage flex flex-col justify-center items-center transition-all hover:cursor-pointer hover:text-[var(--bg-hover)]" onClick="${() => navigate('/play')}">
                    <i class="fa-solid fa-play text-lg sm:text-xl"></i>
                    <span>${msg('home.header.play')}</span>
                </div>
                <div class="nav-child flex flex-col justify-center items-center transition-all hover:cursor-pointer hover:text-[var(--bg-hover)]">
                    <i class="fa-solid fa-ranking-star text-lg sm:text-xl"></i>
                    <span>${msg('home.header.leaderBoard')}</span>
                </div>
                <div class="nav-child nav-chat flex flex-col justify-center items-center transition-all hover:cursor-pointer hover:text-[var(--bg-hover)]" onClick="${() => navigate('/chat')}">
                    <i class="fa-solid fa-comments text-lg sm:text-xl"></i>
                    <span>${msg('home.header.chat')}</span>
                </div>
            </nav>
            <nav class="nav-btn sm:hidden hover:cursor-pointer hover:opacity-80">
                <i class="fa-solid fa-bars-staggered text-xl"></i>
            </nav>
        </div>
        <div class="flex items-center justify-end gap-3 sm:gap-4 w-1/2">
            <div class="md:flex-1">
                <form action="" id="search-bar-container" class="search-bar-container bg-[var(--main-color)] flex justify-center items-center gap-2 rounded-md md:p-2 md:bg-white z-50">
                    <input type="text" name="" id="search-bar" autocomplete="off" placeholder="${msg('home.header.search')}" class="w-full hidden md:block text-lg text-[var(--bg-hover)] rounded-md">
                    <label for="search-bar" class="fas fa-search text-[var(--bg-hover)] text-xl cursor-pointer max-md:text-white max-md:bg-[var(--main-color)]"></label>
                </form>
            </div>
            <div class="notification-bell relative">
                <i class="fa-solid fa-bell text-white text-2xl hover:cursor-pointer hover:text-[var(--bg-hover)]"></i>
                <span class="absolute -top-2 -right-2 rounded-full bg-red-600 text-white hover:cursor-pointer w-5 h-5 flex items-center justify-center text-sm">0</span>
            </div>
            <div class="notification hidden absolute overflow-y-auto top-full right-0 z-50 bg-white w-[300px] p-2 max-h-[300px] animate-fade-down animate-once animate-duration-300">

            </div>
            <select id="languages" name="languages_options" title="Select your language" class="text-xl bg-[var(--main-color)] text-white text-[2.5rem] focus:outline-none hover:opacity-80 hover:cursor-pointer">
                <option value="en" selected>en</option>
                <option value="fr">fr</option>
            </select>
            <div class="account relative flex gap-3 text-white">
                <div class="flex gap-3 hover:cursor-pointer hover:underline hover:text-[var(--bg-hover)]">
                    <div class="profile-section flex items-center justify-center gap-2">
                        <div class="flex items-center justify-center text-lg font-bold">
                            <p>Guest</p>
                        </div>
                        <div class="w-10 h-10 bg-slate-400 rounded-full bg-[url('./assets/guest.png')] bg-cover"><!-- Logo Here as background image --></div>
                    </div>
                    <ul class="account-list py-4 rounded-md shadow-md shadow-white right-0 text-nowrap absolute z-10 bottom-[-114px] bg-white text-[var(--bg-color)] hidden flex-col gap-1 animate-fade-down animate-once animate-duration-300">
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
            </div>
            </div>
    `;
    const account = container.querySelector(".account")!;
    const account_list = container.querySelector(".account-list")!;
    const notificationContainer = container.querySelector('.notification')!
    const notificationBell = container.querySelector('.notification-bell')!
    const searchBar = container.querySelector('#search-bar')!
    const searchIcon = container.querySelector('.fa-search')!
    const navbar = container.querySelector('.navbar')!
    const navBtn = container.querySelector('.nav-btn')!
    const navChildren = container.querySelectorAll('.nav-child')!
    const profileSection = container.querySelector('.profile-section')!
    const navChat = container.querySelector('.nav-chat')!
    const playPage = container.querySelector('.playPage')!
    
    navChat.addEventListener('click', () => {
        navigate('/chat');
    });

    playPage.addEventListener('click', () => {
        navigate('/play');
    });


    profileSection.addEventListener('click', () => {
        const profielPopUp = document.querySelector(".profile");
        const profile = Profile();
        profielPopUp?.appendChild(profile);    
    })

    // For testing purposes
    notificationContainer.appendChild(Notification({username: 'Test User', message: 'Hello World!'}))
    notificationContainer.appendChild(Notification({username: 'Test User', message: 'Hello World!'}))
    notificationContainer.appendChild(Notification({username: 'Test User', message: 'Hello World!'}))
    notificationContainer.appendChild(Notification({username: 'Test User', message: 'Hello World!'}))
    notificationContainer.appendChild(Notification({username: 'Test User', message: 'Hello World!'}))

    navBtn.addEventListener('click', () => {
        const navStyles = 'max-sm:animate-fade-down max-sm:animate-once max-sm:animate-duration-[600ms] max-sm:flex max-sm:z-50 max-sm:flex-col max-sm:absolute max-sm:top-full max-sm:left-0 max-sm:w-fit max-sm:gap-0'
        navStyles.split(' ').forEach(style => navbar.classList.toggle(style))
        navbar.classList.toggle('hidden')
        const childrenStyles = 'max-sm:flex-row max-sm:w-full max-sm:max-w-full max-sm:justify-start max-sm:gap-2 max-sm:bg-[var(--main-color)] max-sm:py-3 max-sm:px-5 max-sm:transition-all max-sm:hover:pl-7 max-sm:hover:pr-3'
        navChildren.forEach(nav => 
            childrenStyles.split(' ').forEach(style => nav.classList.toggle(style))
        )
    })

    searchIcon.addEventListener('click', () => {
        const styles = 'max-md:block max-md:absolute max-md:top-full max-md:left-0 max-md:p-2 max-md:h-fit'
        styles.split(' ').forEach(style  => searchBar.classList.toggle(style))
        searchBar.classList.toggle('hidden')
    })


    notificationBell.addEventListener('click', () => {
      notificationContainer.classList.toggle('hidden')
    })

    account.addEventListener("click", () => {
      account_list.classList.toggle("hidden");
      account_list.classList.toggle("flex");
    });

    document.addEventListener('click', (event:Event) => {
        const path = event.composedPath();
        if (notificationContainer
            && !path.includes(notificationContainer)
            && !path.includes(notificationBell)) {
          notificationContainer.classList.add('hidden');
        }

        if (account_list
            && !path.includes(account_list)
            && !path.includes(account)) {
            account_list.classList.add("hidden");
            account_list.classList.remove("flex");
        }

        if (navbar 
            && !path.includes(navbar)
            && !path.includes(navBtn)) {
            navbar.classList.add('hidden')
            const navStyles = 'max-sm:animate-fade-down max-sm:animate-once max-sm:animate-duration-[600ms] max-sm:flex max-sm:flex-col max-sm:absolute max-sm:top-full max-sm:left-0 max-sm:w-fit max-sm:gap-0'
            navStyles.split(' ').forEach(style => navbar.classList.remove(style))
            const childrenStyles = 'max-sm:flex-row max-sm:w-full max-sm:max-w-full max-sm:justify-start max-sm:gap-2 max-sm:bg-[var(--main-color)] max-sm:py-3 max-sm:px-5 max-sm:transition-all max-sm:hover:pl-7 max-sm:hover:pr-3'
            navChildren.forEach(nav => 
                childrenStyles.split(' ').forEach(style => nav.classList.remove(style))
            )
        }

        if (searchBar
            && !path.includes(searchBar)
            && !path.includes(searchIcon)) {
            const styles = 'max-md:block max-md:absolute max-md:top-full max-md:left-0 max-md:p-2 max-md:h-fit'
            styles.split(' ').forEach(style  => searchBar.classList.remove(style))
            searchBar.classList.add('hidden')
        }

    });

    return container;
});
// <div class="flex flex-col justify-center w-24 items-center hover:cursor-pointer hover:text-[var(--bg-hover)]">
// <i class="fa-solid fa-circle-info text-lg sm:text-xl"></i>
// <a href="#" class="">About Us</a>
// </div>