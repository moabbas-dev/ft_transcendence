import { Chat } from "../components/chat/Chat.js";
import logoUrl from "/src/assets/ft_transcendencee.png";
import { ChatItem } from "../components/chat/ChatItem.js";
import { navigate } from "../router.js";

export default {
	render: (container:HTMLElement) => {
		container.innerHTML = `
			<div class="flex">
				<div class="flex flex-col gap-4 w-screen sm:w-[30vw] sm:min-w-[300px] h-[100dvh] bg-pongdark">
					<div class="flex gap-2 text-white px-4 pt-4 text-3xl 2xl:text-4xl items-center">
						<div class="logo rounded-full size-8 bg-white drop-shadow-[0px_0px_5px_white] hover:cursor-pointer hover:drop-shadow-[1px_1px_20px_white]">
							<img src="${logoUrl}" class="logo size-8"/>
						</div>
						<h1>Neon Friends</h1>
					</div>
					<div class="friends-list sm:flex flex-col scroll-pr-4 pl-4 flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
					[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
					[&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
					[&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
					[&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748]">

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

		const logoContainer = container.querySelector('.logo')!;
		logoContainer.addEventListener('click', () => {
			navigate('/')
		});
	}
}