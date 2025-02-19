import { createComponent } from "../utils/StateManager";

interface NotificationProps {
	username: string,
	message: string,
}

export const Notification = createComponent((props: NotificationProps) => {
	const notification = document.createElement('li');
	notification.className = 'w-full flex flex-col gap-2 text-black border-b';
	notification.innerHTML = `
		<div class="flex justify-between items-center">
			<span class="user-visit text-lg font-bold underline hover:cursor-pointer hover:text-[var(--main-color)]">${props.username}</span>
			<span class="">21m</span>
		</div>
		<div>
			<p>${props.message}</p>
		</div>
	`
	return notification;
});