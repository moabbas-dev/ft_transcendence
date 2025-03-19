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
			<input type="text" id="friend-search" placeholder="${t('play.onlineGame.searchFriends')}" class="w-full py-3 px-4 pl-10 rounded-lg bg-[rgba(100,100,255,0.2)] border border-pongblue focus:outline-none focus:border-[rgba(100,100,255,0.8)]">
			<i class="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(255,255,255,0.6)]"></i>
		</div>
		<div id="search-results" class="w-full flex-1 overflow-y-auto max-h-96">
			<!-- Search results will be populated here -->
		</div>
	`
	const populateSearchResults = (users: { username: string; status: string; avatar: string;}[]) => {
		const searchResults = container.querySelector("#search-results");
		if (searchResults) {
			if (users.length === 0) {
				searchResults.innerHTML = `
					<div class="text-center py-6 text-[rgba(255,255,255,0.6)]">
						${t('play.onlineGame.noUsersSearch')}
					</div>
				`;
				return;
			}
			
			searchResults.innerHTML = users.map((user) => `
				<div class="flex items-center justify-between p-4 border-b border-[rgba(100,100,255,0.3)] hover:bg-[rgba(100,100,255,0.1)] cursor-pointer">
					<div class="flex items-center gap-4">
						<div class="size-12 rounded-full bg-pongblue relative">
							<img src="${user.avatar}" alt="${user.username}" class="rounded-full size-full">
							<div class="absolute bottom-0 right-0 size-3 rounded-full ${
								user.status === 'online' ? 'bg-green-500' : 
								user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
							} border border-pongdark"></div>
						</div>
						<div>
							<p class="font-semibold">${user.username}</p>
							<p class="text-sm text-[rgba(255,255,255,0.6)] capitalize">${user.status}</p>
						</div>
					</div>
					<button class="bg-gradient-to-r from-pongblue to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongblue px-4 py-2 rounded-full text-sm">
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
