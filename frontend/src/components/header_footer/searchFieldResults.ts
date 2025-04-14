import { t } from "../../languages/LanguageController";
import { Profile } from "../profile/UserProfile";
import defaultAvatar from "../../assets/guests.png";

export function displayResults(users: {nickname:string, status:string, avatar_url:string}[], container: HTMLElement): void {
	container.innerHTML = '';

	if (users.length === 0) {
		container.innerHTML = `<div class="p-4 text-ponghover">${t('home.header.noUsersFound')}</div>`;
		return;
	}

	users.forEach(user => {		
		const userItem = document.createElement('div');
		userItem.className = 'flex items-center rounded-md gap-3 p-3 hover:bg-gray-100 cursor-pointer';

		const statusColor = getStatusColor(user.status);

		userItem.innerHTML = `
		<div class="w-10 h-10 rounded-full relative" id="user">
		  <img src="${user.avatar_url || defaultAvatar}" alt="${user.nickname}" class="w-full h-full rounded-full object-cover" referrerpolicy="no-referrer">
		  <span class="absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-white"></span>
		</div>
		<div>
		  <div class="font-medium text-ponghover">${user.nickname}</div>
		  <div class="text-xs text-gray-500">${user.status}</div>
		</div>
	  `;

		// Add click event to user item
		userItem.addEventListener('click', () => {
			let profilePopUp = document.querySelector(".profile");
				if (!profilePopUp) {
				  profilePopUp = document.createElement("div");
				  profilePopUp.className = "profile";
				  container.appendChild(profilePopUp);
				}
				const profile = Profile({ 
				  uName: user.nickname,
				});
				profilePopUp.innerHTML = '';
				profilePopUp.appendChild(profile);
			// Close the results container
			container.classList.add('hidden');
		});

		container.appendChild(userItem);
	});
}

// Helper function to get status color
function getStatusColor(status: string): string {
	switch (status) {
		case 'online':
			return 'bg-green-500';
		case 'offline':
			return 'bg-gray-500';
		case 'in-game':
			return 'bg-yellow-500';
		default:
			return 'bg-gray-500';
	}
}