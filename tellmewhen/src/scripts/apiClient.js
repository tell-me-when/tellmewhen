import axios from "axios";
import { GetServerEndpoint } from "./script-settings";
import { RefreshToken } from "./login";

// Single axios instance for every authenticated call. Cookies carry
// identity (withCredentials), and one interceptor handles the
// 401 -> refresh -> retry flow that used to be copy-pasted into every
// script function individually.
const apiClient = axios.create({
    baseURL: GetServerEndpoint(),
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            // RefreshToken() throws (rather than resolving) on a non-2xx
            // response — e.g. 406 when there's no refresh cookie at all —
            // so both outcomes need to land on the same "give up" path.
            let refreshed;
            try {
                refreshed = await RefreshToken();
            } catch {
                refreshed = null;
            }

            if (refreshed?.status === 201) {
                return apiClient(originalRequest);
            }

            if (typeof window !== "undefined") {
                window.location.href = "/auth";
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
