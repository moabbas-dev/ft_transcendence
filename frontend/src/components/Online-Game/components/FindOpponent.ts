import { createComponent } from "../../../utils/StateManager.js";
import { PongLoading } from "../../partials/PongLoading.js";
import { t } from "../../../languages/LanguageController.js";
import { navigate } from "../../../router.js";

interface FindOpponentProps {
	heading: HTMLElement;
	isIconVisible: boolean;
	toggleInterval: NodeJS.Timeout;
	client?: any; // WebSocket client
}

export const FindOpponent = createComponent((props: FindOpponentProps) => {
	const container = document.createElement('div');
	container.className = 'w-full h-full flex flex-col items-center justify-center gap-8 py-8';
	container.innerHTML = `
	<div id="loading-online" class="max-[460px]:scale-75 md:scale-150"></div>
	<p class="text-xl text-pongcyan drop-shadow-[0_0_5px_#00f7ff]">${t('play.onlineGame.searchingForRivals')}</p>
	<button id="cancel-search" class="py-3 px-8 bg-black border-2 border-pongpink text-pongpink hover:text-white hover:bg-black/80 hover:shadow-[0_0_15px_rgba(255,0,228,0.6)] rounded-full transition-all duration-300 drop-shadow-[0_0_5px_#ff00e4] transform hover:scale-105">${t('play.onlineGame.cancel')}</button>
	`;
	
	const loadingOnline = container.querySelector("#loading-online");
	loadingOnline?.appendChild(PongLoading({ text: t('play.onlineGame.searching')}));

	// Handle opponent found
	const showOpponentFound = (opponent: any) => {
		container.innerHTML = `
			<div class="w-full h-full flex flex-col items-center justify-center gap-6 py-8">
				<div class="text-center">
					<p class="text-2xl mb-4 text-pongcyan font-bold drop-shadow-[0_0_10px_#00f7ff]">${t('play.onlineGame.oponentFound')}</p>
					<div class="flex items-center justify-center gap-4 mb-6 bg-black/40 p-6 border-2 border-pongcyan rounded-xl shadow-[0_0_15px_rgba(0,247,255,0.4)] animate-fade-up animate-once animate-duration-500">
						<div class="size-16 rounded-full bg-pongcyan relative group transform transition-all duration-300 hover:scale-110">
							<img src="/api/placeholder/64/64" alt="${opponent.id}" class="rounded-full size-full border-2 border-pongcyan shadow-[0_0_10px_rgba(0,247,255,0.5)]">
							<div class="absolute bottom-0 right-0 size-4 rounded-full bg-green-500 border-2 border-pongdark shadow-[0_0_5px_rgba(0,255,0,0.5)]"></div>
						</div>
						<div>
							<p class="font-semibold text-xl text-white">Player #${opponent.id}</p>
							<p class="text-sm text-pongcyan drop-shadow-[0_0_5px_#00f7ff]">ELO: ${opponent.elo || 1000}</p>
						</div>
					</div>
					<div class="countdown-text text-xl text-pongpink font-semibold drop-shadow-[0_0_5px_#ff00e4]">
						${t('play.onlineGame.gameStartsIn')} <span id="countdown">3</span>
					</div>
				</div>
			</div>
		`;
		
		props.heading.textContent = t('play.onlineGame.oponentFound');
		
		// Countdown timer
		let countdown = 3;
		const countdownElement = container.querySelector("#countdown");
		const countdownInterval = setInterval(() => {
			countdown--;
			if (countdownElement) {
				countdownElement.textContent = countdown.toString();
			}
			
			if (countdown <= 0) {
				clearInterval(countdownInterval);
				// Game starts automatically from the WebSocket handler
			}
		}, 1000);
	};

	// Set up WebSocket event handlers if client is provided
	if (props.client) {
		props.client.on('match_found', (data: any) => {
			console.log('Match found:', data);
			showOpponentFound(data.opponent);
		});
		
		props.client.on('game_start', (data: any) => {
			// Redirect to the game page or start the game
			navigate(`/play/online-match/${data.matchId}`);
		});
		
		props.client.on('waiting_for_match', (data: any) => {
			const queuePosition = data.position;
			const positionText = container.querySelector("p.text-xl");
			if (positionText) {
				positionText.textContent = `${t('play.onlineGame.queuePosition')}: ${queuePosition}`;
			}
		});
		
		// Start matchmaking
		props.client.findMatch();
	}

	// Cancel button event handler
	container.querySelector("#cancel-search")?.addEventListener("click", () => {
		if (props.client) {
			props.client.cancelMatchmaking();
		}
		
		// Reset UI
		props.heading.textContent = t('play.title');
		container.innerHTML = `
			<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
				<i id="icon-friends" class="fa-solid fa-users max-[460px]:text-[3rem] text-[5rem] md:text-[10rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-r from-pongcyan via-[rgba(100,100,255,0.8)] to-pongcyan text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f7ff]"></i>
				<span id="text-friends" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0 text-pongpink drop-shadow-[0_0_10px_#ff00e4]">${t('play.onlineGame.vsFriend')}</span>
			</div>
			<div id="loading-pong" class="max-[460px]:scale-75 md:scale-150"></div>
			<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
				<i id="icon-online" class="fa-solid fa-globe max-[460px]:text-[3rem] text-[5rem] md:text-[10rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-b from-pongcyan via-[rgba(100,100,255,0.8)] to-pongcyan text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f7ff]"></i>
				<span id="text-online" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0 text-pongpink drop-shadow-[0_0_10px_#ff00e4]">${t('play.onlineGame.vsRivals')}</span>
			</div>
		`;

		// Reinitialize loading animation and toggle
		const loadingPong = container.querySelector('#loading-pong');
		loadingPong?.appendChild(PongLoading({ text: t('play.onlineGame.or')}));
		
		props.isIconVisible = true;
		props.toggleInterval = setInterval(() => {
			props.isIconVisible = !props.isIconVisible;
			container.querySelector("#icon-friends")?.classList.toggle("opacity-0", !props.isIconVisible);
			container.querySelector("#icon-friends")?.classList.toggle("opacity-100");
			container.querySelector("#text-friends")?.classList.toggle("opacity-0", props.isIconVisible);
			container.querySelector("#icon-online")?.classList.toggle("opacity-0", !props.isIconVisible);
			container.querySelector("#icon-online")?.classList.toggle("opacity-100");
			container.querySelector("#text-online")?.classList.toggle("opacity-0", props.isIconVisible);
		}, 3000);
	});
	
	return container;
});