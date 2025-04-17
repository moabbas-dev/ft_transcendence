import { createComponent } from "../../../utils/StateManager.js";
import moabbas from '../../../assets/moabbas.jpg';
import afarachi from '../../../assets/afarachi.jpg';
import jfatfat from '../../../assets/jfatfat.jpg';
import odib from '../../../assets/omar.webp';
import { t } from "../../../languages/LanguageController.js";

// Sample user data for search results [For testing purposes]
const sampleUsers = [
	{ username: "Ahmad Farachi - afarachi", status: "online", avatar: afarachi },
	{ username: "Jihad Fatfat - jfatfat", status: "offline", avatar: jfatfat },
	{ username: "Mohamad Abbass - moabbas", status: "online", avatar: moabbas },
	{ username: "Omar Dib - odib", status: "away", avatar: odib }
];


export const FetchFriendsList = createComponent(() => {
	const container = document.createElement('div')
	container.className = 'size-full flex flex-col items-center justify-start gap-6 py-8'
	container.innerHTML = `
		<div class="relative w-full">
			<input type="text" id="friend-search" placeholder="${t('play.onlineGame.searchFriends')}" class="w-full py-3 px-4 pl-10 rounded-lg bg-black/60 border-2 border-pongcyan text-white focus:outline-none focus:border-pongpink focus:shadow-[0_0_15px_rgba(0,247,255,0.6)] transition-all duration-300 placeholder-pongcyan/50">
			<i class="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-pongcyan drop-shadow-[0_0_5px_#00f7ff]"></i>
		</div>
		<div id="search-results" class="w-full flex-1 overflow-y-auto max-h-96 rounded-lg border-2 border-pongcyan shadow-[0_0_15px_rgba(0,247,255,0.3)]">
			<!-- Search results will be populated here -->
		</div>
	`
	const populateSearchResults = (users: { username: string; status: string; avatar: string;}[]) => {
		const searchResults = container.querySelector("#search-results");
		if (searchResults) {
			if (users.length === 0) {
				searchResults.innerHTML = `
					<div class="text-center py-6 text-pongcyan drop-shadow-[0_0_5px_#00f7ff] bg-black/60">
						${t('play.onlineGame.noUsersSearch')}
					</div>
				`;
				return;
			}
			
			searchResults.innerHTML = users.map((user, index) => `
				<div class="flex items-center justify-between p-4 ${index !== users.length - 1 ? 'border-b border-pongcyan/30' : ''} hover:bg-pongcyan/5 cursor-pointer transition-all duration-300 animate-fade-down animate-duration-300 animate-delay-${index * 100}">
					<div class="flex items-center gap-4">
						<div class="size-12 rounded-full bg-black relative group transform transition-all duration-300 hover:scale-110">
							<img src="${user.avatar}" alt="${user.username}" class="rounded-full size-full border-2 border-pongcyan shadow-[0_0_10px_rgba(0,247,255,0.5)]">
							<div class="absolute bottom-0 right-0 size-3 rounded-full ${
								user.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_rgba(0,255,0,0.5)]' : 
								user.status === 'away' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(255,255,0,0.5)]' : 'bg-gray-500'
							} border border-pongdark"></div>
						</div>
						<div>
							<p class="font-semibold text-white">${user.username}</p>
							<p class="text-sm ${
                user.status === 'online' ? 'text-pongcyan drop-shadow-[0_0_5px_#00f7ff]' : 
                user.status === 'away' ? 'text-yellow-400 drop-shadow-[0_0_5px_#ffff00]' : 'text-gray-400'
              } capitalize">${user.status}</p>
						</div>
					</div>
					<button class="bg-black border-2 border-pongpink hover:shadow-[0_0_15px_rgba(255,0,228,0.6)] text-pongpink hover:text-white px-4 py-2 rounded-full text-sm transition-all duration-300 transform hover:scale-105">
						Invite
					</button>
				</div>
			`).join('');
		}
	}

	// HERE: instead of this we should fetch the friend list data from the backend
	populateSearchResults(sampleUsers)

	const searchInput = container.querySelector("#friend-search");
	searchInput?.addEventListener("input", (e:Event) => {
		const target = e.target as HTMLInputElement;
		const query = target.value.toLowerCase();
		const filteredUsers = sampleUsers.filter(user => 
			user.username.toLowerCase().includes(query)
		);
		populateSearchResults(filteredUsers);
	});

	return container
})