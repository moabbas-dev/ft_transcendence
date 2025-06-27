import HomePage from "./pages/home.js";
import RegisterPage from "./pages/register.js";
import PlayPage from "./pages/play.js";
import LocalPongPage from "./pages/localMultiplayer.js";
import NotFound from "./pages/notfound.js";
import ChatPage from "./pages/chat.js";
import LeaderBoardPage from "./pages/leaderBoard.js"
import AboutPage from "./pages/about.js";
import { Page } from "./types/types.js";
import PlayVsAI from "./pages/PlayVsAI.js"
import { initializeLanguage } from "./languages/LanguageController.js";
import TournamentPage from "./components/Tournament-Game/TournamentPage.js";
import OnlineGame from './pages/online-game.js';
import CreateTournamentPage from './pages/create-tournament.js';
import AccountVerifiedPage from './pages/account-verified.js';
import store from "../store/store.js";
import TournamentDetailPage from "./components/Tournament-Game/TournamentDetailPage.js"
import TournamentMatchPage from "./components/Tournament-Game/tournament-match.js";

const routes: { [key: string]: Page } = {
  "/": HomePage,
  "/register": RegisterPage,
  "/register/twofactor": RegisterPage,
  "/reset_password/:uuid": RegisterPage,
  "/play": PlayPage,
  "/play/local-ai": PlayVsAI,
  "/play/local-multi": LocalPongPage,
  "/play/online-game": OnlineGame,
  "/play/tournaments": TournamentPage,
  "/tournaments/create": CreateTournamentPage,
  "/tournaments/:tournamentId": TournamentDetailPage,
  "/tournaments/:tournamentId/match/:matchId": TournamentMatchPage,
  "/chat": ChatPage,
  "/chat/:uName": ChatPage,
  "/leader-board": LeaderBoardPage,
  "/about-us": AboutPage,
  "/account-verified": AccountVerifiedPage,
  "404": NotFound,
};

let navigationState: any = null;

export async function refreshRouter() {
	const app = document.getElementById("app")!;
	app.className = "h-dvh bg-gradient-to-br from-pongdark to-ponghover flex items-center justify-center";
	app.innerHTML = `
	  <div class="w-16 h-16 border-4 border-gray-600 border-t-pongcyan rounded-full animate-spin"></div>
	`;

	await store.initialize();
	localStorage.setItem("isLoggedIn", store.isLoggedIn ? "true" : "false");
	console.log('Router: Store initialized, isLoggedIn:', store.isLoggedIn);

	initializeLanguage();
	const path = window.location.pathname;
	let page: Page | null = null;
	let params: { [key: string]: string } = {};

	const restrictedForAuthUsers = [
		"/register",
		"/register/twofactor",
		"/reset_password/:uuid",
		"/account-verified",
	];

	function matchesRestrictedPattern(currentPath: string): boolean {
		return restrictedForAuthUsers.some(route => {
			const regex = new RegExp("^" + route.replace(/:\w+/g, "([^/]+)") + "$");
			return regex.test(currentPath);
		});
	}

	if (store.isLoggedIn && matchesRestrictedPattern(path)) {
		page = NotFound;
	}
	else if (!store.isLoggedIn && !matchesRestrictedPattern(path) && path !== "/" && path !== "/play/local-multi" && path !== "/play/local-ai") {
		page = NotFound;
	}
	else {
		for (const route in routes) {
			const regex = new RegExp("^" + route.replace(/:\w+/g, "([^/]+)") + "$");
			const match = path.match(regex);

			if (match) {
				page = routes[route];
				const keys = (route.match(/:(\w+)/g) || []).map((key) => key.substring(1));

				keys.forEach((key, index) => {
					params[key] = match[index + 1];
				});

				break;
			}
		}
	}

	if (!page) {
		page = NotFound;
	}

	const appContainer = document.getElementById("app")!;
	appContainer.className = "";
	appContainer.innerHTML = "";

	page.render(appContainer, params, navigationState);
	
	navigationState = null;
}

export function navigate(path: string, options?: { state?: any }) {
	if (options?.state) {
		navigationState = options.state;
	}
	
	window.history.pushState({}, "", path);
	refreshRouter();
}

window.addEventListener("popstate", refreshRouter);
document.addEventListener("DOMContentLoaded", refreshRouter);