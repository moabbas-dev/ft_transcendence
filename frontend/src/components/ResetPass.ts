import { msg } from "../languages/LanguageController.js";
import { validateConfirmPassword, validateEmail, validatePassword } from "../utils/FormValidation";
import { createComponent, useCleanup } from "../utils/StateManager.js";
import { Button } from "./Button.js";

export const ResetPass = createComponent(() => {
	const form = document.createElement('div')
	form.className = `w-[93vw] sm:w-96 bg-white rounded-lg p-4 sm:p-8`;
	form.innerHTML = `
	<div class="flex flex-col gap-5">
	  <div class="flex flex-col gap-2">
	  	<h1 class="text-2xl font-bold text-center underline">Reset Your Password</h1>
		<p>Enter a new <b>Strong</b> password below to change your password.</p>
	  </div>
	  <form class="flex flex-col gap-3">
		<div>
		  <div class="relative mt-1">
		  	<div>
				<input type="password" id="password" placeholder="${msg('register.signup.passwordPlaceholder')}" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
			</div>
			<span class="absolute inset-y-0 h-[42px] right-0 flex items-center pr-3 cursor-pointer toggle-password text-lg">
			  <i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
		  </div>
		</div>
		<div>
			<div class="relative mt-1">
			<div>
				<input type="password" id="conf-password" placeholder="${msg('register.signup.passwordConfirm')}" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
			</div>
			<span class="absolute inset-y-0 right-0 flex items-center h-fit py-3 pr-3 cursor-pointer toggle-password text-lg">
				<i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
			</div>
	  	</div>
		<!-- ChangePassword Button -->
	  </form>
	</div>
	`;
	const formElement:HTMLFormElement = form.querySelector('form')!;
	const passwordInput:HTMLInputElement = form.querySelector('#password')!;
	const confirmPasswordInput:HTMLInputElement = form.querySelector('#conf-password')!;

	const ChangePassButton = Button({
	  type: 'submit',
	  text: 'Change Password',
	  styles: 'w-full font-semibold p-2 text-base text-white',
	  eventType: 'click',
	  onClick: (e: MouseEvent) => {
		if (!validatePassword(passwordInput) || !validateConfirmPassword(passwordInput, confirmPasswordInput))
			e.preventDefault();
		else
			console.log('email and pass are nice!');
	  }
	});
	formElement.appendChild(ChangePassButton);

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

	return form
})