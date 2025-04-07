import axios from "axios";
import Toast from "../src/toast/Toast";
import { navigate } from "../src/router";

class Store {
	userId: string | null = localStorage.getItem("userId");
	nickname: string | null = localStorage.getItem("nickname");
	email: string | null = localStorage.getItem("email");
	fullName: string | null = localStorage.getItem("fullName");
	age: string | null = localStorage.getItem("age");
	country: string | null = localStorage.getItem("country");
	avatarUrl: string | null = localStorage.getItem("avatarUrl");
	isLoggedIn: boolean = localStorage.getItem("isLoggedIn") === "true";
	accessToken: string | null = localStorage.getItem("accessToken");
	refreshToken: string | null = localStorage.getItem("refreshToken");
	sessionUUID: string | null = localStorage.getItem("sessionUUID");
	createdAt: string | null = localStorage.getItem("createdAt");

	// Function to update any variable dynamically
	update(key: keyof Store, value: string | boolean | null): void {
		(this as any)[key] = value;
		if (value === null) {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, String(value));
		}
	}

	// Logout function to clear data
	async logout(): Promise<void> {
		if (!this.sessionUUID) {
			console.warn("Session id is null!");
			return;
		}
		try {
			await axios.post(`http://localhost:8001/auth/logout/${this.sessionUUID}`);

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
			this.update("sessionUUID", null);
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