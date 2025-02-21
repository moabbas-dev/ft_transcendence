import { Button } from "../components/partials/Button.js";
import { msg } from "../languages/LanguageController.js";
import { navigate } from "../router.js";

export default {
	render: (container:HTMLElement) => {
	  container.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
		  <div class="container mx-auto px-2 flex justify-start">
		  	<i class='back-btn bx bx-left-arrow-alt text-4xl 2xl:text-[5rem] hover:cursor-pointer hover:opacity-80'></i>
			  
		  </div>
		  <div class="text-center page-body">
			<i class='bx bx-ghost text-9xl 2xl:text-[12rem] mb-6 drop-shadow-[1px_1px_20px_white] animate-pulse'></i>
			<h1 class="text-6xl 2xl:text-[6.5rem] font-bold mb-4">404</h1>
			<h2 class="text-2xl 2xl:text-4xl font-semibold mb-8">${msg('notfound.title')}</h2>
			<p class="text-gray-400 mb-8 max-w-md mx-auto 2xl:text-lg">
				${msg('notfound.message')}
			</p>
			<!-- Back to Home Button -->
		  </div>
		</div>
	  `;
	  const HomeBtn = Button({
		text: `<i class="bx bx-home text-xl mr-2"></i> ${msg('notfound.homeBtn')}`,
		styles: 'inline-flex px-6 2xl:px-8 py-3 2xl:py-5 text-white bg-[var(--main-color)] font-semibold sm:text-lg 2xl:text-xl rounded-lg',
		type: 'button',
		eventType: 'click',
		onClick: () => navigate('/')
	  })

	  container.querySelector('.page-body')!.appendChild(HomeBtn)
	  container.querySelector('.back-btn')!.addEventListener('click', () => {
		history.back();
	  }, {once: true})
	}
};
