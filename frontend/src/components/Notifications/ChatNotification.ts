import { createComponent } from "../../utils/StateManager";

interface ChatNotificationProps {
	senderId: string,
	receiverId: string,
	message: string,
}

export const ChatNotification = createComponent((props: ChatNotificationProps) => {
	const notification = document.createElement('li');
	notification.className = 'w-full flex flex-col gap-1 text-black border-b';
	notification.innerHTML = `
		<div class="flex justify-between items-center">
			<span>
				<span class="text-lg font-bold text-pongblue hover:underline cursor-pointer">< friend ></span>
				<span>Messages you!</span>
			</span>
			<span>Just now</span>
		</div>
		<div>
			<p class="text-gray-700">${props.message}</p>
		</div>
	`

	// fetch sender nickname
	// fetch receiver nickname
	return notification;
});
