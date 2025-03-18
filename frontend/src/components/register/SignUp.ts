import { createComponent, useCleanup } from "../../utils/StateManager.js";
import { Button } from "../partials/Button.js";
import { msg } from "../../languages/LanguageController.js";
import axios from "axios";
import { navigate } from "../../router.js";

interface SignUpProps {
	styles: string,
	onSwitchToSignIn: () => void
}

export const SignUp = createComponent((props: SignUpProps) => {
	const form = document.createElement('div');
	form.className = `flex flex-col justify-center items-center gap-5 w-[93vw] xl:w-[40vw] h-dvh 2xl:h-fit mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 ${props.styles || ''}`;
	form.innerHTML = `
    <div class="flex flex-col w-full gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-center text-pongblue">${msg('register.signup.title')}</h1>
      
      <!-- Form area - scrollable only on mobile -->
      <form class="flex flex-col gap-2 pb-2">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-1 w-full overflow-y-auto max-h-[300px] md:max-h-none">
			<div class="flex flex-col gap-1 px-1">
				<label for="email" class="text-base font-medium text-gray-700">Email</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
					<i class="bx bx-envelope text-lg"></i>
					</span>
					<input type="email" id="email" placeholder="${msg('register.signup.emailPlaceholder')}" autocomplete="email" name="email" 
					class="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
				</div>
			</div>
			
			<div class="flex flex-col gap-1 px-1">
				<label for="nickname" class="text-base font-medium text-gray-700">Nickname</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
						<i class="bx bx-user text-lg"></i>
					</span>
					<input type="text" id="nickname" placeholder="Your Nickname here" autocomplete="off" 
					class="nickname w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
				</div>
			</div>

			<div class="flex flex-col gap-1 px-1">
				<label for="password" class="text-base font-medium text-gray-700">Password</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
						<i class="bx bx-lock-alt text-lg"></i>
					</span>
					<input type="password" id="password" placeholder="${msg('register.signup.passwordPlaceholder')}" autocomplete="current-password" name="password"
					class="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
					<span class="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer toggle-password">
						<i class='bx bx-hide hide-show text-lg text-gray-500'></i>
					</span>
				</div>
			</div>
			
			<div class="flex flex-col gap-1 px-1">
				<label for="conf-password" class="text-base font-medium text-gray-700">${msg('register.signup.passwordConfirmTitle')}</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
						<i class="bx bx-lock-alt text-lg"></i>
					</span>
					<input type="password" id="conf-password" placeholder="${msg('register.signup.passwordConfirm')}" autocomplete="current-password" name="password"
					class="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
					<span class="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer toggle-password">
						<i class='bx bx-hide hide-show text-lg text-gray-500'></i>
					</span>
				</div>
			</div>

			<div class="flex flex-col gap-1 px-1">
				<label for="fullname" class="text-base font-medium text-gray-700">Full name</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
						<i class="bx bx-id-card text-lg"></i>
					</span>
					<input type="text" id="fullname" placeholder="Your Name here (first last)" autocomplete="off" 
					class="full-name w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
				</div>
			</div>
			
			<div class="flex flex-col gap-1 px-1">
				<label for="age" class="text-base font-medium text-gray-700">Age</label>
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
						<i class="bx bx-cake text-lg"></i>
					</span>
					<input type="number" id="age" placeholder="Your Age here" autocomplete="off" 
					class="age w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue">
				</div>
			</div>

			<div class="flex flex-col gap-1 px-1">
			<!-- coutry selection here -->
				<label for="country" class="text-base font-medium text-gray-700">Country</label>
				<div class="relative">
				<span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
					<i class="bx bx-globe text-lg"></i>
				</span>
				<select id="country" name="country" 
					class="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue appearance-none bg-white">
					<option value="" disabled selected>Select your country</option>
					<option value="AF">Afghanistan</option>
					<option value="AL">Albania</option>
					<option value="DZ">Algeria</option>
					<option value="AR">Argentina</option>
					<option value="AU">Australia</option>
					<option value="AT">Austria</option>
					<option value="BE">Belgium</option>
					<option value="BR">Brazil</option>
					<option value="CA">Canada</option>
					<option value="CN">China</option>
					<option value="CO">Colombia</option>
					<option value="EG">Egypt</option>
					<option value="FR">France</option>
					<option value="DE">Germany</option>
					<option value="IN">India</option>
					<option value="ID">Indonesia</option>
					<option value="IT">Italy</option>
					<option value="JP">Japan</option>
					<option value="KR">South Korea</option>
					<option value="MX">Mexico</option>
					<option value="NL">Netherlands</option>
					<option value="NZ">New Zealand</option>
					<option value="NG">Nigeria</option>
					<option value="NO">Norway</option>
					<option value="PK">Pakistan</option>
					<option value="PH">Philippines</option>
					<option value="PL">Poland</option>
					<option value="PT">Portugal</option>
					<option value="RU">Russia</option>
					<option value="SA">Saudi Arabia</option>
					<option value="SG">Singapore</option>
					<option value="ZA">South Africa</option>
					<option value="ES">Spain</option>
					<option value="SE">Sweden</option>
					<option value="CH">Switzerland</option>
					<option value="TH">Thailand</option>
					<option value="TR">Turkey</option>
					<option value="UA">Ukraine</option>
					<option value="AE">United Arab Emirates</option>
					<option value="GB">United Kingdom</option>
					<option value="US">United States</option>
				</select>
				<span class="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 pointer-events-none">
					<i class="bx bx-chevron-down text-lg"></i>
				</span>
			</div>
		</div>
		</div>
		</div>
		<!-- Sign Up Button will be inserted here -->
      </form>
      
      <div class="flex items-center w-full">
        <div class="flex-1 border-t border-gray-300"></div>
        <div class="px-4 text-sm text-gray-500">OR</div>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>
      
      <div class="flex flex-col w-full gap-3">
        <a class="flex items-center justify-center gap-2 w-full py-2 bg-pongblue text-white rounded-lg hover:cursor-pointer hover:bg-opacity-90 transition-all duration-300">
          <i class='bx bxl-google text-xl'></i>
          <span>${msg('register.continueGoogle')}</span>
        </a>

        <div class="text-center text-gray-600">
          ${msg('register.signup.acc_question')} 
          <span class="signin-link hover:cursor-pointer text-pongblue font-medium hover:underline">
            ${msg('register.signup.signin_btn')}
          </span>
        </div>
      </div>
    </div>
  `;

	const formElement = form.querySelector('form')!;
	const emailInput = form.querySelector('#email') as HTMLInputElement;
	const passwordInput = form.querySelector('#password') as HTMLInputElement;
	const confirmPasswordInput = form.querySelector('#conf-password') as HTMLInputElement;
	const nickname = form.querySelector("#nickname") as HTMLInputElement;
	const fullname = form.querySelector("#fullname") as HTMLInputElement;
	const age = form.querySelector("#age") as HTMLInputElement;
	//   const 
	const signUpButton = Button({
		type: 'submit',
		text: msg('register.signup.signup_btn'),
		styles: 'w-full font-semibold p-2 text-base text-white bg-pongblue rounded-lg hover:bg-opacity-90 transition-all duration-300',
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
				console.log("Check your email for an activation message");
				navigate('/'); // You can edit it
			} catch (err: any) {
				if (err.response) {
					if (err.response.status === 400) {
						const msg = err.response.data.message;
						console.log(msg);
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

	const togglePasswordElements = form.querySelectorAll('.toggle-password');
	const eyeIcons = form.querySelectorAll('.hide-show');

	const handleTogglePassword = (e: Event) => {
		e.preventDefault();
		const isPasswordVisible = passwordInput.type === 'text';

		passwordInput.type = isPasswordVisible ? 'password' : 'text';
		confirmPasswordInput.type = passwordInput.type;

		eyeIcons.forEach(icon => {
			icon.classList.remove('bx-show', 'bx-hide');
			icon.classList.add(isPasswordVisible ? 'bx-hide' : 'bx-show');
		});
	};

	togglePasswordElements.forEach(element => {
		element.addEventListener('click', handleTogglePassword);
		useCleanup(() => element.removeEventListener('click', handleTogglePassword));
	});

	return form;
});
