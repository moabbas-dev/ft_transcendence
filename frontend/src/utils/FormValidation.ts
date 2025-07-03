import { t } from "../languages/LanguageController";

function createErrorMessage(input: HTMLInputElement, message: string) {
	if (input.nextElementSibling)
		return ;
	const errorDiv = document.createElement('div');
	errorDiv.className = 'text-red-700 text-sm';
	errorDiv.textContent = message;
  
	input.insertAdjacentElement('afterend', errorDiv);
  }

function removeErrorMessage(input: HTMLInputElement) {
	const errorDiv = input.nextElementSibling;

	if (errorDiv) 
	  errorDiv.remove();
}

export function validateEmail(emailInput: HTMLInputElement) {
	const email = emailInput.value.trim();
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
		createErrorMessage(emailInput, t('register.validation.email'));
		return false;
	} else {
		removeErrorMessage(emailInput);
		return true;
	}
}

export function validatePassword(passwordInput: HTMLInputElement) {
	const password = passwordInput.value;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

	if (!passwordRegex.test(password)) {
		createErrorMessage(passwordInput, t('register.validation.password'));
		return false;
	} else {
		removeErrorMessage(passwordInput);
		return true;
	}
}

export function validateConfirmPassword(passwordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement) {
	const password = passwordInput.value;
	const confPassword = confirmPasswordInput.value;

	if (password !== confPassword) {
		createErrorMessage(confirmPasswordInput, t('register.validation.passNotMatch'));
		return false;
	} else {
		removeErrorMessage(confirmPasswordInput);
		return true;
	}
}

export function validateNickname(nicknameInput: HTMLInputElement) {
	const nickname = nicknameInput.value.trim();

	const nicknamePattern = /^[a-zA-Z0-9_-]{3,16}$/;
  
	if (!nicknamePattern.test(nickname)) {
	  createErrorMessage(
		nicknameInput,
		t('register.validation.nickname')
	  );
	  return false;
	}
  
	removeErrorMessage(nicknameInput);
	return true;
}
  
export function validateFullName(fullNameInput: HTMLInputElement) {
	const fullName = fullNameInput.value.trim();

	if (fullName.length < 3) {
		createErrorMessage(fullNameInput, t('register.validation.fullName'));
		return false;
	} 
	
	const nameParts = fullName.split(/\s+/);
	if (nameParts.length !== 2) {
		createErrorMessage(fullNameInput, t('register.validation.fullName2'));
		return false;
	}

	for (const part of nameParts) {
		if (part.length < 3) {
		  createErrorMessage(fullNameInput, t('register.validation.fullName3'));
		  return false;
		}
	}

	const nameRegex = /^[A-Za-z]+$/;
	if (!nameRegex.test(nameParts[0]) || !nameRegex.test(nameParts[1])) {
	  createErrorMessage(fullNameInput, t('register.validation.names'));
	  return false;
	}

	removeErrorMessage(fullNameInput);
	return true;
}

export function validateAge(ageInput: HTMLInputElement) {
	const age = ageInput.value.trim();

	if (age.length === 0 || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 100) {
		createErrorMessage(ageInput, t('register.validation.age'));
		return false;
	} else {
		removeErrorMessage(ageInput);
		return true;
	}
}
