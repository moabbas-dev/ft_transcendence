import axios from "axios";
import { t } from "../../languages/LanguageController.js";
import { createComponent, useCleanup } from "../../utils/StateManager.js";
import { Button } from "../partials/Button.js";
import { navigate } from "../../router.js";
import Toast from "../../toast/Toast.js";

export const ResetPass = createComponent((params: { [key: string]: string | number }) => {
	const form = document.createElement('div')
	form.className = `w-[93vw] sm:w-96 bg-white rounded-lg p-4 sm:p-8`;
	form.innerHTML = `
	<div class="flex flex-col gap-2">
	  <div class="flex flex-col gap-2">
	  	<h1 class="text-2xl sm:text-3xl font-bold text-center text-pongblue">Reset Your Password</h1>
		<p class="text-center">Enter a new <b>Strong</b> password below to change your password.</p>
	  </div>
	  <form class="flex flex-col gap-3">
		<div class="flex flex-col gap-1 px-1">
			<label for="password" class="text-base font-medium text-gray-700">Password</label>
			<div class="relative">
				<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
					<i class="bx bx-lock-alt text-lg"></i>
				</span>
				<input type="password" id="password" placeholder="${t('register.signup.passwordPlaceholder')}" autocomplete="current-password" name="password"
				class="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
				<span class="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer toggle-password">
					<i class='bx bx-hide hide-show text-lg text-gray-500'></i>
				</span>
			</div>
		</div>
	
		<div class="flex flex-col gap-1 px-1">
			<label for="conf-password" class="text-base font-medium text-gray-700">${t('register.signup.passwordConfirmTitle')}</label>
			<div class="relative">
				<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
					<i class="bx bx-lock-alt text-lg"></i>
				</span>
				<input type="password" id="conf-password" placeholder="${t('register.signup.passwordConfirm')}" autocomplete="current-password" name="password"
				class="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
				<span class="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer toggle-password">
					<i class='bx bx-hide hide-show text-lg text-gray-500'></i>
				</span>
			</div>
		</div>

		<!-- ChangePassword Button -->
	  </form>
	</div>
	`;
	const formElement: HTMLFormElement = form.querySelector('form')!;
	const passwordInput: HTMLInputElement = form.querySelector('#password')!;
	const confirmPasswordInput: HTMLInputElement = form.querySelector('#conf-password')!;

	const ChangePassButton = Button({
		type: 'submit',
		text: 'Change Password',
		styles: 'w-full font-semibold p-2 text-base text-white rounded-lg',
		eventType: 'click',
		onClick: async(e: Event) => {
			e.preventDefault();
			try {
				const uuid = params["uuid"];
				const body = {
					password: passwordInput.value,
					verifyPassword: confirmPasswordInput.value
				};
				await axios.post(`https://localhost:8001/auth/resetPassword/reset/${uuid}`, body, {headers: {"x-api-key": import.meta.env.VITE_AUTHENTICATION_API_KEY}});
				Toast.show("Password changed successfully!", "success");
				navigate("/register");
			}
			catch (error: any) {
				if (error.response) {
					if (error.response.status === 404 || error.response.status === 403 || error.response.status === 400)
						Toast.show(`Error: ${error.response.data.message}`, "error");
					else if (error.response.status === 500)
						Toast.show(`Server error: ${error.response.data.error}`, "error");
					else
						Toast.show(`Unexpected error: ${error.response.data}`, "error");
				} else if (error.request)
					Toast.show(`No response from server: ${error.request}`, "error");
				else
					Toast.show(`Error setting up request: ${error.message}`, "error");
			}
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