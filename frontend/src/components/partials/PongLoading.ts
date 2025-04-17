import { createComponent } from "../../utils/StateManager";

interface PongALoadingProps {
	text: string;
}

export const PongLoading = createComponent((props: PongALoadingProps) => {
	const container = document.createElement('div')
	container.className = `relative w-[200px] h-[100px] z-[60]`
	container.innerHTML = `
		<div class="absolute inline-block bg-pongcyan m-auto top-auto bottom-0 left-0 w-[6px] h-[40px] rounded-sm animate-slide shadow-[0_0_10px] shadow-pongcyan" id="left"></div>
		<div class="absolute inline-block bg-pongcyan m-auto top-0 bottom-auto left-auto right-0 w-[6px] h-[40px] rounded-sm animate-slide2 shadow-[0_0_10px] shadow-pongcyan" id="right"></div>
		<div class="absolute size-[10px] bg-pongcyan m-[8px] bottom-[10px] rounded-full animate-pong shadow-[0_0_10px] shadow-pongcyan"></div>
		<div class="absolute inset-0 text-pongcyan text-3xl size-fit text-center m-auto animate-flash">${props.text}</div>
	`
	return container
})
