import { SignIn } from '../components/SignIn.js';
import { SignUp } from '../components/SignUp.js';

export default {
	render: (container) => {
		container.innerHTML = `
			<div class="flex items-center justify-center">
				<section class="flex items-center justify-center h-screen transition-opacity duration-300">
					<!-- Sign In Form -->
				</section>
			</div>
		`;

		const animateTransition = (newComponentFn) => {
			section.classList.add('opacity-0');
			setTimeout(() => {
			  section.innerHTML = '';
			  section.appendChild(newComponentFn());
			  section.classList.remove('opacity-0');
			}, 300);
		};

		const section = container.querySelector('section');
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
	}
}