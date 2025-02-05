function createErrorMessage(input: HTMLInputElement, message: string) {
	if (input.nextElementSibling)
		return ;
	const errorDiv = document.createElement('div');
	errorDiv.className = 'text-red-700 text-sm mt-1'; // Tailwind CSS classes for styling
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
