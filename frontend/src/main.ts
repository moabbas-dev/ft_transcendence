import { OAuthProvider } from 'appwrite';
import './router.js';
import { account } from './appwriteConfig.js';
import axios from 'axios';
import store from '../store/store.js';
import Toast from './toast/Toast.js';

// window.addEventListener("contextmenu", (e) => e.preventDefault());
// window.addEventListener("keydown", (e) => {
// 	if (
// 	  e.key === "F12" ||
// 	  (e.ctrlKey && e.shiftKey && e.key === "I") ||
// 	  (e.ctrlKey && e.shiftKey && e.key === "J") ||
// 	  (e.ctrlKey && e.key === "U")
// 	) {
// 	  e.preventDefault();
// 	}
// });

export const handleLoginWithGoogle = (container: HTMLElement) => {
	const signBtn: HTMLButtonElement = container.querySelector('#google-sign')!
	if (!signBtn) {
		console.error('Google Sign-In button not found.');
		return;
	}

	const handleLogin = async () => {
		try {
			localStorage.setItem("googleAuth", "true");
			localStorage.setItem("googleAuthClicked", "true");
			account.createOAuth2Session(
				OAuthProvider.Google,
				'https://localhost', // if success redirect to this url
				'https://localhost/register' // if fail redirect to this url
			)
		} catch(err) {
			Toast.show("Error: Login failed", "error");
		}
	}
	signBtn.addEventListener('click', () => handleLogin());
}

export const refreshUserData = async () => {
	if (store.userId === null)
		return 
	try {
		const response = await axios.get(`/authentication/auth/users/id/${store.userId}`)
		const data = response.data
		
		if (data) {
			store.update('age', data.age)
			store.update('avatarUrl', data.avatar_url)
			store.update('country', data.country)
			store.update('email', data.email)
			store.update('fullName', data.fullName)
			store.update('nickname', data.nickname)
		}
	} catch (error) {
		console.log(error);
	}
}
refreshUserData()

localStorage.setItem("isLoggedIn", localStorage.getItem("sessionUUID") ? "true" : "false");