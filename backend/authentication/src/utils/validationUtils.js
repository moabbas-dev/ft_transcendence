const validateEmail = (email) => {
	const emailStr = email.trim();
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(emailStr);
}

const validatePassword = (password) => {
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
	return passwordRegex.test(password);
}

const validateNickname = (nickname) => {
	const regex = /^[A-Za-z0-9]{3,10}$/;
	return regex.test(nickname);
}

const validateFullName = (fullName) => {
	const regex = /^[A-Za-z]{3,12} [A-Za-z]{3,12}$/;
	return regex.test(fullName);
}

const capitalizeFullName = (fullName) => {
	return fullName
		.split(" ")
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

const validateAge = (age) => {
	return Number.isInteger(age) && age >= 5 && age <= 99;
}

module.exports = { validateEmail, validatePassword, validateNickname, validateFullName, capitalizeFullName, validateAge };