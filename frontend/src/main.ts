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
		account.createOAuth2Session(
			OAuthProvider.Google,
			'http://localhost:5173', // if success redirect to this url
			'http://localhost:5173/register' // if fail redirect to this url
		)
		localStorage.setItem("googleAuth", "true");
	}

    const fetchUserData = async () => {
        try {
            const user = await account.get();
            const session = await account.getSession('current');
            console.log('User:', user);
            console.log('Session:', session);
			// await account.deleteSession('current'); // when we logout we should delete the session
			// await account.deleteSessions(); // and this to logout from all loggedin devices [i think we dont need this]
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchUserData();
	signBtn.addEventListener('click', () => handleLogin());
}

localStorage.setItem("isLoggedIn", localStorage.getItem("sessionUUID") ? "true" : "false");