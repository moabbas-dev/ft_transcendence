import store from "../../../store/store.js";
import { t } from "../../languages/LanguageController.js";
import { navigate } from "../../router.js";
import { createComponent } from "../../utils/StateManager.js";
import { Profile } from "../profile/UserProfile.js";

export const DropDown = createComponent(() => {
	const container = document.createElement("ul");
	container.className = `account-list ${store.userId? 'py-1' : 'py-2'} rounded-md shadow-md shadow-white ${localStorage.getItem('selectedLanguage') === 'ar'? 'left-0' : 'right-0'} text-nowrap absolute z-[9999] top-[48px] sm:top-[54px] bg-white text-pongdark hidden flex-col animate-fade-down animate-once animate-duration-300`
	container.innerHTML = `
		${!store.userId? `
			<li id="register" class="px-4 py-2 hover:text-pongcyan hover:cursor-pointer hover:bg-slate-100">
				${t("home.register")}
			</li>
		` : `
			<li id="view-profile" class="px-4 py-0.5 hover:text-pongcyan hover:cursor-pointer hover:bg-slate-100">
				 ${t("viewProfile")}
			</li>
			<li id="logout" class="font-bold px-4 py-0.5 hover:text-pongcyan hover:cursor-pointer hover:bg-slate-100">
				${t("logout")}
			</li>
		`}
	`
	const register = container.querySelector('#register');
	register?.addEventListener('click', () => {
		navigate('/register')
	})

	const viewProfile = container.querySelector('#view-profile');
	viewProfile?.addEventListener('click', () => {
		const profielPopUp = document.querySelector(".profile");
        const profile = Profile({uName: store.nickname});
        profielPopUp?.appendChild(profile);
	})

	const logout = container.querySelector('#logout');
	logout?.addEventListener('click', async() => {
		// handle logout here
		store.logout();
	})
	return container;
})