import axios from "axios";
import store from "../store/store";
import Toast from "../src/toast/Toast";

const getValidAccessToken = async (): Promise<string | null> => {
    try {
        await axios.post(`/authentication/auth/jwt/verify/${store.userId}`, { accessToken: store.accessToken });
        return store.accessToken;
    } catch (error: any) {
        // Ensure error.response exists before accessing it
        if (error.response && error.response.status === 401) {
            try {
                const { data } = await axios.post<{ accessToken: string }>(
                    `/authentication/auth/jwt/refresh/${store.sessionId}`, 
                    { refreshToken: store.refreshToken }
                );
                
                store.update("accessToken", data.accessToken);
                return data.accessToken;
            } catch (err: any) {
                if (err.response && err.response.status === 401) {
                    await store.logout();
                    Toast.show("Session terminated, please sign up again!", "warn");
                    return null;
                }
                return store.accessToken;
            }
        }
        console.error("Token validation error:", error);
        return store.accessToken;
    }
};

export default getValidAccessToken;