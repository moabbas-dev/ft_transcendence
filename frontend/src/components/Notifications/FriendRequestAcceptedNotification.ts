import { formatDistanceToNow } from "date-fns";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";
import axios from "axios";

export const FriendRequestAcceptedNotification = createComponent((props: NotificationProps) => {
    const fetchSenderNickname = async (senderId:number) => {
		try {
			const response = await axios.get(`http://localhost:8001/auth/users/id/${senderId}`)
			return response.data
		} catch(err) {
			console.error(err);
			return null
		}
	}	
    
    const notification = document.createElement('li');
    notification.className = 'w-full flex flex-col gap-2 text-black border-b bg-green-50';
    notification.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="text-lg font-bold">System</span>
            <div class="flex items-center gap-2">
                ${!props.is_read? '<div class="size-1.5 bg-red-600 rounded-full"></div>' : ''}
                <span class="text-sm text-gray-600">${formatDistanceToNow(props.created_at, { addSuffix: false })}</span>
            </div>
        </div>
        <div>
            <p class="text-gray-700">
                <span id="sender-name" class="text-pongcyan font-semibold cursor-pointer hover:underline hover:opacity-90">Loading...</span>
                accepted your friend invitation
            </p>
        </div>
    `;
    fetchSenderNickname(props.senderId).then(data => {
		if (data) {
			const senderName = notification.querySelector('#sender-name')!
			senderName.textContent = data.nickname
		}
	});

    return notification;
});