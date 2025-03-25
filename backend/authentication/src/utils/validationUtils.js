const validateEmail = (email) => {
	const emailStr = email.trim();
	if (emailStr === "")
		return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(emailStr);
}

const validatePassword = (password) => {
	const passwordStr = password.trim();
	if (passwordStr === "")
		return false;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
	return passwordRegex.test(passwordStr);
}

const validateNickname = (nickname) => {
	const nicknameStr = nickname.trim();
	if (nicknameStr === "")
		return false;
	const regex = /^[A-Za-z0-9]{3,10}$/;
	return regex.test(nicknameStr);
}

const validateFullName = (fullName) => {
	const fullNameStr = fullName.trim();
	if (fullNameStr === "")
		return false;
	const regex = /^[A-Za-z]{3,12} [A-Za-z]{3,12}$/;
	return regex.test(fullNameStr);
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

module.exports = {
	validateEmail,
	validatePassword,
	validateNickname,
	validateFullName,
	capitalizeFullName,
	validateAge
};