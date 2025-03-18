import { createComponent, useCleanup } from "../../utils/StateManager.js";
import { Button } from "../partials/Button.js";
import { validateConfirmPassword, validateEmail, validatePassword } from "../../utils/FormValidation.js";
import { msg } from "../../languages/LanguageController.js";
import { SignIn } from "./SignIn.js";
import axios from "axios";
import { navigate } from "../../router.js";

interface SignUpProps {
	styles: string,
	onSwitchToSignIn: () => void
}

export const SignUp = createComponent((props: SignUpProps) => {
	const form = document.createElement('div')
	form.className = `flex flex-col justify-center gap-5 w-[93vw] sm:w-96 bg-white rounded-lg p-4 sm:p-8  ${props.styles || ''}`;
	form.innerHTML = `
	<div class="flex flex-col gap-3 sm:gap-5">
	  <h1 class="text-2xl font-bold text-center underline">${msg('register.signup.title')}</h1>
	  <form class="flex flex-col gap-2 sm:gap-3 max-h-[calc(202px+1rem)] sm:max-h-[calc(202px+35px)] overflow-y-auto">
		<div class="flex flex-col gap-1">
		  <label for="email" class="block text-base font-medium text-gray-700">Email</label>
		  <input type="email" id="email" placeholder="${msg('register.signup.emailPlaceholder')}" autocomplete="email" name="email" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pongblue focus:shadow-[0_0_5px_pongblue] focus:border-pongblue sm:text-base">
		</div>
		<div>
		  <label for="password" class="block text-base font-medium text-gray-700">Password</label>
		  <div class="relative sm:mt-1">
		  	<div>
				<input type="password" id="password" placeholder="${msg('register.signup.passwordPlaceholder')}" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pongblue focus:shadow-[0_0_5px_pongblue] focus:border-pongblue sm:text-base pr-10">
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
				<input type="password" id="conf-password" placeholder="${msg('register.signup.passwordConfirm')}" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pongblue focus:border-pongblue focus:shadow-[0_0_5px_pongblue] sm:text-base pr-10">
			</div>
			<span class="absolute inset-y-0 right-0 flex items-center h-fit py-3 pr-3 cursor-pointer toggle-password text-lg">
				<i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
			</div>
	  	</div>
		<div class="flex flex-col gap-1">
			<label for="nickname" class="block text-base font-medium text-gray-700">Nickname</label>
			<input type="text" id="nickname" placeholder="Your Nickname here" autocomplete="off" class="nickname relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pongblue focus:border-pongblue sm:text-base focus:shadow-[0_0_5px_pongblue]">
		</div>
		<div class="flex flex-col gap-1">
			<label for="fullname" class="block text-base font-medium text-gray-700">Full name</label>
			<input type="text" id="fullname" placeholder="Your Name here (first last)" autocomplete="off" class="full-name relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pongblue focus:border-pongblue sm:text-base focus:shadow-[0_0_5px_pongblue]">
		</div>
		<div class="flex flex-col gap-1">
			<label for="age" class="block text-base font-medium text-gray-700">Age</label>
			<input type="age" id="age" placeholder="Your Age here" autocomplete="off" class="age relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pongblue focus:border-pongblue sm:text-base focus:shadow-[0_0_5px_pongblue]">
	  	</div>
		<!-- SignUp Button -->
	  </form>
	  <div class="w-full text-center">
	  	${msg('register.signup.acc_question')} <span class="signin-link hover:cursor-pointer hover:opacity-80 text-pongblue">${msg('register.signup.signin_btn')}</span>
	  </div>
	</div>
	<div class="flex flex-col">
		<div class="w-full p-1">
			<a class="w-full flex items-center justify-start p-1 sm:p-2 text-white bg-pongblue hover:cursor-pointer hover:opacity-80 rounded-md transition-all duration-300">
				<i class='bx bxl-google text-2xl'></i>
				<span class="flex-1 text-center">${msg('register.continueGoogle')}</span>
			</a>
		</div>	
	</div>
	`;
	// signup_btn
	// acc_question
	// signin_btn
	const formElement: HTMLFormElement = form.querySelector('form')!;
	const emailInput: HTMLInputElement = form.querySelector('#email')!;
	const passwordInput: HTMLInputElement = form.querySelector('#password')!;
	const confirmPasswordInput: HTMLInputElement = form.querySelector('#conf-password')!;
	const nickname: HTMLInputElement = form.querySelector("#nickname")!
	const fullname: HTMLInputElement = form.querySelector("#fullname")!
	const age: HTMLInputElement = form.querySelector("#age")!

	const signUpButton = Button({
		type: 'submit',
		text: msg('register.signup.signup_btn'),
		styles: 'w-full font-semibold p-2 text-base text-white',
		eventType: 'click',
		onClick: async (e: MouseEvent) => {
			e.preventDefault();
			try {
				const body = {
					email: emailInput.value,
					password: passwordInput.value,
					nickname: nickname.value,
					full_name: fullname.value,
					age: age.value,
					country: "Lebanon",
					google_id: null
				};
				await axios.post("http://localhost:8001/auth/users", body);
				console.log("Check your email for an activation messsage");
				navigate('/'); // You can edit it
			} catch (err: any) {
				if (err.response) {
					if (err.response.status === 400) {
						const msg = err.response.data.message;
						console.log(msg)
					}
					else if (err.response.status === 500) {
						console.error("Server error:", err.response.data.error);
					} else {
						console.error("Unexpected error:", err.response.data);
					}
				}
				else if (err.request) {
					console.error("No response from server:", err.request);
				} else {
					console.error("Error setting up request:", err.message);
				}
			}
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