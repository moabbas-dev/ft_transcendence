const validateEmail = (email) => {
	const emailStr = email.trim();
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(emailStr))
		return false;
	return true;
}

const validatePassword = (password) => {
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

	if (!passwordRegex.test(password))
		return false;
	return true;
}

module.exports = { validateEmail, validatePassword };