import { createComponent } from "../../utils/StateManager.js";

export const TournamentAlertNotification = createComponent((props: { timeRemaining: string }) => {
	const notification = document.createElement('li');
	notification.className = 'w-full flex flex-col gap-1 text-black border-b bg-yellow-50';
	notification.innerHTML = `
		<div class="flex justify-between items-center">
			<span class="text-lg font-bold hover:underline hover:opacity-90 cursor-pointer text-orange-600">Tournament Alert</span>
			<span class="text-sm text-gray-600">${props.timeRemaining}</span>
		</div>
		<div>
			<p class="text-gray-800">Your game is about to start! Get ready!</p>
		</div>
	`
	return notification;
});
