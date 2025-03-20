import { createComponent } from "../../utils/StateManager.js";

// Sample friends data [For Testing Purposes]
const friends = [
	{ username: "Mohamad abbass - moabbas", status: "Online", avatar: "https://placehold.co/40x40" },
	{ username: "Jihad Fatfat - jfatfat", status: "Offline", avatar: "https://placehold.co/40x40" },
	{ username: "Ahmad Farachi - afarachi", status: "In Game", avatar: "https://placehold.co/40x40" }
];

interface FriendProps {
	username: string;
	status: string;
	avatar: string;
}

const Friend = createComponent((props: FriendProps) => {
	const frientItem = document.createElement('div');
	frientItem.className = "flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50";
	frientItem.innerHTML = `
		<img alt="${props.username.split(' ')[1]}" src="${props.avatar}" class="size-10 rounded-full"/>
		<div>
			<p class="font-medium">${props.username}</p>
			<span class="text-sm text-gray-500">${props.status}</span>
		</div>
		<div class="flex flex-1 justify-end gap-2">
			<button class="size-[32px] p-1.5 grid place-content-center bg-pongblue text-white rounded-full hover:opacity-80">
				<i class="fa-regular fa-comment-dots"></i>
			</button>
			<button class="size-[32px] p-1.5 grid place-content-center bg-gray-300 rounded-full hover:bg-gray-200">
				<i class="fa-solid fa-ellipsis-vertical"></i>
			</button>
		</div>
	`
	return frientItem
})

export const FriendsSection = createComponent(() => {
    const section = document.createElement('div');
    section.className = "flex flex-col gap-4";
	section.innerHTML = `
		<div id="search-container" class="flex items-center gap-4 px-4 rounded-lg bg-gray-200 focus-within:bg-gray-100 focus-within:shadow-sm focus-within:shadow-pongblue focus-within:border focus-within:border-pongblue">
			<i class="fa-solid fa-magnifying-glass"></i>
			<input 
				id="friends-search"
				type="text"
				placeholder="Search friends..."
				class="w-full flex-1 p-2 rounded-lg bg-gray-200 focus:bg-gray-100"
			/>
		</div>
		<div id="friends-list" class="flex flex-col gap-2"></div>
	`
    const friendsList = section.querySelector('#friends-list')!;
	friends.forEach(friend => {
		friendsList.appendChild(Friend(friend))
	})
	return section
})
