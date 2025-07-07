import { Button } from '../partials/Button.js';
import { createComponent, useCleanup } from '../../utils/StateManager.js';
import { t } from '../../languages/LanguageController.js';
import axios from 'axios';
import { navigate } from '../../router.js';
import store from '../../../store/store.js';
import { jwtDecode } from "jwt-decode";
import Toast from '../../toast/Toast.js';
import { handleLoginWithGoogle, initializeApp } from '../../main.js';

interface SignInProps {
	styles: string,
	onSwitchToSignUp: () => void,
	onSwitchToResetPass: () => void,
}

export const SignIn = createComponent((props: SignInProps) => {
	const form = document.createElement('div');
	form.className = `flex flex-col justify-center gap-3 w-[93vw] sm:w-96 xl:w-[30vw] bg-white rounded-lg p-4 sm:p-8 ${props.styles || ''}`;
	form.innerHTML = `
  	<div class="flex flex-col gap-3">
    	<h1 class="text-2xl sm:text-3xl font-bold text-center text-pongcyan">${t('register.signin.title')}</h1>
		<form class="flex flex-col gap-2">
			<div class="flex flex-col gap-1 px-1">
				<label for="email" class="text-base font-medium text-gray-700">Email</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
					<i class="bx bx-envelope text-lg"></i>
					</span>
					<input type="email" id="email" placeholder="${t('register.signup.emailPlaceholder')}" autocomplete="email" name="email" 
					class="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongcyan focus:outline-none focus:ring-1 focus:ring-pongcyan focus:border-pongcyan">
				</div>
			</div>

			<div class="flex flex-col gap-1 px-1">
				<label for="password" class="text-base font-medium text-gray-700">${t("register.signin.password")}</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
						<i class="bx bx-lock-alt text-lg"></i>
					</span>
					<input type="password" id="password" placeholder="${t('register.signup.passwordPlaceholder')}" autocomplete="current-password" name="password"
					class="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongcyan focus:outline-none focus:ring-1 focus:ring-pongcyan focus:border-pongcyan">
					<span class="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer toggle-password">
						<i class='bx bx-hide hide-show text-lg text-gray-500'></i>
					</span>
				</div>
			</div>

			<div class="flex items-center justify-end w-full forgot">
			<!-- Forgot Password Button -->
			</div>
			<!-- Sign In Button -->
		</form>

		<div class="flex items-center w-full">
			<div class="flex-1 border-t border-gray-300"></div>
			<div class="px-4 text-sm text-gray-500">${t("register.or")}</div>
			<div class="flex-1 border-t border-gray-300"></div>
      	</div>
    </div>
	<div class="flex flex-col gap-3" id="google-btn">
		<button id="google-sign" class="w-full flex items-center gap-2 justify-center py-2 text-white bg-pongcyan hover:cursor-pointer hover:opacity-80 rounded-md transition-all duration-300">
			<i class='bx bxl-google text-2xl'></i>
			<span class="text-center">${t('register.continueGoogle')}</span>
		</button>
		<div class="w-full text-center">
			${t('register.signin.acc_question')} <span class="signup-link hover:cursor-pointer hover:underline text-pongcyan">${t('register.signin.signup_btn')}</span>
		</div>
	</div>
  `;
	const formElement: HTMLFormElement = form.querySelector('form')!;
	const emailInput: HTMLInputElement = form.querySelector('#email')!;
	const passwordInput: HTMLInputElement = form.querySelector('#password')!;

	const handleLogin = async (emailData: string, passwordData: string) => {
		try {
			const data = {
				email: emailData,
				password: passwordData
			};
			const signIn = await axios.post("/authentication/auth/login", data, {withCredentials: true, headers: { 'Skip-Auth-Interceptor': 'true' }});
			if (signIn.data.require2FA == false) {
				if (signIn.data.accessToken) {
					const decodedToken: any = jwtDecode(signIn.data.accessToken);
					
					store.setUserData({
						userId: decodedToken.userId,
						email: decodedToken.email,
						nickname: decodedToken.nickname,
						fullName: decodedToken.fullName,
						age: decodedToken.age,
						language: decodedToken.language || 'en',
						country: decodedToken.country,
						createdAt: decodedToken.createdAt,
						avatarUrl: decodedToken.avatarUrl,
						is2faEnabled: decodedToken.is2fa,
						accessToken: signIn.data.accessToken,
					});
					store.update("sessionUUID", signIn.data.sessUUID);
					
					navigate("/");
					initializeApp();
					Toast.show(`Login successful, Welcome ${decodedToken.fullName}!`, "success");
				}
			}
				else {
				store.update("sessionUUID", signIn.data.sessUUID);
				navigate("/register/twofactor");
				Toast.show("First step is complete! Now moving to the 2fa code validation", "success");
			}

		} catch (error: any) {
			if (error.response) {
				if (error.response.status === 404 || error.response.status === 403)
					Toast.show(`Error: ${error.response.data.message}`, "error");
				else if (error.response.status === 500)
					Toast.show(`Server error: ${error.response.data.error}`, "error");
				else
					Toast.show(`Unexpected error: ${error.response.data}`, "error");
			} else if (error.request)
				Toast.show(`No response from server: ${error.request}`, "error");
			else
				Toast.show(`Error setting up the request: ${error.message}`, "error");
			console.log(error);	
		}
	};

	const signInButton = Button({
		type: 'submit',
		text: t('register.signin.signin_btn'),
		styles: 'w-full font-semibold p-2 text-base text-white rounded-lg',
		eventType: 'click',
		onClick: async (e: Event) => {
			e.preventDefault();
			await handleLogin(emailInput.value, passwordInput.value);
		}
	});
	formElement.appendChild(signInButton);

	const forgotBtn = Button({
		type: 'button',
		text: t('register.signin.forgotpass'),
		styles: 'bg-white text-pongcyan p-0 rounded-none hover:opacity-100 hover:underline',
		eventType: 'click',
		onClick: (e: Event) => {
			e.preventDefault()
			if (props.onSwitchToResetPass)
				props.onSwitchToResetPass()
		}
	})
	form.querySelector('.forgot')!.appendChild(forgotBtn)

	const signupLink = form.querySelector('.signup-link')!;
	signupLink.addEventListener('click', (e) => {
		e.preventDefault();
		if (props.onSwitchToSignUp) {
			props.onSwitchToSignUp();
		}
	});

	const togglePassword: HTMLElement = form.querySelector('.toggle-password')!;
	const eyeIcon: HTMLElement = togglePassword.querySelector('.hide-show')!;
	const handleTogglePassword = (e: Event) => {
		e.preventDefault();
		const wasPassword = passwordInput.type === 'password';
		passwordInput.type = wasPassword ? 'text' : 'password';
		eyeIcon.classList.remove('bx-show', 'bx-hide');
		eyeIcon.classList.add(wasPassword ? 'bx-show' : 'bx-hide');
	};

	handleLoginWithGoogle(form)
	togglePassword.addEventListener('click', handleTogglePassword);
	useCleanup(() => togglePassword.removeEventListener('click', handleTogglePassword))
	return form;
});