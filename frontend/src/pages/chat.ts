import { Chat } from "../components/Chat";
import { ChatItem } from "../components/ChatItem";

export default {
	render: (container:HTMLElement) => {
		container.innerHTML = `
			<div class="flex">
				<div class="flex flex-col gap-4 w-screen sm:w-[30vw] sm:min-w-[300px] h-[100dvh] bg-[var(--bg-color)]">
					<div class="flex gap-2 text-white px-4 pt-4 text-3xl 2xl:text-4xl items-center">
						<div class="rounded-full w-5 h-5 2xl:w-8 2xl:h-8 bg-white drop-shadow-[0px_0px_5px_white]"></div>
						<h1>Neon Friends</h1>
					</div>
					<div class="friends-list sm:flex flex-col scroll-pr-4 pl-4 flex-1 overflow-y-auto styled-scrollbar">

					</div>
				</div>
				<div class="chat hidden bg-black sm:block sm:w-[70vw] h-[100dvh]">

				</div>
			</div>
		`;
		const friendsList = container.querySelector('.friends-list')!;
		friendsList.appendChild(ChatItem({username: 'John', firstname: 'John', lastname: 'Doe', isFriend: true}))
		friendsList.appendChild(ChatItem({username: 'John', firstname: 'John', lastname: 'Doe', isFriend: false}))
		friendsList.appendChild(ChatItem({username: 'John', firstname: 'John', lastname: 'Doe', isFriend: true}))
		friendsList.appendChild(ChatItem({username: 'John', firstname: 'John', lastname: 'Doe', isFriend: true}))
		friendsList.appendChild(ChatItem({username: 'John', firstname: 'John', lastname: 'Doe', isFriend: false}))
		friendsList.appendChild(ChatItem({username: 'John', firstname: 'John', lastname: 'Doe', isFriend: true}))

		const chat = container.querySelector('.chat')
		const chatComponent = Chat()
		chat?.appendChild(chatComponent)

		const chatContainer = document.querySelector('.chat')!;
		document.querySelectorAll('.user-item').forEach(item => {
			if(window.innerWidth < 640) {
				item.addEventListener('click', () => {
					chatContainer.classList.remove('hidden');
					chatContainer.classList.add('fixed', 'bottom-0', 'left-0', 'w-full', 'h-[100dvh]', 'animate-slideUp', 'z-90');
					chatContainer.classList.remove('animate-slideDown');
				}
			)}
		});

		container.querySelector('.back_arrow')?.addEventListener('click', () => {
			chatContainer.classList.add('animate-slideDown');
			chatContainer.classList.remove('animate-slideUp');
		})
	}
}