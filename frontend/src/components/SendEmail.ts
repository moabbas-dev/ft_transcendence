import { createComponent } from "../utils/StateManager.js";
import { msg } from "../languages/LanguageController.js";
import { Button } from "./Button.js";
import { validateEmail } from "../utils/FormValidation.js";

interface SendEmailProps {
	onSwitchToSignIn: () => void,
}

export const SendEmail = createComponent((props: SendEmailProps) => {
	const form = document.createElement('div');
	form.className = `w-[93vw] sm:w-96 xl:w-[30vw] bg-white rounded-lg p-4 sm:p-8`;
	form.innerHTML = `
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-bold text-center underline">Reset Your Password</h1>
				<p class="">Enter the email associated with your account and will send you password reset instructions.</p>
			</div>
			<form class="flex flex-col gap-2">
				<div>
					<label for="email" class="block text-base font-medium text-gray-700">Email</label>
					<div>
						<input type="email" id="email" placeholder="${msg('register.signin.emailPlaceholder')}" autocomplete="email" name="email" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base">
					</div>
				</div>
			</form>
			<div class="w-full text-center pt-1">
				<span class="signin-link hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]">Back to signin </span>|
				<span class="resend-email hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]"> Resend Email</span>
			</div>
		</div>
	`;
	const formElement:HTMLFormElement = form.querySelector('form')!;
	const emailInput:HTMLInputElement = form.querySelector('#email')!;
	const signInButton = Button({
		type: 'submit',
		text: 'Send Email',
		styles: 'w-full font-semibold p-2 text-base text-white',
		eventType: 'click',
		onClick: (e: Event) => {
		  if (!validateEmail(emailInput))
	    	e.preventDefault();
		  else
			console.log('email and pass are nice!');
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
	resendEmail.addEventListener('click', (e:Event) => {
		// Resend Email Here
	})
	return form;
})