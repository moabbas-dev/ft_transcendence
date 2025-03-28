import { formatDistanceToNow } from "date-fns";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";


export const ChatNotification = createComponent((props: NotificationProps) => {
	const notification = document.createElement('li');
	notification.className = 'w-full flex flex-col gap-1 text-black border-b';
	notification.innerHTML = `
		<div class="flex justify-between items-center">
			<span>
				<span class="text-lg font-bold text-pongblue hover:underline cursor-pointer">< friend ></span>
				<span>Messages you!</span>
			</span>
			<span class="text-sm text-gray-600">${formatDistanceToNow(props.created_at, { addSuffix: false })}</span>
		</div>
		<div>
			<p class="text-gray-700">${ellipsis(props.content!, 35)}</p>
		</div>
	`
	return notification;
});

function ellipsis(message: string, n: number) {
	return (message.length > n) ? message.substr(0, n - 1) + '&hellip;' : message;
}

