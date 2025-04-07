import { formatDistanceToNow } from "date-fns";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";
import axios from "axios";

export const FriendRequestNotification = createComponent((props: NotificationProps) => {
    const fetchSenderNickname = async (senderId:number) => {
		try {
			const response = await axios.get(`http://localhost:8001/auth/users/id/${senderId}`, {headers: {'x-api-key': import.meta.env.VITE_AUTHENTICATION_API_KEY}})
			return response.data
		} catch(err) {
			console.error(err);
			return null
		}
	}	
    
    const notification = document.createElement('li');
    notification.className = 'w-full flex flex-col gap-1 text-black border-b bg-blue-50';
    
    notification.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="text-lg font-bold">System</span>
            <div class="flex items-center gap-2">
                ${!props.is_read? '<div class="size-1.5 bg-red-600 rounded-full"></div>' : ''}
                <span class="text-sm text-gray-600">${formatDistanceToNow(props.created_at, { addSuffix: false })}</span>
            </div>
        </div>
        <div class="flex flex-col">
            <p class="text-gray-700">
                <span id="sender-name" class="text-pongblue font-semibold hover:cursor-pointer hover:underline hover:opacity-90">Loading...</span>
                Sent you a friend request
            </p>
            <div class="flex justify-between gap-2">
                <button class="accept-btn w-1/2 bg-green-500 text-white py-1 rounded hover:bg-green-600 transition-colors">Accept</button>
                <button class="decline-btn w-1/2 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition-colors">Decline</button>
            </div>
        </div>
        <div class="h-[0.1rem]"></div>
    `;

	fetchSenderNickname(props.senderId).then(data => {
		if (data) {
			const senderName = notification.querySelector('#sender-name')!
			senderName.textContent = data.nickname
		}
	});

    const acceptBtn = notification.querySelector('.accept-btn')!;
    const declineBtn = notification.querySelector('.decline-btn')!;

    acceptBtn.addEventListener('click', () => {

    });

    declineBtn.addEventListener('click', () => {
        
    });

    return notification;
});
