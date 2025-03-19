import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";
import { Button } from "../partials/Button.js";
import axios from "axios";
import store from "../../../store/store.js";
import { navigate } from "../../router.js";

interface TwoFactorSendProps {
	onSwitchToSignIn: () => void,
}

export const TwoFactorSend = createComponent((props: TwoFactorSendProps) => {
	const form = document.createElement('div');
	form.className = `w-[93vw] sm:w-96 xl:w-[30vw] bg-white rounded-lg p-4 sm:p-8`;
	form.innerHTML = `
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl sm:text-3xl font-bold text-center text-pongblue">${t("register.twoFactor.title")}</h1>
				<p class="text-center">${t("register.twoFactor.info")}</p>
			</div>
			<form class="flex flex-col gap-4">
				<div id="auth-code" class="flex gap-4 justify-center">
					<input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					<input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
				</div>
			</form>
			<div class="w-full text-center">
				<span class="signin-link hover:cursor-pointer hover:underline text-pongblue">${t('register.sendEmail.backToSignin')} </span>
			</div>
		</div>
	`;
	const formElement: HTMLFormElement = form.querySelector('form')!;
	const verifyButton = Button({
		type: 'submit',
		text: t("register.twoFactor.verifyBtn"),
		styles: 'w-full font-semibold p-2 text-base text-white rounded-lg',
		eventType: 'click',
		onClick: async (e: Event) => {
			e.preventDefault();
			let code = Array.from(inputs).map(input => input.value).join('');
			console.log("Entered code:", code);
			inputs.forEach(input => { input.value = "" });
			requestAnimationFrame(() => { inputs[0].focus() });
			const body = {
				code: code
			};
			try {
				await axios.post(`http://localhost:8001/auth/twoFactor/login/${store.sessionId}`, body);
				console.log("two factor authentication validation complete!");
				navigate("/play");
			} catch (err: any) {
				if (err.response) {
					if (err.response.status === 400 || err.response.status === 403 || err.response.status === 404)
						console.error("Error: ", err.response.data.message);
					else if (err.response.status === 500)
						console.error("Server error:", err.response.data.error);
					else
						console.error("Unexpected error:", err.response.data);
				}
				else if (err.request)
					console.error("No response from server:", err.request);
				else
					console.error("Error setting up request:", err.message);
			}
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

	const inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll("#auth-code input");

	// Auto-focus the first input on page load
	if (inputs.length) {
		requestAnimationFrame(() => {
			inputs[0].focus();
			inputs[0].select(); // Optional: highlight text for better UX
		});
	}

	inputs.forEach((input, index) => {
		// Handle input to move to next field
		input.addEventListener("input", (e: Event) => {
			const target = e.target as HTMLInputElement;
			const value = target.value;

			if (!/^\d$/.test(value)) {
				target.value = "";
				return;
			}

			if (value.length >= 1 && index < inputs.length - 1) {
				inputs[index + 1].focus();
			}

			const allFilled = Array.from(inputs).every(input => input.value.length === 1);
			if (allFilled)
				formElement.requestSubmit();
		});

		// Handle backspace to move to previous field
		input.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Backspace" && input.value === "" && index > 0)
				inputs[index - 1].focus();
		});
	});

	form.addEventListener("submit", (e: Event) => {
		e.preventDefault();
		let code = Array.from(inputs).map(input => input.value).join('');
		console.log("Entered code:", code);
		// TODO: Send the 'code' to your server for verification
	});

	return form;
})