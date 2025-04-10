import { OAuthProvider } from 'appwrite';
import './router.js';
import { account } from './appwriteConfig.js';

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

localStorage.setItem("isLoggedIn", localStorage.getItem("sessionUUID") ? "true" : "false");