import { OAuthProvider } from 'appwrite';
import './router.js';
import { account } from './appwriteConfig.js';
import axios from 'axios';
import store from '../store/store.js';

export const handleLoginWithGoogle = (container: HTMLElement) => {
	const signBtn: HTMLButtonElement = container.querySelector('#google-sign')!
	if (!signBtn) {
		console.error('Google Sign-In button not found.');
		return;
	}

	const handleLogin = async () => {
		localStorage.setItem("googleAuth", "true");
		localStorage.setItem("googleAuthClicked", "true");
		account.createOAuth2Session(
			OAuthProvider.Google,
			'http://localhost:5173', // if success redirect to this url
			'http://localhost:5173/register' // if fail redirect to this url
		)
	}
	signBtn.addEventListener('click', () => handleLogin());
}

const refreshUserData = async () => {
	try {
		const response = await axios.get(`http://localhost:8001/auth/users/id/${store.userId}`)
		const data = response.data
		if (data) {
			store.age = data.age
			store.avatarUrl = data.avatarUrl
			store.country = data.country
			store.email = data.email
			store.fullName = data.fullName
			store.nickname = data.nickname
		}
	} catch (error) {
		console.log(error);
	}
}
refreshUserData()

localStorage.setItem("isLoggedIn", localStorage.getItem("sessionUUID") ? "true" : "false");