import { t } from "../../languages/LanguageController";

export function displayResults(users: {nickname:string, status:string, avatar:string}[], container: HTMLElement): void {
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
		<div class="w-10 h-10 rounded-full relative">
		  <img src="${user.avatar}" alt="${user.nickname}" class="w-full h-full rounded-full object-cover">
		  <span class="absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-white"></span>
		</div>
		<div>
		  <div class="font-medium text-ponghover">${user.nickname}</div>
		  <div class="text-xs text-gray-500">${user.status}</div>
		</div>
	  `;

		// Add click event to user item
		userItem.addEventListener('click', () => {
			// Handle user selection
			console.log('Selected user:', user);
			// You can navigate to user profile or perform other actions here

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