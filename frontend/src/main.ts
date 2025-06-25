import { OAuthProvider } from 'appwrite';
import './router.js';
import { account } from './appwriteConfig.js';
import axios from 'axios';
import store from '../store/store.js';
import Toast from './toast/Toast.js';
import './utils/axiosConfig.js';
import { TournamentClient } from './components/Tournament-Game/TournamentClient.js';
import { refreshRouter } from './router.js';
import chatService from "./utils/chatUtils/chatWebSocketService.js";
import { PongGameClient } from './components/Online-Game/components/Game.js';

export const initializeApp = async () => {
	console.log('Initializing app...');
	try {
		await store.initialize();
		console.log('Store initialized, user logged in:', store.isLoggedIn);
		localStorage.setItem("isLoggedIn", store.isLoggedIn ? "true" : "false");


		console.log("TTTTT, ", store.isLoggedIn && store.userId);
		
		if (store.isLoggedIn && store.userId) {
			await initializeTournamentClient();
			await initializeChatClient();
			await initializePongGameClient();
		}
		await refreshRouter();
	} catch (error) {
		console.error('Failed to initialize app:', error);
	}
};

initializeApp();


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
			localStorage.setItem("isLoggedIn", "true");
			const origin = window.location.origin;
			const successURL = origin;
			const failureURL = `${origin}/register`;
			account.createOAuth2Session(
				OAuthProvider.Google,
				successURL, // if success redirect to this url
				failureURL // if fail redirect to this url
			)
		} catch (err) {
			Toast.show("Error: Login failed", "error");
		}
	}
	signBtn.addEventListener('click', () => handleLogin());
}

export const refreshUserData = async () => {
	if (!store.userId || !store.isLoggedIn) return;

	try {
		const response = await axios.get(`/authentication/auth/users/id/${store.userId}`);
		const data = response.data;

		if (data) {
			store.update('age', data.age);
			store.update('avatarUrl', data.avatar_url);
			store.update('country', data.country);
			store.update('email', data.email);
			store.update('fullName', data.fullName);
			store.update('nickname', data.nickname);
		}
	} catch (error) {
		console.log('Error refreshing user data:', error);
	}
}
refreshUserData()

localStorage.setItem("isLoggedIn", localStorage.getItem("sessionUUID") ? "true" : "false");

export async function fetchUserDetails(userIds: string[]) {
	try {
		const results = await Promise.all(
			userIds.map(async (userId) => {
				const response = await axios.get(`/authentication/auth/users/id/${userId}`);
				return response.data;
			})
		);
		return results;
	} catch (error) {
		console.error('Error fetching user details:', error);
		return null;
	}
}

export let tournamentClient: TournamentClient | null = null;

export const initializeTournamentClient = async () => {
	if (store.isLoggedIn && store.userId && !tournamentClient) {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port}/matchmaking/`;
		tournamentClient = new TournamentClient(wsUrl, store.userId);

		try {
			await tournamentClient.connect();
			console.log('Tournament client initialized successfully');
		} catch (error) {
			console.error('Failed to initialize tournament client:', error);
		}
	}
};

async function initializeChatClient() {
	try {
		await chatService.connect();
		chatService.on("game:navigate_to_match", (data) => {
			console.log("Received game navigation request:", data);
			
			sessionStorage.setItem('pendingFriendMatch', JSON.stringify({
				matchData: data.matchData,
				timestamp: Date.now()
			}));
			
			console.log("Stored pending friend match data:", data.matchData);
			
			import('./router.js').then(({ navigate }) => {
				navigate('/play/online-game');
			});
		});
		console.log("Connected to chat service from home");
	} catch (error) {
		console.error("Failed to connect to chat service:", error);
	}
}

export let pongGameClient: PongGameClient | null = null;

async function initializePongGameClient() {
	try {
		if (store.isLoggedIn && store.userId && !pongGameClient) {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port}/matchmaking/`;
			pongGameClient = new PongGameClient(wsUrl, store.userId);
			await pongGameClient.connect();
			console.log('Pong Game client initialized successfully');
		}
	} catch (error) {
		console.error("Failed to connect to game service:", error);
	}
}
