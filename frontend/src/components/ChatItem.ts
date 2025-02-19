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
		<div class="text-white pr-4">
			<i class="fa-solid fa-user-plus text-lg hover:text-[var(--main-color)]"></i>
		</div>
		` : ''}
	`
	return chatItem
})