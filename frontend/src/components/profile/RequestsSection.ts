import { createComponent } from "../../utils/StateManager.js";

// Incoming requests [For Testing Purposes]
const requests = [
	{ name: "Casey Parker", timeSent: "2 days ago", avatar: "https://placehold.co/40x40" },
	{ name: "Riley Martin", timeSent: "1 week ago", avatar: "https://placehold.co/40x40" }
];

interface RequestProps {
	name: string;
	timeSent: string;
	avatar: string;
}

const Request = createComponent((props: RequestProps) => {
	const requestItem = document.createElement('div');
	requestItem.className = "flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm";
	requestItem.innerHTML = `
		<img alt="${props.name}" src="${props.avatar}" class="size-10 rounded-full"/>
		<div>
			<p class="font-medium">${props.name}</p>
			<span class="text-sm text-gray-500">${props.timeSent}</span>
		</div>
		<div class="ml-auto flex gap-2">
			<button id="accept" class="px-3 py-1 bg-pongblue text-white text-sm rounded hover:opacity-80">
				Accept
			</button>
			<button id="decline" class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
				Decline
			</button>
		</div>
	`

	const acceptBtn = requestItem.querySelector('#accept')!;
	acceptBtn.addEventListener('click', () => {
		// API call here
	})

	const declineBtn = requestItem.querySelector('#decline')!;
	declineBtn.addEventListener('click', () => {
		// API call here
	})

	return requestItem
})

export const RequestsSection = createComponent(() => {
	const section = document.createElement('div');
	section.className = "flex flex-col gap-4";
	section.innerHTML = `
		<h3 class="font-medium text-lg">Incoming Friend Requests</h3>
		<div id="requests-list" class="flex flex-col gap-2"></div>
	`
	const requestsList = section.querySelector('#requests-list')!;
	requests.forEach(request => {
		requestsList.appendChild(Request(request))
	})

	return section
})