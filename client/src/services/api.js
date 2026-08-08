import axios from "axios";

/*
|--------------------------------------------------------------------------
| ShadowDock API Client
|--------------------------------------------------------------------------
|
| Central Axios instance.
|
| Responsibilities:
| ✓ API base URL
| ✓ Access-token injection
| ✓ Automatic refresh
| ✓ Refresh request queue
| ✓ Retry failed request once
| ✓ Session cleanup on refresh failure
|
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1";

const api = axios.create({

    baseURL: API_BASE_URL,

    timeout: 15000,

    withCredentials: true,

    headers: {

        "Content-Type": "application/json",

        Accept: "application/json"

    }

});

/*
|--------------------------------------------------------------------------
| Refresh state
|--------------------------------------------------------------------------
*/

let isRefreshing = false;

let refreshSubscribers = [];

/*
|--------------------------------------------------------------------------
| Access token helpers
|--------------------------------------------------------------------------
*/

function getAccessToken() {

    return localStorage.getItem(
        "accessToken"
    );

}

function setAccessToken(token) {

    if (!token) {

        return;

    }

    localStorage.setItem(
        "accessToken",
        token
    );

}

function clearAccessToken() {

    localStorage.removeItem(
        "accessToken"
    );

}

/*
|--------------------------------------------------------------------------
| Refresh queue
|--------------------------------------------------------------------------
*/

function subscribeToTokenRefresh(callback) {

    refreshSubscribers.push(callback);

}

function notifyTokenRefreshed(token) {

    const subscribers =
        refreshSubscribers;

    refreshSubscribers = [];

    subscribers.forEach(

        (callback) => callback(token)

    );

}

function rejectTokenRefresh(error) {

    const subscribers =
        refreshSubscribers;

    refreshSubscribers = [];

    subscribers.forEach(

        (callback) => callback(null, error)

    );

}

/*
|--------------------------------------------------------------------------
| Request interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(

    (config) => {

        const token =
            getAccessToken();

        if (token) {

            config.headers = {

                ...config.headers,

                Authorization:
                    `Bearer ${token}`

            };

        }

        return config;

    },

    (error) =>

        Promise.reject(error)

);

/*
|--------------------------------------------------------------------------
| Response interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest =
            error.config;

        /*
        --------------------------------------------------------------
        Ignore non-authentication errors
        --------------------------------------------------------------
        */

        if (

            error.response?.status !== 401 ||

            !originalRequest ||

            originalRequest._retry

        ) {

            return Promise.reject(error);

        }

        /*
        --------------------------------------------------------------
        Never refresh the refresh endpoint itself
        --------------------------------------------------------------
        */

        if (

            originalRequest.url?.includes(
                "/auth/refresh"
            )

        ) {

            clearAccessToken();

            window.dispatchEvent(

                new Event(
                    "shadowdock:auth-failed"
                )

            );

            return Promise.reject(error);

        }

        originalRequest._retry = true;

        /*
        --------------------------------------------------------------
        Another refresh is already running
        --------------------------------------------------------------
        */

        if (isRefreshing) {

            return new Promise(

                (resolve, reject) => {

                    subscribeToTokenRefresh(

                        (token, refreshError) => {

                            if (
                                refreshError ||
                                !token
                            ) {

                                reject(
                                    refreshError ||
                                    new Error(
                                        "Authentication refresh failed."
                                    )
                                );

                                return;

                            }

                            originalRequest.headers = {

                                ...originalRequest.headers,

                                Authorization:
                                    `Bearer ${token}`

                            };

                            resolve(
                                api(originalRequest)
                            );

                        }

                    );

                }

            );

        }

        /*
        --------------------------------------------------------------
        Start refresh
        --------------------------------------------------------------
        */

        isRefreshing = true;

        try {

            const response =
                await axios.post(

                    `${API_BASE_URL}/auth/refresh`,

                    {},

                    {

                        withCredentials: true,

                        headers: {

                            "Content-Type":
                                "application/json"

                        }

                    }

                );

            const newAccessToken =
                response.data?.accessToken;

            if (!newAccessToken) {

                throw new Error(
                    "Refresh response did not contain an access token."
                );

            }

            setAccessToken(
                newAccessToken
            );

            notifyTokenRefreshed(
                newAccessToken
            );

            originalRequest.headers = {

                ...originalRequest.headers,

                Authorization:
                    `Bearer ${newAccessToken}`

            };

            return api(
                originalRequest
            );

        }

        catch (refreshError) {

            clearAccessToken();

            rejectTokenRefresh(
                refreshError
            );

            window.dispatchEvent(

                new Event(
                    "shadowdock:auth-failed"
                )

            );

            return Promise.reject(
                refreshError
            );

        }

        finally {

            isRefreshing = false;

        }

    }

);

export {

    getAccessToken,

    setAccessToken,

    clearAccessToken

};

export default api;