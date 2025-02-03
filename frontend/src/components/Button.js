import { createComponent, useCleanup } from "../utils/StateManager.js";

// export function Button({ type, text, eventType, onClick, styles = '' }) {
// 	const button = document.createElement('button');
// 	button.innerText = text;
// 	button.type = type;
// 	button.className = `flex items-center justify-center hover:opacity-80 hover:cursor-pointer transition-all duration-300 px-4 py-2 bg-sky-500 text-white rounded-full ${styles}`;
// 	button.addEventListener(eventType, onClick);
// 	return button;
// }

export const Button = createComponent((props) => {
	const button = document.createElement('button');
	button.innerHTML = props.text;
	button.type = props.type;
	button.className = `flex items-center justify-center hover:opacity-80 hover:cursor-pointer transition-all duration-300 bg-[var(--main-color)] rounded-full ${props.styles}`;
	button.addEventListener(props.eventType, props.onClick);
	useCleanup(() => button.removeEventListener(props.eventType, props.onClick));
	return button;
})