import { createComponent, useCleanup } from "../utils/StateManager.js";
import { Button } from "./Button.js";
import {validateConfirmPassword, validateEmail, validatePassword} from "../utils/FormValidation.js";
import { msg } from "../languages/LanguageController.js";

interface SignUpProps {
	styles: string,
	onSwitchToSignIn: () => void
}

export const SignUp = createComponent((props: SignUpProps) => {
	const form = document.createElement('div')
	form.className = `w-[93vw] sm:w-96 bg-white rounded-lg p-4 sm:p-8  ${props.styles || ''}`;
	form.innerHTML = `
	<div class="flex flex-col gap-3 sm:gap-5">
	  <h1 class="text-2xl font-bold text-center underline">${msg('register.signup.title')}</h1>
	  <form class="flex flex-col gap-2 sm:gap-3">
		<div class="flex flex-col gap-1">
		  <label for="email" class="block text-base font-medium text-gray-700">Email</label>
		  <input type="email" id="email" placeholder="${msg('register.signup.emailPlaceholder')}" autocomplete="email" name="email" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:shadow-[0_0_5px_var(--main-color)] focus:border-[var(--main-color)] sm:text-base">
		</div>
		<div>
		  <label for="password" class="block text-base font-medium text-gray-700">Password</label>
		  <div class="relative sm:mt-1">
		  	<div>
				<input type="password" id="password" placeholder="${msg('register.signup.passwordPlaceholder')}" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:shadow-[0_0_5px_var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
			</div>
			<span class="absolute inset-y-0 right-0 h-[42px] flex items-center pr-3 cursor-pointer toggle-password text-lg">
			  <i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
		  </div>
		</div>
		<div>
			<label for="conf-password" class="block text-base font-medium text-gray-700">${msg('register.signup.passwordConfirmTitle')}</label>
			<div class="relative sm:mt-1">
			<div>
				<input type="password" id="conf-password" placeholder="${msg('register.signup.passwordConfirm')}" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] focus:shadow-[0_0_5px_var(--main-color)] sm:text-base pr-10">
			</div>
			<span class="absolute inset-y-0 right-0 flex items-center h-fit py-3 pr-3 cursor-pointer toggle-password text-lg">
				<i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
			</div>
	  	</div>
		<!-- SignUp Button -->
	  </form>
	  <div class="w-full text-center sm:pt-1">
	  	${msg('register.signup.acc_question')} <span class="signin-link hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]">${msg('register.signup.signin_btn')}</span>
	  </div>
	</div>
	`;
	// signup_btn
	// acc_question
	// signin_btn
	const formElement:HTMLFormElement = form.querySelector('form')!;
	const emailInput:HTMLInputElement = form.querySelector('#email')!;
	const passwordInput:HTMLInputElement = form.querySelector('#password')!;
	const confirmPasswordInput:HTMLInputElement = form.querySelector('#conf-password')!;

	const signUpButton = Button({
	  type: 'submit',
	  text: msg('register.signup.signup_btn'),
	  styles: 'w-full font-semibold p-2 text-base text-white',
	  eventType: 'click',
	  onClick: (e: MouseEvent) => {
		if (!validateEmail(emailInput) || !validatePassword(passwordInput) || !validateConfirmPassword(passwordInput, confirmPasswordInput))
			e.preventDefault();
		else
			console.log('email and pass are nice!');
	  }
	});
	formElement.appendChild(signUpButton);

	const signinLink = form.querySelector('.signin-link')!;
	signinLink.addEventListener('click', (e: Event) => {
	  e.preventDefault();
	  if (props.onSwitchToSignIn) {
		props.onSwitchToSignIn();
	  }
	});
	const togglePassword = form.querySelectorAll('.toggle-password');
	const eyeIcon = togglePassword[0].querySelector('.hide-show')!;
	const confEyeIcon = togglePassword[1].querySelector('.hide-show')!;

	const handleTogglePassword = (e: Event) => {
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