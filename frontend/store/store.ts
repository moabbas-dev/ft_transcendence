import axios from "axios";
import Toast from "../src/toast/Toast";
import { navigate } from "../src/router";
import { account } from "../src/appwriteConfig";

class Store {
    // In-memory storage only
    private _userId: string | null = null;
    private _nickname: string | null = null;
    private _email: string | null = null;
    private _fullName: string | null = null;
    private _age: string | null = null;
    private _country: string | null = null;
    private _avatarUrl: string | null = null;
    private _isLoggedIn: boolean = false;
    private _is2faEnabled: boolean = false;
    private _accessToken: string | null = null;
    private _sessionUUID: string | null = null;
    private _createdAt: string | null = null;
    private _initialized: boolean = false;

    // Getters
    get userId() { return this._userId; }
    get nickname() { return this._nickname; }
    get email() { return this._email; }
    get fullName() { return this._fullName; }
    get age() { return this._age; }
    get country() { return this._country; }
    get avatarUrl() { return this._avatarUrl; }
    get isLoggedIn() { return this._isLoggedIn; }
    get is2faEnabled() { return this._is2faEnabled; }
    get accessToken() { return this._accessToken; }
    get sessionUUID() { return this._sessionUUID; }
    get createdAt() { return this._createdAt; }
    get initialized() { return this._initialized; }

    update(key: keyof Store, value: string | boolean | null): void {
        const privateKey = `_${key}` as keyof this;
        if (privateKey in this) {
            (this as any)[privateKey] = value;
        }
        
        // Only store session UUID for session persistence
        if (key === 'sessionUUID') {
            if (value) {
                localStorage.setItem('sessionUUID', String(value));
            } else {
                localStorage.removeItem('sessionUUID');
            }
        }
    }

    // Initialize store on app start
    async initialize(): Promise<void> {
        if (this._initialized) return;
        
        const storedSessionUUID = localStorage.getItem('sessionUUID');
        if (storedSessionUUID) {
            this._sessionUUID = storedSessionUUID;
            await this.restoreSession();
        }
        
        this._initialized = true;
    }

    private async restoreSession(): Promise<void> {
        try {
            // Make request to restore session using cookies only
            const response = await axios.get('/authentication/auth/me', {
                withCredentials: true,
                headers: { 'Skip-Auth-Interceptor': 'true' }
            });
            
            const userData = response.data;
            this._userId = userData.userId;
            this._nickname = userData.nickname;
            this._email = userData.email;
            this._fullName = userData.fullName;
            this._age = userData.age;
            this._country = userData.country;
            this._avatarUrl = userData.avatarUrl;
            this._is2faEnabled = userData.is2faEnabled;
            this._createdAt = userData.createdAt;
            this._accessToken = userData.accessToken;
            this._isLoggedIn = true;
            
            console.log('Session restored successfully');
        } catch (error: any) {
            console.log('Failed to restore session:', error.response?.status);
            this.clearSession();
        }
    }

    private clearSession(): void {
        this._userId = null;
        this._nickname = null;
        this._email = null;
        this._fullName = null;
        this._age = null;
        this._country = null;
        this._avatarUrl = null;
        this._isLoggedIn = false;
        this._is2faEnabled = false;
        this._accessToken = null;
        this._sessionUUID = null;
        this._createdAt = null;
        localStorage.removeItem('sessionUUID');
    }

    // Set user data after login
    setUserData(data: any): void {
        this._userId = data.userId;
        this._nickname = data.nickname;
        this._email = data.email;
        this._fullName = data.fullName;
        this._age = data.age;
        this._country = data.country;
        this._avatarUrl = data.avatarUrl;
        this._is2faEnabled = data.is2faEnabled;
        this._createdAt = data.createdAt;
        this._accessToken = data.accessToken;
        this._sessionUUID = data.sessionUUID;
        this._isLoggedIn = true;
    }

    async logout(): Promise<void> {
        if (!this._sessionUUID) {
            console.warn("Session id is null!");
            return;
        }
        try {
            await axios.post(`/authentication/auth/logout/${this._sessionUUID}`, {}, {
                withCredentials: true,
                headers: { 'Skip-Auth-Interceptor': 'true' }
            });

            this.clearSession();
            
            if (localStorage.getItem("googleAuth") === "true") {
                await account.deleteSessions();
                localStorage.removeItem("googleAuth");
            }
            navigate('/register');
        } catch (error: any) {
            // Handle errors but still clear local session
            this.clearSession();
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

const store = new Store();
export default store;