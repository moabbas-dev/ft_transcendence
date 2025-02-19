import { msg } from "../languages/LanguageController.js";
import { validateAge, validateFullName, validateNickname } from "../utils/FormValidation.js";
import { createComponent } from "../utils/StateManager.js";
import { Button } from "./Button.js";

export const UserInfoForm = createComponent(() => {
	const form = document.createElement('div')
	form.className = `w-[93vw] sm:w-96 bg-white rounded-lg p-4 sm:p-8`;
	form.innerHTML = `
	<div class="flex flex-col gap-3 sm:gap-5">
	  <h1 class="text-2xl font-bold text-center underline">Fill Your Information</h1>
	  <form class="flex flex-col gap-2 sm:gap-3">
		<div class="flex flex-col gap-1">
			<label for="nickname" class="block text-base font-medium text-gray-700">Nickname</label>
			<input type="text" id="nickname" placeholder="Your Nickname here" autocomplete="off" class="nickname relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base focus:shadow-[0_0_5px_var(--main-color)]">
		</div>
		<div class="flex flex-col gap-1">
			<label for="fullname" class="block text-base font-medium text-gray-700">Full name</label>
			<input type="text" id="fullname" placeholder="Your Name here (first last)" autocomplete="off" class="full-name relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base focus:shadow-[0_0_5px_var(--main-color)]">
		</div>
		<div class="flex flex-col gap-1">
			<label for="age" class="block text-base font-medium text-gray-700">Age</label>
			<input type="age" id="age" placeholder="Your Age here" autocomplete="off" class="age relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base focus:shadow-[0_0_5px_var(--main-color)]">
	  	</div>
		<!-- Register Button -->
	  </form>
	</div>
	`;
	const formElement:HTMLFormElement = form.querySelector('form')!;
	const nicknameInput:HTMLInputElement = form.querySelector('.nickname')!
	const fullNameInput:HTMLInputElement = form.querySelector('.full-name')!
	const ageInput:HTMLInputElement = form.querySelector('.age')!

	const signUpButton = Button({
	  type: 'submit',
	  text: 'Register',
	  styles: 'w-full font-semibold p-2 text-base text-white',
	  eventType: 'click',
	  onClick: (e: MouseEvent) => {
		if (!validateNickname(nicknameInput) || !validateFullName(fullNameInput) || !validateAge(ageInput))
			e.preventDefault();
		else
			console.log('email and pass are nice!');
	  }
	});
	formElement.appendChild(signUpButton);

	return form
})