import axios from "axios";

/*
|--------------------------------------------------------------------------
| ShadowDock API Client
|--------------------------------------------------------------------------
|
| Single Axios instance for the entire application.
|
| Responsibilities
|
| ✓ Base URL
| ✓ JSON requests
| ✓ Authorization header
| ✓ Future refresh token support
| ✓ Future request logging
| ✓ Future retry support
|
|--------------------------------------------------------------------------
*/

const api = axios.create({

    baseURL:

        import.meta.env.VITE_API_URL ||

        "http://localhost:5000",

    timeout:

        15000,

    headers: {

        "Content-Type":

            "application/json"

    }

});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
|
| Automatically attaches JWT.
|
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
|
| Future:
|
| ✓ Refresh Token
| ✓ Logout on 401
| ✓ Retry Requests
| ✓ Error Logging
|
*/

api.interceptors.response.use(

    (response) =>

        response,

    async (error) => {

        return Promise.reject(error);

    }

);

export default api;