import { Button } from "../components/Button.js";
import { navigate } from "../router.js";

export default {
	render: (container) => {
	  container.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
		  <div class="text-center page-body">
			<!-- 404 Icon -->
			<i class='bx bx-ghost text-[--main-color] text-9xl mb-6 drop-shadow-[1px_1px_20px_white]'></i>
			
			<!-- Title -->
			<h1 class="text-6xl font-bold mb-4">404</h1>
			
			<!-- Subtitle -->
			<h2 class="text-2xl font-semibold mb-8">Page Not Found</h2>
			
			<!-- Message -->
			<p class="text-gray-400 mb-8 max-w-md mx-auto">
			  Oops! The page you're looking for has vanished like a ghost. Let's get you back to the game!
			</p>
			
			<!-- Back to Home Button -->

		  </div>
		</div>
	  `;
	  const HomeBtn = Button({
		text: '<i class="bx bx-home text-xl mr-2"></i> Back to Home',
		styles: 'inline-flex px-6 py-3 text-white bg-[var(--main-color)] font-semibold sm:text-lg rounded-lg',
		type: 'button',
		eventType: 'click',
		onClick: (e) => navigate('/')
	  })
	  container.querySelector('.page-body').appendChild(HomeBtn)
	}
};
