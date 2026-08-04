import axios from "axios";

/*
|--------------------------------------------------------------------------
| ShadowDock API Client
|--------------------------------------------------------------------------
|
| Production Features
|
| ✓ Single Axios Instance
| ✓ Automatic Access Token
| ✓ Automatic Refresh Token
| ✓ Request Retry
| ✓ Prevent Multiple Refresh Requests
| ✓ Logout On Refresh Failure
| ✓ Future Ready
|
|--------------------------------------------------------------------------
*/

const api = axios.create({

    baseURL:

        import.meta.env.VITE_API_URL ||

        "http://localhost:5000",

    timeout:

        15000,

    withCredentials: true,

    headers: {

        "Content-Type":

            "application/json"

    }

});

/*
|--------------------------------------------------------------------------
| Refresh Queue
|--------------------------------------------------------------------------
*/

let isRefreshing = false;

let refreshSubscribers = [];

/*
|--------------------------------------------------------------------------
| Notify Waiting Requests
|--------------------------------------------------------------------------
*/

function onTokenRefreshed(token) {

    refreshSubscribers.forEach(

        (callback) => callback(token)

    );

    refreshSubscribers = [];

}

function addRefreshSubscriber(callback) {

    refreshSubscribers.push(callback);

}

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(

    (config) => {

        const token =

            localStorage.getItem(

                "accessToken"

            );

        if (token) {

            config.headers.Authorization =

                `Bearer ${token}`;

        }

        return config;

    },

    (error) =>

        Promise.reject(error)

);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        /*
        -------------------------------------------------------
        Ignore if not authentication error
        -------------------------------------------------------
        */

        if (

            error.response?.status !== 401 ||

            originalRequest._retry

        ) {

            return Promise.reject(error);

        }

        /*
        -------------------------------------------------------
        Don't refresh refresh()
        -------------------------------------------------------
        */

        if (

            originalRequest.url.includes(

                "/auth/refresh"

            )

        ) {

            localStorage.removeItem(

                "accessToken"

            );

            window.location.href = "/login";

            return Promise.reject(error);

        }

        originalRequest._retry = true;

        /*
        -------------------------------------------------------
        Refresh Already Running
        -------------------------------------------------------
        */

        if (isRefreshing) {

            return new Promise(

                (resolve) => {

                    addRefreshSubscriber(

                        (token) => {

                            originalRequest.headers.Authorization =

                                `Bearer ${token}`;

                            resolve(

                                api(originalRequest)

                            );

                        }

                    );

                }

            );

        }

        /*
        -------------------------------------------------------
        Start Refresh
        -------------------------------------------------------
        */

        isRefreshing = true;

        try {

            const response =

                await axios.post(

                    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/auth/refresh`,

                    {},

                    {

                        withCredentials: true

                    }

                );

            const newAccessToken =

                response.data.accessToken;

            localStorage.setItem(

                "accessToken",

                newAccessToken

            );

            api.defaults.headers.Authorization =

                `Bearer ${newAccessToken}`;

            onTokenRefreshed(

                newAccessToken

            );

            originalRequest.headers.Authorization =

                `Bearer ${newAccessToken}`;

            return api(

                originalRequest

            );

        }

        catch (refreshError) {

            localStorage.removeItem(

                "accessToken"

            );

            window.location.href = "/login";

            return Promise.reject(

                refreshError

            );

        }

        finally {

            isRefreshing = false;

        }

    }

);

export default api;