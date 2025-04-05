import { formatDistanceToNow } from "date-fns";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";
import axios from "axios";

export const GameChallengeNotification = createComponent((props: NotificationProps) => {
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
    notification.className = 'w-full flex flex-col gap-2 text-black border-b bg-purple-50';
        
    notification.innerHTML = `
        <div class="flex justify-between items-center">
            <span id="sender-name" class="text-lg font-bold text-pongblue cursor-pointer hover:opacity-90 hover:underline">Loading...</span>
            <div class="flex items-center gap-2">
                ${!props.is_read? '<div class="size-1.5 bg-red-600 rounded-full"></div>' : ''}
                <span class="text-sm text-gray-600">${formatDistanceToNow(props.created_at, { addSuffix: false })}</span>
            </div>
        </div>
        <div class="flex flex-col gap-1">
            <p class="text-gray-800 font-semibold"><i class="fa-solid fa-bolt text-[#f00]"></i> Epic Challenge Incoming! <i class="fa-solid fa-bolt text-[#f00]"></i></p>
            <p class="text-gray-700">Test User has thrown down the gauntlet and challenged you to an intense Pong showdown!</p>
            <div class="flex items-center justify-center w-full">
                <button class="accept-btn w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
					<i class="fa-solid fa-hands-holding-circle"></i>
                    Accept the Challenge!
                </button>
            </div>
            <p class="text-xs text-gray-500 text-center italic">Prove your skills and show who's the true champion!</p>
        </div>
    `;

	fetchSenderNickname(props.senderId).then(data => {
		if (data) {
			const senderName = notification.querySelector('#sender-name')!
			senderName.textContent = data.nickname
		}
	});

    // Add event listener for accept button
    const acceptBtn = notification.querySelector('.accept-btn')!;
    acceptBtn.addEventListener('click', () => {

    });

    return notification;
});