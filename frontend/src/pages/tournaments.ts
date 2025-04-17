import { Header } from "../components/header_footer/header.js";
import { PongLoading } from "../components/partials/PongLoading.js";
import { FetchFriendsList } from "../components/Online-Game/components/FriendsList.js";
import { navigate } from "../router.js";
import { t } from "../languages/LanguageController.js";
import { Footer } from "../components/header_footer/footer.js";

export default {
	render: (container: HTMLElement) => {
		container.className = "flex flex-col h-dvh";
		container.innerHTML = `
			<div class="header z-50"></div>
			
			<div class="content flex-1 relative overflow-hidden bg-black">
				<!-- Neon glow effects -->
				<div class="absolute inset-0 bg-gradient-to-br from-transparent via-pongpink/5 to-transparent opacity-20 z-5 pointer-events-none"></div>
				
				<div id="content" class="flex max-sm:flex-col max-sm:items-center max-sm:justify-around max-sm:py-4 flex-1 container mx-auto px-4 w-full text-white z-10 relative">
					<div class="flex flex-col items-center justify-center gap-5 sm:gap-10 w-full sm:w-1/2 py-8">
						<h1 class="text-4xl md:text-5xl font-bold text-center text-pongpink drop-shadow-[0_0_15px_#ff00e4] animate-fade-down animate-once animate-duration-700">
							${t('play.title')}
						</h1>
						<div class="flex flex-col gap-6 w-full max-w-md">
							<button id="join-tournament" class="play-btn p-4 border-2 border-pongcyan rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,247,255,0.4)] hover:shadow-[0_0_25px_rgba(0,247,255,0.6)] animate-fade-right animate-once animate-duration-700">
								<span class="group-hover:scale-110 text-2xl transition-transform duration-300 ease-in-out text-pongcyan drop-shadow-[0_0_10px_#00f7ff]">
									<i class="fa-solid fa-door-open"></i>
								</span>
								<div class="flex flex-col gap-1">
									<h2 class="text-xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#00f7ff]">${t('play.tournaments.joinBtn')}</h2>
									<p class="text-sm opacity-90">${t('play.tournaments.join')}</p>
								</div>
							</button>
							
							<button id="create-tournament" class="play-btn p-4 border-2 border-pongpink rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,0,228,0.4)] hover:shadow-[0_0_25px_rgba(255,0,228,0.6)] animate-fade-left animate-once animate-duration-700 animate-delay-100">
								<span class="group-hover:scale-110 text-2xl transition-transform duration-300 ease-in-out text-pongpink drop-shadow-[0_0_10px_#ff00e4]">
									<i class="bx bx-sitemap"></i>
								</span>
								<div class="flex flex-col gap-1">
									<h2 class="text-xl font-bold text-pongpink drop-shadow-[0_0_5px_#ff00e4] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#ff00e4]">${t('play.tournaments.createBtn')}</h2>
									<p class="text-sm opacity-90">${t('play.tournaments.create')}</p>
								</div>
							</button>
						</div>
					</div>
					
					<div id="game-mode-details" class="flex flex-col items-center justify-center gap-10 w-full sm:w-1/2 py-8">
						<div class="relative w-full flex items-center justify-center">
							<div class="animation-container relative w-full max-w-md aspect-square">
								<i id="icon-join" class="fa-solid fa-door-open text-7xl md:text-8xl absolute top-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-100 bg-gradient-to-r from-pongcyan via-[rgba(100,100,255,0.8)] to-pongcyan text-transparent bg-clip-text"></i>
								<span id="text-join" class="text-3xl md:text-4xl text-center font-bold absolute top-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-0">${t('play.tournaments.join')}</span>
								
								<div id="loading-pong" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-125"></div>
								
								<i id="icon-create" class="bx bx-sitemap text-7xl md:text-8xl absolute bottom-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-100 bg-gradient-to-b from-pongpink via-[rgba(255,0,228,0.8)] to-pongpink text-transparent bg-clip-text"></i>
								<span id="text-create" class="text-3xl md:text-4xl text-center font-bold absolute bottom-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-0">${t('play.tournaments.create')}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="footer"></div>
		`;

		// Header
		const headerNav = container.querySelector(".header");
		const header = Header();
		headerNav?.appendChild(header);

		// Footer component
		const footerContainer = container.querySelector(".footer");
		const footerComp = Footer();
		footerContainer?.appendChild(footerComp);

		// Loading pong animation
		const loadingPong = container.querySelector('#loading-pong');
		loadingPong?.appendChild(PongLoading({text: t('play.onlineGame.or')}));

		let isIconVisible = true;
		let toggleInterval = setInterval(() => {
			isIconVisible = !isIconVisible;
	
			// Toggle Join animation
			document.getElementById("icon-join")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-join")?.classList.toggle("opacity-100");
			document.getElementById("text-join")?.classList.toggle("opacity-0", isIconVisible);

			// Toggle Create animation
			document.getElementById("icon-create")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-create")?.classList.toggle("opacity-100");
			document.getElementById("text-create")?.classList.toggle("opacity-0", isIconVisible);
		}, 3000);

		const heading = container.querySelector("h1")!;

		// Create Tournament button
		const createTournamentBtn = container.querySelector('#create-tournament');
		createTournamentBtn?.addEventListener('click', () => {
			navigate('/tournaments/create');
		});

		// Join Tournament functionality
		const joinTournamentBtn = document.getElementById("join-tournament");
		joinTournamentBtn?.addEventListener("click", () => {
			clearInterval(toggleInterval);

			const gameModeDetails = document.getElementById("game-mode-details");
			if (gameModeDetails) {
				heading.textContent = "Finding a tournament...";
				heading.className = "text-4xl md:text-5xl font-bold text-center text-pongcyan drop-shadow-[0_0_15px_#00f7ff]";

				gameModeDetails.innerHTML = '';
				gameModeDetails.appendChild(FetchFriendsList());
			}
		});
	}
}