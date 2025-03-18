import { createComponent } from "../../utils/StateManager.js";
import moabbas from '../../assets/moabbas.jpg';
import afarachi from '../../assets/afarachi.jpg';
import jfatfat from '../../assets/jfatfat.jpg';
import odib from '../../assets/omar.webp';

// Sample user data for search results [For testing purposes]
const sampleUsers = [
	{ username: "Ahmad Farachi - afarachi", status: "online", avatar: afarachi, rank: "Gold" },
	{ username: "Jihad Fatfat - jfatfat", status: "offline", avatar: jfatfat, rank: "Silver" },
	{ username: "Mohamad Abbass - moabbas", status: "in-game", avatar: moabbas, rank: "Bronze" },
	{ username: "Omar Dib - odib", status: "online", avatar: odib, rank: "4" }
];

export const WaitingRoom = createComponent(() => {
	const container = document.createElement('div')
	container.className = "flex flex-col gap-6"
	container.innerHTML = `
	<div class="text-2xl font-semibold">Waiting Room</div>
		<div class="flex flex-col gap-4 bg-[rgba(100,100,255,0.1)] rounded-lg p-4">
			<div class="flex justify-between items-center">
				<div class="sm:text-lg font-medium">Current Players</div>
				<div class="text-sm text-gray-300">Tournament starts when <span class="player-max-display">4</span> players join</div>
			</div>
			<div id="waiting-players" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
				<!-- Player slots will be dynamically generated -->
			</div>

			<div class="flex justify-between">
				<button id="leave-tournament" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">Leave Tournament</button>
		</div>
	</div>
	`
	return container;
})

// Function to render waiting room slots based on player count
export function renderWaitingRoomSlots(container: HTMLElement, playerCount: number) {
	const waitingPlayersContainer = container.querySelector('#waiting-players');
	const playerMaxDisplay = container.querySelectorAll('.player-max-display');
	
	if (waitingPlayersContainer) {
		waitingPlayersContainer.innerHTML = '';

		// Update player max display everywhere
		playerMaxDisplay.forEach(el => {
			el.textContent = playerCount.toString();
		});

		// Generate slots for all players
		for (let i = 0; i < playerCount; i++) {
			const playerData = i < sampleUsers.length ? sampleUsers[i] : null;

			if (playerData) {
				// Render occupied slot
				waitingPlayersContainer.innerHTML += `
					<div class="bg-[rgba(100,100,255,0.2)] p-4 rounded-lg flex items-center justify-between">
						<div class="flex items-center">
							<div class="size-10 rounded-full bg-pongblue mr-3">
								<img src="${playerData.avatar}" alt="avatar" class="size-full rounded-full object-cover" />
							</div>
							<div>
								<div class="font-medium">${playerData.username}</div>
								<div class="text-sm text-gray-300">Rank: ${playerData.rank}</div>
							</div>
						</div>
						<button class="bg-red-600 px-2 py-1 rounded text-sm hover:opacity-80 transition-all">remove</button>
					</div>
				`;
			} else {
				// Render empty slot
				waitingPlayersContainer.innerHTML += `
					<div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
						<div class="text-[rgba(255,255,255,0.5)]">Waiting for player...</div>
					</div>
				`;
			}
		}
	}
}
