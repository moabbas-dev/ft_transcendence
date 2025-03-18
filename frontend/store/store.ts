import axios from "axios";

class Store {
	userId: string | null = localStorage.getItem("userId");
	nickname: string | null = localStorage.getItem("nickname");
	email: string | null = localStorage.getItem("email");
	fullName: string | null = localStorage.getItem("fullName");
	avatarUrl: string | null = localStorage.getItem("avatarUrl");
	isLoggedIn: boolean = localStorage.getItem("isLoggedIn") === "true";
	accessToken: string | null = localStorage.getItem("accessToken");
	refreshToken: string | null = localStorage.getItem("refreshToken");
	sessionId: string | null = localStorage.getItem("sessionId");

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
			this.update("avatarUrl", null);
			this.update("accessToken", null);
			this.update("refreshToken", null);
			this.update("sessionId", null);
			console.log("User logged out successfully!");
		}
		catch (error: any) {
			if (error.response) {
				if (error.response.status === 404)
					console.error("Error:", error.response.data.message);
				else
					console.error("Server error:", error.response.data.error);
			} else if (error.request) {
				console.error("No response from server:", error.request);
			} else {
				console.error("Error setting up request:", error.message);
			}
		}
	}
}

// Create and export a single store instance
const store = new Store();
export default store;