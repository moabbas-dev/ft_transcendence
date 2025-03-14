import { createComponent } from "../../utils/StateManager";

export const PongLoading = createComponent(() => {
	const container = document.createElement('div')
	container.className = 'absolute inset-0 w-[200px] h-[100px] m-auto'
	container.innerHTML = `
		<div class="absolute inline-block bg-pongblue m-auto top-auto bottom-0 left-0 w-[6px] h-[40px] rounded-sm animate-slide shadow-[0_0_10px] shadow-pongblue" id="left"></div>
		<div class="absolute inline-block bg-pongblue m-auto top-0 bottom-auto left-auto right-0 w-[6px] h-[40px] rounded-sm animate-slide2 shadow-[0_0_10px] shadow-pongblue" id="right"></div>
		<div class="absolute size-[10px] bg-pongblue m-[8px] bottom-[10px] rounded-full animate-pong shadow-[0_0_10px] shadow-pongblue"></div>
		<div class="absolute inset-0 text-pongblue text-lg w-[55px] h-[10px] m-auto animate-flash">Loading</div>
	`
	return container
})
