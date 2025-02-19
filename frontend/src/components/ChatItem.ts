import { createComponent } from "../utils/StateManager";

interface ChatItemProps {
	username: string,
	firstname: string,
	lastname: string,
	isFriend: boolean,
}

export const ChatItem = createComponent((props: ChatItemProps) => {
	const chatItem = document.createElement('div');
	chatItem.className = 'user-item flex items-center justify-between gap-3 py-3 hover:bg-[var(--bg-hover)] hover:cursor-pointer border-b rounded-sm'
	chatItem.innerHTML = `
		<div class="flex items-center gap-2">
			<div class="bg-white rounded-full w-10 h-10 2xl:w-14 2xl:h-14"></div> <!-- Image -->
			<div class="text-white text-base sm:text-lg 2xl:text-xl">${props.firstname} ${props.lastname}</div>
		</div>
		${!props.isFriend? `
		<div class="add-friend text-white mr-4 hover:bg-slate-700 w-fit h-fit rounded-lg">
			<i title="Add Friend" class="fa-solid fa-user-plus p-2 text-lg hover:text-[var(--main-color)]"></i>
		</div>
		` : ''}
	`

	const addFriend = chatItem.querySelector('.add-friend');
	addFriend?.addEventListener('click', (e) => {
		e.stopPropagation();
		if (addFriend.firstChild instanceof Element && addFriend.firstChild.classList.contains('fa-user-clock'))
			return;
		console.log('Add Friend Clicked');
		addFriend.firstChild?.remove()
		addFriend.innerHTML = `<i title="Pending..." class="fa-solid fa-user-clock p-2 text-lg hover:text-[var(--main-color)]"></i>`;
	})
	return chatItem
})