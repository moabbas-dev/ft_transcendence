import { createComponent } from "../../utils/StateManager.js";
import { msg } from "../../languages/LanguageController.js";
import { Button } from "../partials/Button.js";

interface TwoFactorSendProps {
	onSwitchToSignIn: () => void,
}

export const TwoFactorSend = createComponent((props: TwoFactorSendProps) => {
	const form = document.createElement('div');
	form.className = `w-[93vw] sm:w-96 xl:w-[30vw] bg-white rounded-lg p-4 sm:p-8`;
	form.innerHTML = `
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-bold text-center underline">Two-Factor Authentication</h1>
				<p class="text-center">Enter the 6-digits code from your authenticator app</p>
			</div>
			<form class="flex flex-col gap-4">
				<div id="auth-code" class="flex gap-4">
					<input type="text" class="size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
				</div>
			</form>
			<div class="w-full text-center">
				<span class="signin-link hover:cursor-pointer hover:opacity-80 text-pongblue">${msg('register.sendEmail.backToSignin')} </span>
			</div>
		</div>
	`;
	const formElement:HTMLFormElement = form.querySelector('form')!;
	const verifyButton = Button({
		type: 'submit',
		text: 'Verify',
		styles: 'w-full font-semibold p-2 text-base text-white',
		eventType: 'click',
		onClick: (e: Event) => {
			e.preventDefault();
		}
	  });
	formElement.appendChild(verifyButton);

	const signinLink = form.querySelector('.signin-link')!;
	signinLink.addEventListener('click', (e) => {
		e.preventDefault();
		if (props.onSwitchToSignIn) {
			props.onSwitchToSignIn();
		}
	});

	document.addEventListener('DOMContentLoaded', () => {
		const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll("#auth-code input");

		// Auto-focus the first input on page load
		if (inputs.length) {
			inputs[0].focus();
		}

		inputs.forEach((input, index) => {
			// Handle input to move to next field
			input.addEventListener("input", (e: Event) => {
				const value = (e.target as HTMLInputElement).value;
				if (value.length >= 1 && index < inputs.length - 1) {
					inputs[index + 1].focus();
				}
			});

			// Handle backspace to move to previous field
			input.addEventListener("keydown", (e: KeyboardEvent) => {
				if (e.key === "Backspace" && input.value === "") {
					if (index == inputs.length - 1) {
						inputs[0].focus();
						console.log("FFFFFF");
					}
					else if (index > 0)
						inputs[index - 1].focus();
				}
			});
		});

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			let code = "";
			inputs.forEach(input => {
			  code += input.value;
			});
			console.log("Entered code:", code);
			// TODO: Send the 'code' to your server for verification
		});
	});


	return form;
})