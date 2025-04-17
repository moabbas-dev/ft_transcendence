import { navigate } from "../router.js";

export default {
	render: (container: HTMLElement) => {
	  const params = new URLSearchParams(window.location.search);
	  const nickname = params.get("u");
	  const email = params.get("e");

	  container.className = 'flex items-center justify-center text-white flex-col h-dvh bg-pongdark';
	  container.innerHTML = `
  
	  <div class="flex flex-col items-center gap-8 max-w-md w-full p-8 rounded-2xl border border-pongblue bg-slate-900 bg-opacity-60 backdrop-blur-md shadow-[0_0_10px_#00ffff]">
		<div class="flex items-center gap-4">
		  <i class="fa-solid fa-circle-check text-5xl text-white drop-shadow-[0_0_5px_#00ffff]"></i>
		  <h1 class="text-3xl font-bold text-white drop-shadow-[0_0_5px_#00ffff]">Account Verified</h1>
		</div>
  
		<div class="flex flex-col gap-6 w-full">
		  <div class="flex items-center gap-4 bg-slate-900 bg-opacity-50 p-4 rounded-lg border border-pongblue shadow-[0_0_6px_#00ffff55]">
			<i class="fa-solid fa-user text-xl text-white drop-shadow-[0_0_3px_#00ffff]"></i>
			<div class="flex flex-col gap-1">
			  <span class="text-sm text-slate-300">Username</span>
			  <span class="font-medium">@${nickname || "Loading..."}</span>
			</div>
		  </div>
  
		  <div class="flex items-center gap-4 bg-slate-900 bg-opacity-50 p-4 rounded-lg border border-pongblue shadow-[0_0_6px_#00ffff55]">
			<i class="fa-solid fa-envelope text-xl text-white drop-shadow-[0_0_3px_#00ffff]"></i>
			<div class="flex flex-col gap-1">
			  <span class="text-sm text-slate-300">Email</span>
			  <span class="font-medium">${email || "Loading..."}</span>
			</div>
		  </div>
  
		  <div class="flex items-center gap-4 bg-slate-900 bg-opacity-50 p-4 rounded-lg border border-pongblue shadow-[0_0_6px_#00ffff55]">
			<i class="fa-solid fa-shield-halved text-xl text-white drop-shadow-[0_0_3px_#00ffff]"></i>
			<div class="flex flex-col gap-1">
			  <span class="text-sm text-slate-300">Verification Status</span>
			  <span class="font-medium text-white drop-shadow-[0_0_3px_#00ffff]">Verified</span>
			</div>
		  </div>
		</div>
  
		<div class="flex flex-col gap-2 items-center">
		  <p class="text-center text-slate-300">Your account has been successfully verified. You now have access to all platform features.</p>
		  <button class="continue-to-login mt-4 px-6 py-3 rounded-lg bg-pongblue text-slate-300 hover:opacity-80 transition-all duration-200 shadow-[0_0_10px_#00ffff]">
			<i class="fa-solid fa-arrow-right-to-bracket mr-2"></i> Continue to Login
		  </button>
		</div>
	  </div>
	  `;
	  const continueButton = container.querySelector('.continue-to-login') as HTMLButtonElement;
	  continueButton.addEventListener('click', () => {navigate('/register')})
	}
};
  