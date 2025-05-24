import { createComponent } from "../../../utils/StateManager";

export const OnlineChoosePopup = createComponent(() => {
	const overlay = document.createElement('div');
	overlay.id = 'overlay';
	overlay.className = 'fixed top-0 left-0 w-screen h-screen z-[9998] bg-gray-400/70';
	document.getElementById('app')!.appendChild(overlay);

	const container = document.createElement('div')
	container.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] rounded-xl size-fit flex flex-col items-center gap-4 jusitfy-center bg-pongdark p-5'
	container.innerHTML = `
		<h1 class="text-2xl font-semibold text-white">Choose a Mode</h1>
		<div class="flex flex-col gap-3">
			<button class="flex items-center justify-center w-[18ch] rounded-xl p-2 bg-gradient-to-br from-pongcyan to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongcyan text-white text-lg animate-fade-left">Play with Friend</button>
			<button class="flex items-center justify-center w-[18ch] rounded-xl p-2 bg-gradient-to-br from-pongcyan to-[rgba(100,100,255,0.8)] hover:from-[rgba(100,100,255,0.9)] hover:to-pongcyan text-white text-lg animate-fade-right">Online matchmaking</button>
		</div>
	`
	overlay.addEventListener('click', () => {
		document.getElementById('app')!.removeChild(overlay)
		document.getElementById('app')!.removeChild(container)
	}, {once: true})

	return container
})