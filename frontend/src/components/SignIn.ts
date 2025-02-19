import { Button } from './Button.js';
import { createComponent, useCleanup } from '../utils/StateManager.js';
import { navigate } from '../router.js';
import { validateEmail, validatePassword } from '../utils/FormValidation.js';
import { msg } from '../languages/LanguageController.js';

interface SignInProps {
  styles: string,
  onSwitchToSignUp: () => void,
  onSwitchToResetPass: () => void,
}

export const SignIn = createComponent((props: SignInProps) => {
  const form = document.createElement('div');
  form.className = `w-[93vw] sm:w-96 xl:w-[30vw] bg-white rounded-lg p-4 sm:p-8 ${props.styles || ''}`;
  form.innerHTML = `
  <div class="flex flex-col gap-3">
    <h1 class="text-2xl font-bold text-center underline">${msg('register.signin.title')}</h1>
    <form class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <label for="email" class="block text-base font-medium text-gray-700">Email</label>
        <input type="email" id="email" placeholder="${msg('register.signin.emailPlaceholder')}" autocomplete="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:shadow-[0_0_5px_var(--main-color)] focus:border-[var(--main-color)] sm:text-base">
      </div>
      <div>
        <label for="password" class="block text-base font-medium text-gray-700">${msg('register.signin.password')}</label>
        <div class="relative mt-1">
          <div>
            <input type="password" id="password" placeholder="${msg('register.signin.passwordPlaceholder')}" autocomplete="current-password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:shadow-[0_0_5px_var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
          </div>
          <span class="absolute inset-y-0 right-0 flex items-center h-fit py-3 pr-3 cursor-pointer toggle-password text-lg">
            <i class='bx bx-hide hide-show pointer-events-none'></i>
          </span>
        </div>
      </div>
    <div class="flex items-center justify-end w-full forgot">
      <!-- Forgot Password Button -->
    </div>
    <!-- Sign In Button -->
    </form>
    <div class="w-full text-center pt-1">
      ${msg('register.signin.acc_question')} <span class="signup-link hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]">${msg('register.signin.signup_btn')}</span>
    </div>
    </div>
  `;
  const formElement:HTMLFormElement = form.querySelector('form')!;
  const emailInput:HTMLInputElement = form.querySelector('#email')!;
  const passwordInput:HTMLInputElement = form.querySelector('#password')!;

  const signInButton = Button({
    type: 'submit',
    text: msg('register.signin.signin_btn'),
    styles: 'w-full font-semibold p-2 text-base text-white',
    eventType: 'click',
    onClick: (e: Event) => {
      if (!validateEmail(emailInput) || !validatePassword(passwordInput))
	  		e.preventDefault();
      else
  			console.log('email and pass are nice!');
    }
  });
  formElement.appendChild(signInButton);

  const forgotBtn = Button({
	type: 'button',
	text: msg('register.signin.forgotpass'),
	styles: 'bg-white text-[var(--main-color)] p-0 rounded-none',
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
  const eyeIcon:HTMLElement = togglePassword.querySelector('.hide-show')!;
  const handleTogglePassword = (e: Event) => {
    e.preventDefault();
    const wasPassword = passwordInput.type === 'password';
    passwordInput.type = wasPassword ? 'text' : 'password';
    eyeIcon.classList.remove('bx-show', 'bx-hide');
    eyeIcon.classList.add(wasPassword ? 'bx-show' : 'bx-hide');
  };

  togglePassword.addEventListener('click', handleTogglePassword);
  useCleanup(() => togglePassword.removeEventListener('click', handleTogglePassword))
  return form;
});