import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";
import { Button } from "../partials/Button.js";
import axios from "axios";
import Toast from "../../toast/Toast.js";

interface SendEmailProps {
	onSwitchToSignIn: () => void,
}

export const SendEmail = createComponent((props: SendEmailProps) => {
	const form = document.createElement('div');
	form.className = `w-[93vw] sm:w-96 xl:w-[30vw] bg-white rounded-lg p-4 sm:p-8`;
	form.innerHTML = `
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl sm:text-3xl font-bold text-center text-pongblue">${t('register.sendEmail.resetPass')}</h1>
				<p class="text-center">${t('register.sendEmail.info')}</p>
			</div>
			<form class="flex flex-col gap-2">
				<label for="email" class="text-base font-medium text-gray-700">Email</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
					<i class="bx bx-envelope text-lg"></i>
					</span>
					<input type="email" id="email" placeholder="${t('register.signup.emailPlaceholder')}" autocomplete="email" name="email" 
					class="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
				</div>
			</form>
			<div class="w-full text-center">
				<span class="signin-link hover:cursor-pointer hover:underline text-pongblue">${t('register.sendEmail.backToSignin')} </span>|
				<span class="resend-email hover:cursor-pointer hover:underline text-pongblue"> ${t('register.sendEmail.resendEmail')}</span>
			</div>
		</div>
	`;
	const formElement: HTMLFormElement = form.querySelector('form')!;
	const emailInput: HTMLInputElement = form.querySelector('#email')!;
	const signInButton = Button({
		type: 'submit',
		text: t('register.sendEmail.sendEmailBtn'),
		styles: 'w-full font-semibold p-2 text-base text-white rounded-lg',
		eventType: 'click',
		onClick: async (e: Event) => {
			e.preventDefault();
			try {
				const body = {
					email: emailInput.value
				};
				await axios.post(`http://localhost:8001/auth/resetPassword/email`, body);
				Toast.show("Email found! Email message sent successfully!", "success");
			} catch (err: any) {
				if (err.response) {
					if (err.response.status === 404 || err.response.status === 403)
						Toast.show(`Error: ${err.response.data.message}`, "error");
					else if (err.response.status === 500)
						Toast.show(`Server error: ${err.response.data.error}`, "error");
					else
						Toast.show(`Unexpected error: ${err.response.data}`, "error");
				}
				else if (err.request)
					Toast.show(`No response from server: ${err.request}`, "error");
				else
					Toast.show(`Error setting up request: ${err.message}`, "error");
			}
		}
	});
	formElement.appendChild(signInButton);

	const signinLink = form.querySelector('.signin-link')!;
	signinLink.addEventListener('click', (e) => {
		e.preventDefault();
		if (props.onSwitchToSignIn) {
			props.onSwitchToSignIn();
		}
	});

	const resendEmail = form.querySelector('.resend-email')!
	resendEmail.addEventListener('click', () => {
		// Resend Email Here
	})
	return form;
})