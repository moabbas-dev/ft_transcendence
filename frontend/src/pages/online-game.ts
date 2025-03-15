import { Header } from "../components/header_footer/header.js";
import { PongLoading } from "../components/partials/PongLoading.js";
import moabbas from '../assets/moabbas.jpg';
import afarachi from '../assets/afarachi.jpg';
import jfatfat from '../assets/jfatfat.jpg';
import odib from '../assets/omar.webp';
import { FetchFriendsList } from "../components/Online-Game/components/FriendsList.js";

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
						<button id="play-with-friend" class="py-4 px-10 sm:px-20 text-xl bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue hover:animate-pulse rounded-full">Play with a Friend</button>
						<button id="online-showdown" class="py-4 px-10 sm:px-20 text-xl bg-gradient-to-br from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue hover:animate-pulse rounded-full">Online Showdown</button>
					</div>
				</div>
				<div id="game-mode-details" class="flex flex-col items-center justify-around max-sm:w-full w-1/2 bg-pongdark">
						<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
							<i id="icon-friends" class="fa-solid fa-users max-[460px]:text-[3rem] text-[5rem] md:text-[10rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-r from-pongblue via-[rgba(100,100,255,0.8)] to-pongblue text-transparent bg-clip-text"></i>
							<span id="text-friends" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0">Vs Friends</span>
						</div>
						<div id="loading-pong" class="max-[460px]:scale-75 md:scale-150"></div>
						<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
							<i id="icon-online" class="fa-solid fa-globe max-[460px]:text-[3rem] text-[5rem] md:text-[10rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-b from-pongblue via-[rgba(100,100,255,0.8)] to-pongblue text-transparent bg-clip-text"></i>
							<span id="text-online" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0 ">Vs Rivals</span>
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
			document.getElementById("icon-friends")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-friends")?.classList.toggle("opacity-100");
			document.getElementById("text-friends")?.classList.toggle("opacity-0", isIconVisible);

			// Toggle Online animation
			document.getElementById("icon-online")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-online")?.classList.toggle("opacity-100");
			document.getElementById("text-online")?.classList.toggle("opacity-0", isIconVisible);
		}, 3000);

		// Sample user data for search results
		const sampleUsers = [
			{ username: "Ahmad Farachi - afarachi", status: "online", avatar: afarachi },
			{ username: "Jihad Fatfat - jfatfat", status: "offline", avatar: jfatfat },
			{ username: "Mohamad Abbass - moabbas", status: "online", avatar: moabbas },
			{ username: "Omar Dib - odib", status: "away", avatar: odib }
		];

		// Play with Friend functionality
		const playWithFriendBtn = document.getElementById("play-with-friend");
		playWithFriendBtn?.addEventListener("click", () => {
			clearInterval(toggleInterval);

			const gameModeDetails = document.getElementById("game-mode-details");
			if (gameModeDetails) {
				const heading = document.querySelector("h1");
				if (heading) {
					heading.textContent = "Find a Friend";
				}

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
				const heading = document.querySelector("h1");
				if (heading) {
					heading.textContent = "Finding an Opponent...";
				}

				gameModeDetails.innerHTML = `
					<div class="w-full h-full flex flex-col items-center justify-center gap-8 py-8">
						<div id="loading-online" class="max-[460px]:scale-75 md:scale-150"></div>
						<p class="text-xl text-[rgba(255,255,255,0.6)]">Searching for rivals...</p>
						<button id="cancel-search" class="py-2 px-6 bg-red-500 hover:bg-red-600 rounded-full">Cancel</button>
					</div>
				`;

				// Add loading animation
				const loadingOnline = document.getElementById("loading-online");
				loadingOnline?.appendChild(PongLoading({ text: 'Searching' }));

				// Simulate matchmaking
				const matchmakingTimeout = setTimeout(() => {
					const onlineUsers = sampleUsers.filter(user => user.status === 'online');
					const opponent = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
					
					if (opponent) {
						gameModeDetails.innerHTML = `
							<div class="w-full h-full flex flex-col items-center justify-center gap-6 py-8">
								<div class="text-center">
									<p class="text-2xl mb-4">Opponent Found!</p>
									<div class="flex items-center justify-center gap-4 mb-6">
										<div class="size-16 rounded-full bg-pongblue relative">
											<img src="${opponent.avatar}" alt="${opponent.username}" class="rounded-full size-full">
											<div class="absolute bottom-0 right-0 size-4 rounded-full bg-green-500 border-2 border-pongdark"></div>
										</div>
										<div>
											<p class="font-semibold text-xl">${opponent.username}</p>
											<p class="text-sm text-[rgba(255,255,255,0.6)]">Online</p>
										</div>
									</div>
									<button id="start-match" class="py-3 px-8 bg-green-500 hover:bg-green-600 rounded-full text-lg">Start Match</button>
								</div>
							</div>
						`;

						document.getElementById("start-match")?.addEventListener("click", () => {
							// Add actual match start logic here
							console.log("Starting match with", opponent.username);
						});
					}
				}, 5000);

				// Handle cancel search
				document.getElementById("cancel-search")?.addEventListener("click", () => {
					clearTimeout(matchmakingTimeout);
					
					// Reset UI
					if (heading) heading.textContent = "Choose Your Mode";
					gameModeDetails.innerHTML = `
						<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
							<i id="icon-friends" class="fa-solid fa-users max-[460px]:text-[3rem] text-[5rem] md:text-[10rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-r from-pongblue via-[rgba(100,100,255,0.8)] to-pongblue text-transparent bg-clip-text"></i>
							<span id="text-friends" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0">Vs Friends</span>
						</div>
						<div id="loading-pong" class="max-[460px]:scale-75 md:scale-150"></div>
						<div class="relative w-full h-[4rem] sm:h-[8rem] flex items-center justify-center">
							<i id="icon-online" class="fa-solid fa-globe max-[460px]:text-[3rem] text-[5rem] md:text-[10rem] absolute transition-opacity duration-500 opacity-100 bg-gradient-to-b from-pongblue via-[rgba(100,100,255,0.8)] to-pongblue text-transparent bg-clip-text"></i>
							<span id="text-online" class="text-[2rem] sm:text-[3rem] md:text-[5rem] text-center font-bold absolute transition-opacity duration-500 opacity-0 ">Vs Rivals</span>
						</div>
					`;

					// Reinitialize loading animation and toggle
					const loadingPong = document.getElementById('loading-pong');
					loadingPong?.appendChild(PongLoading({ text: 'OR' }));
					
					isIconVisible = true;
					toggleInterval = setInterval(() => {
						isIconVisible = !isIconVisible;
						document.getElementById("icon-friends")?.classList.toggle("opacity-0", !isIconVisible);
						document.getElementById("icon-friends")?.classList.toggle("opacity-100");
						document.getElementById("text-friends")?.classList.toggle("opacity-0", isIconVisible);
						document.getElementById("icon-online")?.classList.toggle("opacity-0", !isIconVisible);
						document.getElementById("icon-online")?.classList.toggle("opacity-100");
						document.getElementById("text-online")?.classList.toggle("opacity-0", isIconVisible);
					}, 3000);
				});
			}
		});

	}
}