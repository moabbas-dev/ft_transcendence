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

const initializeApp = async () => {
	console.log('Initializing app...');
	try {
		await store.initialize();
		console.log('Store initialized, user logged in:', store.isLoggedIn);
		localStorage.setItem("isLoggedIn", store.isLoggedIn ? "true" : "false");


		if (store.isLoggedIn && store.userId) {
			await initializeTournamentClient();
			await initializeChatClient();
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
			await tournamentClient.initialize();
			console.log('Tournament client initialized successfully');
		} catch (error) {
			console.error('Failed to initialize tournament client:', error);
		}
	}
};

async function initializeChatClient() {
	try {
		// Connect to WebSocket server
		await chatService.connect();

		console.log("Connected to chat service from home");
	} catch (error) {
		console.error("Failed to connect to chat service:", error);
	}
}

/////////////////// pong client  //////////////////////////
import { PongGameClient } from "./components/Online-Game/components/Game.js";

export let pongClientInstance: PongGameClient | null = null;
export function getMatchmakingClient(): PongGameClient {
	const userId = store.userId || 'anonymousUser'; // Ensure there's a fallback or handle missing userId
	if (!pongClientInstance || pongClientInstance['userId'] !== userId) { // Check if instance exists or if userId changed
		if (pongClientInstance) {
			pongClientInstance.disconnect(); // Disconnect old instance if exists
		}
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		// IMPORTANT: Ensure this port is correct for your matchmaking WebSocket server.
		// Using 3001 as a placeholder. Consider using environment variables for flexibility.
		//   const wsPort = '3001'; // Or use import.meta.env.VITE_MATCHMAKING_WS_PORT
		const wsUrl = `${protocol}//${window.location.hostname}:/matchmaking/`;

		console.log(`Initializing PongGameClient for user: ${userId} with URL: ${wsUrl}`);
		pongClientInstance = new PongGameClient(wsUrl, userId);

		try {
			pongClientInstance.connect();
			console.log('pong client initialized successfully');
		} catch (error) {
			console.error('Failed to initialize pong client:', error);
		}

		// Setup essential global listeners for the client here if needed,
		// or ensure they are re-attached if the client is re-initialized.
		// For example:
		//   pongClientInstance.on('friend_match_invite', (data: any) => {
		// 	console.log('Global listener: Friend match invite received', data);
		// 	// This alert is just an example; you'll want a better UI notification
		// 	const accept = confirm(`${data.fromId} has invited you to a match. Accept?`);
		// 	if (accept && pongClientInstance) { // Check pongClientInstance again
		// 	  pongClientInstance.acceptFriendMatch(data.fromId);
		// 	}
		//   });

		pongClientInstance.on('friend_match_created', (data: any) => {
			console.log('Global listener: Friend match created', data);
			// Handle match creation, perhaps navigate to game screen
			// This logic might be similar to what's already in the render function,
			// ensure it's handled consistently.
		});
		// Add other critical global listeners here if they were previously inside render
		// and tied to the client instance.
	}
	return pongClientInstance;
}