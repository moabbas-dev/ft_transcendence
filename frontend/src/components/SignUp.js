import { createComponent, useCleanup } from "../utils/StateManager.js";
import { Button } from "./Button.js";

export const SignUp = createComponent((props) => {
	const form = document.createElement('div')
	form.className = `w-[93vw] sm:w-100 bg-white p-4 sm:p-8 rounded-lg shadow-md ${props.styles || ''}`;
	form.innerHTML = `
	<div class="flex flex-col gap-5">
	  <h1 class="text-2xl font-bold text-center underline">Create a new Account</h1>
	  <form class="flex flex-col gap-3">
		<div>
		  <label for="email" class="block text-base font-medium text-gray-700">Email</label>
		  <input type="email" id="email" autocomplete="email" name="email" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base">
		</div>
		<div>
		  <label for="password" class="block text-base font-medium text-gray-700">Password</label>
		  <div class="relative mt-1">
			<input type="password" id="password" autocomplete="current-password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
			<span class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer toggle-password text-lg">
			  <i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
		  </div>
		</div>
		<div>
			<label for="conf-password" class="block text-base font-medium text-gray-700">Confirm Password</label>
			<div class="relative mt-1">
			<input type="password" id="conf-password" autocomplete="current-password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
			<span class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer toggle-password text-lg">
				<i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
			</div>
	  	</div>
		<!-- SignUp Button -->
	  </form>
	  <div class="w-full text-center pt-2">
	  	Already have an Account? <span class="signin-link hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]">Let's Login</span>
	  </div>
	</div>
	`;

	const formElement = form.querySelector('form');
	const emailInput = form.querySelector('#email');
	const passwordInput = form.querySelector('#password');
	const confirmPasswordInput = form.querySelector('#conf-password');

	const signUpButton = Button({
	  type: 'submit',
	  text: 'Sign Up',
	  styles: 'w-full font-semibold p-2 text-base text-white',
	  eventType: 'click',
	  onClick: (e) => {
		e.preventDefault();
		console.log('Input values:', emailInput.value);
	  }
	});
	formElement.appendChild(signUpButton);

	const signinLink = form.querySelector('.signin-link');
	signinLink.addEventListener('click', (e) => {
	  e.preventDefault();
	  if (props.onSwitchToSignIn) {
		props.onSwitchToSignIn();
	  }
	});
	const togglePassword = form.querySelectorAll('.toggle-password');
	const eyeIcon = togglePassword[0].querySelector('.hide-show');
	const confEyeIcon = togglePassword[1].querySelector('.hide-show');

	const handleTogglePassword = (e) => {
	  e.preventDefault();
	  const wasPassword = passwordInput.type === 'password';
	  passwordInput.type = wasPassword ? 'text' : 'password';
	  confirmPasswordInput.type = passwordInput.type
	  eyeIcon.classList.remove('bx-show', 'bx-hide');
	  eyeIcon.classList.add(wasPassword ? 'bx-show' : 'bx-hide');

	  confEyeIcon.classList.remove('bx-show', 'bx-hide');
	  confEyeIcon.classList.add(wasPassword ? 'bx-show' : 'bx-hide');
	};

	togglePassword[0].addEventListener('click', handleTogglePassword);
	togglePassword[1].addEventListener('click', handleTogglePassword);
	useCleanup(() => togglePassword[0].removeEventListener('click', handleTogglePassword))
	useCleanup(() => togglePassword[1].removeEventListener('click', handleTogglePassword))
	return form;  
})