import { Button } from './Button.js';
import { createComponent, useCleanup } from '../utils/StateManager.js';
import { navigate } from '../router.js';

export const SignIn = createComponent((props) => {
  const form = document.createElement('div');
  form.className = `w-[93vw] sm:w-100 bg-white p-4 sm:p-8 rounded-lg shadow-md ${props.styles || ''}`;
  form.innerHTML = `
  <div class="flex flex-col gap-5">
    <h1 class="text-2xl font-bold text-center underline">Welcome Back!</h1>
    <form class="flex flex-col gap-2">
      <div>
        <label for="email" class="block text-base font-medium text-gray-700">Email</label>
        <input type="email" id="email" autocomplete="email" name="email" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base">
      </div>
      <div>
        <label for="password" class="block text-base font-medium text-gray-700">Password</label>
        <div class="relative mt-1">
          <input type="password" id="password" autocomplete="current-password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
          <span class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer toggle-password text-lg">
            <i class='bx bx-hide hide-show pointer-events-none'></i>
          </span>
        </div>
      </div>
    <div class="flex items-center justify-end w-full forgot">
      <!-- Forgot Password Button -->
    </div>
    <!-- Sign In Button -->
    </form>
    <div class="w-full text-center pt-2">
      Don't have an Account? <span class="signup-link hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]">Let's SignUp</span>
    </div>
    </div>
  `;
  const formElement = form.querySelector('form');
  const emailInput = form.querySelector('#email');
  const passwordInput = form.querySelector('#password');

  const signInButton = Button({
    type: 'submit',
    text: 'Sign In',
    styles: 'w-full font-semibold p-2 text-base text-white',
    eventType: 'click',
    onClick: (e) => {
      e.preventDefault();
	  console.log('Input values:', emailInput.value);
    }
  });
  formElement.appendChild(signInButton);

  const forgotBtn = Button({
	type: 'button',
	text: 'forgot password?',
	styles: 'bg-white text-[var(--main-color)] p-0 rounded-none',
	eventType: 'click',
	onClick: (e) => {
		e.preventDefault()
		navigate('/resetpass')
	}
  })
  form.querySelector('.forgot').appendChild(forgotBtn)

  const signupLink = form.querySelector('.signup-link');
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (props.onSwitchToSignUp) {
      props.onSwitchToSignUp();
    }
  });

  const togglePassword = form.querySelector('.toggle-password');
  const eyeIcon = togglePassword.querySelector('.hide-show');
  const handleTogglePassword = (e) => {
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