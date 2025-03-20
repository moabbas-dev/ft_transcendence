import { createComponent } from "../../utils/StateManager.js";

// Blocked users [For Testing Purposes]
const blockedUsers = [
	{ name: "Morgan Lewis", blockedOn: "Jan 15, 2025", avatar: "https://placehold.co/40x40" }
];

interface BlockedUserProps {
	name: string;
	blockedOn: string;
	avatar: string;
}

const BlockedUser = createComponent((props: BlockedUserProps) => {
	const blockedUsersItem = document.createElement('div');
	blockedUsersItem.className = "flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm";
	blockedUsersItem.innerHTML = `
		<img alt="${props.name}" src="${props.avatar}" class="size-10 rounded-full"/>
		<div>
			<p class="font-medium">${props.name}</p>
			<span class="text-sm text-gray-500">Blocked on ${props.blockedOn}</span>
		</div>
		<div class="ml-auto flex gap-2">
			<button id="unblock" class="px-3 py-1 bg-pongblue text-white text-sm rounded hover:bg-opacity-80">
				Unblock
			</button>
		</div>
	`
	const unblockBtn = blockedUsersItem.querySelector('#unblock')!;
	unblockBtn.addEventListener('click', () => {
		// API call here
	})
	return blockedUsersItem
})

export const BlockedUsersSection = createComponent(() => {
	const section = document.createElement('div');
	section.className = "flex flex-col gap-4";
	section.innerHTML = `
		<h3 class="font-medium text-lg">Incoming Friend Requests</h3>
		<div id="requests-list" class="flex flex-col gap-2"></div>
	`
	const blockedUsersList = section.querySelector('#requests-list')!;
	blockedUsers.forEach(user => {
		blockedUsersList.appendChild(BlockedUser(user))
	})
	return section
})