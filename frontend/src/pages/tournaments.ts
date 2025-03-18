import { Header } from "../components/header_footer/header.js";
import { PongLoading } from "../components/partials/PongLoading.js";
import { FetchFriendsList } from "../components/Online-Game/components/FriendsList.js";
import { FindOpponent } from "../components/Online-Game/components/FindOpponent.js";
import { navigate } from "../router.js";

export default {
	render: (container: HTMLElement) => {
		container.className = "flex flex-col h-dvh bg-pongdark";
		container.innerHTML = `
			<div class="profile"></div>
			<div class="header bg-pongblue w-full h-fit"></div>
			<div id="content" class="flex max-sm:flex-col max-sm:items-center max-sm:justify-around max-sm:py-4 flex-1 container mx-auto px-2 w-full text-white overflow-x-hidden sm:overflow-hidden">
				<div class="flex flex-col items-center justify-center gap-5 sm:gap-10 w-full sm:w-1/2 bg-pongdark">
					<h1 class="text-5xl font-semibold w-full text-center">Choose Your Mode</h1>
					<div class="flex flex-col gap-4">
						<button id="join-tournament" class="py-4 px-10 sm:px-20 text-xl bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue hover:animate-pulse rounded-full">Join to a tournament</button>
						<button id="create-tournament" class="py-4 px-10 sm:px-20 text-xl bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue hover:animate-pulse rounded-full">Create a tournament</button>
					</div>
				</div>
				<div id="game-mode-details" class="flex flex-col items-center justify-around max-sm:w-full w-1/2 bg-pongdark">
						<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
							<i id="icon-join" class="fa-solid fa-door-open max-[460px]:text-[3rem] text-[5rem] md:text-[8rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-r from-pongblue via-[rgba(100,100,255,0.8)] to-pongblue text-transparent bg-clip-text"></i>
							<span id="text-join" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0">Enter the arena</span>
						</div>
						<div id="loading-pong" class="max-[460px]:scale-75 md:scale-150"></div>
						<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
							<i id="icon-create" class="bx bx-sitemap max-[460px]:text-[3rem] text-[5rem] md:text-[10rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-b from-pongblue via-[rgba(100,100,255,0.8)] to-pongblue text-transparent bg-clip-text"></i>
							<span id="text-create" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0 ">Launch the battle</span>
						</div>
				</div>
			</div>
		`;

		// Header
		const headerNav = container.querySelector(".header");
		const header = Header();
		headerNav?.appendChild(header);

		// Loading pong animation
		const loadingPong = container.querySelector('#loading-pong');
		loadingPong?.appendChild(PongLoading({text: 'OR'}));

		let isIconVisible = true;
		let toggleInterval = setInterval(() => {
			isIconVisible = !isIconVisible;
	
			// Toggle Friends animation
			document.getElementById("icon-join")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-join")?.classList.toggle("opacity-100");
			document.getElementById("text-join")?.classList.toggle("opacity-0", isIconVisible);

			// Toggle Online animation
			document.getElementById("icon-create")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-create")?.classList.toggle("opacity-100");
			document.getElementById("text-create")?.classList.toggle("opacity-0", isIconVisible);
		}, 3000);

		const heading = container.querySelector("h1")!;

		const createTournamentBtn = container.querySelector('#create-tournament')
		createTournamentBtn?.addEventListener('click', () => {
			navigate('/tournaments/create')
		})

		// Play with Friend functionality
		const playWithFriendBtn = document.getElementById("join-tournament");
		playWithFriendBtn?.addEventListener("click", () => {
			clearInterval(toggleInterval);

			const gameModeDetails = document.getElementById("game-mode-details");
			if (gameModeDetails) {
				heading.textContent = "Finding a tournament...";

				gameModeDetails.innerHTML = ''
				gameModeDetails.appendChild(FetchFriendsList())
			}
		});

		// Online Showdown functionality
		const onlineShowdownBtn = document.getElementById("online-showdown");
		onlineShowdownBtn?.addEventListener("click", () => {
			clearInterval(toggleInterval);

			const gameModeDetails = document.getElementById("game-mode-details");
			if (gameModeDetails) {
				heading.textContent = "Finding an Opponent...";

				gameModeDetails.innerHTML = ''
				gameModeDetails.appendChild(FindOpponent({heading, isIconVisible, toggleInterval}))
				isIconVisible = !isIconVisible
			}
		});

	}
}