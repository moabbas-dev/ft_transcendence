import { SignIn } from '../components/SignIn.js';
import { SignUp } from '../components/SignUp.js';
import { PongAnimation } from '../components/PingPongAnimation.js';
import { msg } from '../languages/LanguageController.js';

export default {
	render: (container:HTMLElement) => {
		container.innerHTML = `
		<div class="loaded-div fixed inset-0 overflow-hidden">
			<canvas id="pongCanvas" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:top-0 sm:left-0 z-0 w-[100vh] h-[100vw] sm:w-[100vw] sm:h-[100vh] inset-0 rotate-90 origin-center sm:rotate-0"></canvas>
			<div class="relative z-10 flex items-center justify-center">
				<section class="flex items-center justify-center h-[100dvh] opacity-90">
					<div class="bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] shadow-white rounded-lg">
						<aside class="transition-opacity duration-400">
						</aside>
						<!-- SignIn, SignUp Forms Here -->
						<div class="flex flex-col gap-3">
							<div class="w-full p-1">
								<button type="button" class="w-full flex items-center justify-start p-2 text-white bg-[var(--main-color)] hover:cursor-pointer hover:opacity-80 rounded-md transition-all duration-300">
									<i class='bx bxl-google text-2xl'></i>
									<span class="flex-1 text-center">${msg('register.continueGoogle')}</span>
								</button>
							</div>	
						</div>
					</div>
				</section>
			</div>
		</div>
		`;

		const animateTransition = (newComponentFn:any) => {
			section.classList.add('opacity-0');
			setTimeout(() => {
			  section.innerHTML = '';
			  section.appendChild(newComponentFn());
			  section.classList.remove('opacity-0');
			}, 400);
		};

		const section:HTMLElement = container.querySelector('aside')!;
		const renderSignIn = () => {
			animateTransition(() =>
			  SignIn({
				styles: 'mx-auto',
				onSwitchToSignUp: renderSignUp, 
			  })
			);
		  };
	  
		  const renderSignUp = () => {
			animateTransition(() =>
			  SignUp({
				styles: 'mx-auto',
				onSwitchToSignIn: renderSignIn,
			  })
			);
		  };
		renderSignIn();

		const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
		if (canvas) {
			const pong = new PongAnimation(canvas);
		}
	}
}