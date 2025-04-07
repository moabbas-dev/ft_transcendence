import axios from "axios";
import Toast from "../src/toast/Toast";
import { navigate } from "../src/router";

class Store {
	userId: string | null = sessionStorage.getItem("userId");
	nickname: string | null = sessionStorage.getItem("nickname");
	email: string | null = sessionStorage.getItem("email");
	fullName: string | null = sessionStorage.getItem("fullName");
	age: string | null = sessionStorage.getItem("age");
	country: string | null = sessionStorage.getItem("country");
	avatarUrl: string | null = sessionStorage.getItem("avatarUrl");
	isLoggedIn: boolean = sessionStorage.getItem("isLoggedIn") === "true";
	accessToken: string | null = sessionStorage.getItem("accessToken");
	refreshToken: string | null = sessionStorage.getItem("refreshToken");
	sessionId: string | null = sessionStorage.getItem("sessionId");
	createdAt: string | null = sessionStorage.getItem("createdAt");

	// Function to update any variable dynamically
	update(key: keyof Store, value: string | boolean | null): void {
		(this as any)[key] = value;
		if (value === null) {
			sessionStorage.removeItem(key);
		} else {
			sessionStorage.setItem(key, String(value));
		}
	}

	// Logout function to clear data
	async logout(): Promise<void> {
		if (!this.sessionId) {
			console.warn("Session id is null!");
			return;
		}
		try {
			await axios.get(`http://localhost:8001/auth/logout/${this.sessionId}`);

			this.update("isLoggedIn", false);
			this.update("userId", null);
			this.update("nickname", null);
			this.update("email", null);
			this.update("fullName", null);
			this.update("age", null);
			this.update("country", null);
			this.update("avatarUrl", null);
			this.update("accessToken", null);
			this.update("refreshToken", null);
			this.update("sessionId", null);
			this.update("createdAt", null);
			navigate('/register');
		}
		catch (error: any) {
			if (error.response) {
				if (error.response.status === 404)
					Toast.show(`Error: ${error.response.data.message}`, "error");
				else
					Toast.show(`Server error: ${error.response.data.error}`, "error");
			} else if (error.request)
				Toast.show(`No response from the server: ${error.request}`, "error");
			else
				Toast.show(`Error setting up the request: ${error.message}`, "error")
		}
	}
}

// Create and export a single store instance
const store = new Store();
export default store;
