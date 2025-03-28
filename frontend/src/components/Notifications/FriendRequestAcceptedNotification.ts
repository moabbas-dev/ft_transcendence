import { formatDistanceToNow } from "date-fns";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";

export const FriendRequestAcceptedNotification = createComponent((props: NotificationProps) => {
    props; // REMOVEABLE
    const notification = document.createElement('li');
    notification.className = 'w-full flex flex-col gap-2 text-black border-b bg-green-50';
    notification.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="text-lg font-bold">System</span>
            <span class="text-sm text-gray-600">${formatDistanceToNow(props.created_at, { addSuffix: false })}</span>
        </div>
        <div>
            <p class="text-gray-700">
                <span class="text-pongblue font-semibold cursor-pointer hover:underline hover:opacity-90">Test User</span>
                accepted your friend invitation
            </p>
        </div>
    `;

    return notification;
});