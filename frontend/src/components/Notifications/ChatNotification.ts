import { formatDistanceToNow } from "date-fns";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";
import axios from "axios";

export const ChatNotification = createComponent((props: NotificationProps) => {

	const fetchSenderNickname = async (senderId:number) => {
		try {
			const response = await axios.get(`https://localhost:8001/auth/users/id/${senderId}`)
			return response.data
		} catch(err) {
			console.error(err);
			return null
		}
	}	

	const notification = document.createElement('li');
	notification.className = 'w-full flex flex-col gap-1 text-black border-b';
	notification.innerHTML = `
		<div class="flex justify-between items-center">
			<span>
				<span id="sender-name" class="text-lg font-bold text-pongblue hover:underline cursor-pointer">Loading...</span>
				<span>Messages you!</span>
			</span>
			<div class="flex items-center gap-2">
				${!props.is_read? '<div class="size-1.5 bg-red-600 rounded-full"></div>' : ''}
				<span class="text-sm text-gray-600">${formatDistanceToNow(props.created_at, { addSuffix: false })}</span>
			</div>
		</div>
		<div>
			<p class="text-gray-700">${ellipsis(props.content!, 35)}</p>
		</div>
	`
	fetchSenderNickname(props.senderId).then(data => {
		if (data) {
			const senderName = notification.querySelector('#sender-name')!
			senderName.textContent = data.nickname
		}
	});

	return notification;
});

function ellipsis(message: string, n: number) {
	return (message.length > n) ? message.substr(0, n - 1) + '&hellip;' : message;
}
