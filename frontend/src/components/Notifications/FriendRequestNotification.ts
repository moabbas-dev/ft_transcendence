import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";

export const FriendRequestNotification = createComponent((props: NotificationProps) => {
    props;
    const notification = document.createElement('li');
    notification.className = 'w-full flex flex-col gap-1 text-black border-b bg-blue-50';
    
    notification.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="text-lg font-bold">System</span>
            <span class="">Just now</span>
        </div>
        <div class="flex flex-col">
            <p class="text-gray-700">
                <span class="text-pongblue font-semibold hover:cursor-pointer hover:underline hover:opacity-90">Test User</span>
                Sent you a friend request
            </p>
            <div class="flex justify-between gap-2">
                <button class="accept-btn w-1/2 bg-green-500 text-white py-1 rounded hover:bg-green-600 transition-colors">Accept</button>
                <button class="decline-btn w-1/2 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition-colors">Decline</button>
            </div>
        </div>
        <div class="h-[0.1rem]"></div>
    `;

    const acceptBtn = notification.querySelector('.accept-btn')!;
    const declineBtn = notification.querySelector('.decline-btn')!;

    acceptBtn.addEventListener('click', () => {

    });

    declineBtn.addEventListener('click', () => {
        
    });

    return notification;
});
