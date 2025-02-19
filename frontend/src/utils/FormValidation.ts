function createErrorMessage(input: HTMLInputElement, message: string) {
	if (input.nextElementSibling)
		return ;
	const errorDiv = document.createElement('div');
	errorDiv.className = 'text-red-700 text-sm'; // Tailwind CSS classes for styling
	errorDiv.textContent = message;
  
	// Insert the error message div after the input element
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
		createErrorMessage(emailInput, "Enter a valid email address (e.g., user@example.com)");
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
		createErrorMessage(passwordInput, "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character.");
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
		createErrorMessage(confirmPasswordInput, "Passwords do not match.");
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
		"Nickname must be 3-16 characters long and can only contain letters, numbers, _, or -"
	  );
	  return false;
	}
  
	removeErrorMessage(nicknameInput);
	return true;
}
  
export function validateFullName(fullNameInput: HTMLInputElement) {
	const fullName = fullNameInput.value.trim();

	if (fullName.length < 3) {
		createErrorMessage(fullNameInput, "Full name must be at least 3 characters.");
		return false;
	} 
	
	const nameParts = fullName.split(/\s+/);
	if (nameParts.length !== 2) {
		createErrorMessage(fullNameInput, "Please enter exactly two names: first and last name.");
		return false;
	}

	for (const part of nameParts) {
		if (part.length < 3) {
		  createErrorMessage(fullNameInput, "Each name must be at least 3 characters long.");
		  return false;
		}
	}

	const nameRegex = /^[A-Za-z]+$/;
	if (!nameRegex.test(nameParts[0]) || !nameRegex.test(nameParts[1])) {
	  createErrorMessage(fullNameInput, "Names should only contain alphabetical characters.");
	  return false;
	}

	removeErrorMessage(fullNameInput);
	return true;
}

export function validateAge(ageInput: HTMLInputElement) {
	const age = ageInput.value.trim();

	if (age.length === 0 || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 100) {
		createErrorMessage(ageInput, "Age should be a number between 1 and 100.");
		return false;
	} else {
		removeErrorMessage(ageInput);
		return true;
	}
}
