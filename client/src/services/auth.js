import api from "./api.js";

import getDeviceInfo from "../utils/device.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Authentication Service
|--------------------------------------------------------------------------
*/

const AUTH_BASE = "/auth";

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

export async function register(data) {

    const response = await api.post(

        `${AUTH_BASE}/register`,

        {

            ...data,

            device:
                getDeviceInfo()

        }

    );

    return response.data;

}

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export async function login(data) {

    const response = await api.post(

        `${AUTH_BASE}/login`,

        {

            ...data,

            device:
                getDeviceInfo()

        }

    );

    return response.data;

}

/*
|--------------------------------------------------------------------------
| Refresh
|--------------------------------------------------------------------------
*/

export async function refresh() {

    const response = await api.post(

        `${AUTH_BASE}/refresh`

    );

    return response.data;

}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export async function logout() {

    const response = await api.post(

        `${AUTH_BASE}/logout`

    );

    return response.data;

}

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export async function getCurrentUser() {

    const response = await api.get(

        `${AUTH_BASE}/me`

    );

    return response.data;

}

export default {

    register,

    login,

    refresh,

    logout,

    getCurrentUser

};