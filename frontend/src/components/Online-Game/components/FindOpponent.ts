import { createComponent } from "../../../utils/StateManager.js";
import moabbas from '../../../assets/moabbas.jpg';
import afarachi from '../../../assets/afarachi.jpg';
import jfatfat from '../../../assets/jfatfat.jpg';
import odib from '../../../assets/omar.webp';
import { PongLoading } from "../../partials/PongLoading.js";

// Sample user data for search results [For testing purposes]
const sampleUsers = [
	{ username: "Ahmad Farachi - afarachi", status: "online", avatar: afarachi },
	{ username: "Jihad Fatfat - jfatfat", status: "offline", avatar: jfatfat },
	{ username: "Mohamad Abbass - moabbas", status: "in-game", avatar: moabbas },
	{ username: "Omar Dib - odib", status: "online", avatar: odib }
];

interface FindOpponentProps {
	heading: HTMLElement;
	isIconVisible: boolean;
	toggleInterval: NodeJS.Timeout;
}

export const FindOpponent = createComponent((props: FindOpponentProps) => {
	const container = document.createElement('div')
	container.className = 'w-full h-full flex flex-col items-center justify-center gap-8 py-8'
	container.innerHTML = `
	<div id="loading-online" class="max-[460px]:scale-75 md:scale-150"></div>
	<p class="text-xl text-[rgba(255,255,255,0.6)]">Searching for rivals...</p>
	<button id="cancel-search" class="py-2 px-6 bg-red-500 hover:bg-red-600 rounded-full">Cancel</button>
	`
	const loadingOnline = container.querySelector("#loading-online");
	loadingOnline?.appendChild(PongLoading({ text: 'Searching' }));

	const matchmakingTimeout = setTimeout(() => {
		const onlineUsers = sampleUsers.filter(user => user.status === 'online');
		const opponent = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
		
		if (opponent) {
			container.innerHTML = `
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
					</div>
				</div>
			`;
		}
		props.heading.textContent = 'Opponent Found!'
	}, 5000);

	container.querySelector("#cancel-search")!.addEventListener("click", () => {
		clearTimeout(matchmakingTimeout);
		// Reset UI
		props.heading.textContent = "Choose Your Mode";
		container.innerHTML = `
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
		const loadingPong = container.querySelector('#loading-pong');
		loadingPong!.appendChild(PongLoading({ text: 'OR' }));
		
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
	
	return container
})