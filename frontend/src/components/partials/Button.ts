import { createComponent, useCleanup } from "../../utils/StateManager.js";

interface ButtonProps {
	text: string, 
	type: "button" | "submit" | "reset",
	styles: string,
	eventType: string,
	onClick: () => void,
}

export const Button = createComponent((props: ButtonProps) => {
	const button = document.createElement('button');
	button.innerHTML = props.text;
	button.type = props.type;
	button.className = `flex items-center justify-center hover:opacity-80 hover:cursor-pointer transition-all duration-300 bg-pongcyan rounded-full ${props.styles}`;
	button.addEventListener(props.eventType, props.onClick);
	useCleanup(() => button.removeEventListener(props.eventType, props.onClick));
	return button;
})