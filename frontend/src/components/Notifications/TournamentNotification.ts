import { formatDistanceToNow } from "date-fns";
import { formatTimestamp } from "../../utils/formatTime.js";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";
import { formatInTimeZone } from "date-fns-tz";

export const TournamentAlertNotification = createComponent((props: NotificationProps) => {
	props;
	const notification = document.createElement('li');
	notification.className = 'w-full flex flex-col gap-1 text-black border-b bg-yellow-50';
	notification.innerHTML = `
		<div class="flex justify-between items-center">
			<span class="text-lg font-bold hover:underline hover:opacity-90 cursor-pointer text-orange-600">Tournament Alert</span>
			<div class="flex items-center gap-2">
				${!props.is_read? '<div class="size-1.5 bg-red-600 rounded-full"></div>' : ''}
			</div>
		</div>
		<div>
			<p class="text-gray-800">Your game is about to start! Get ready!</p>
		</div>
	`
	return notification;
});
