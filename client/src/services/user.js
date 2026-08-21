import api from "./api.js";

/*
|--------------------------------------------------------------------------
| ShadowDock User Service
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Get My Profile
|--------------------------------------------------------------------------
*/

export async function getMyProfile() {

    const response =
        await api.get(
            "/users/me"
        );

    return response.data;

}


/*
|--------------------------------------------------------------------------
| Update My Profile
|--------------------------------------------------------------------------
*/

export async function updateMyProfile(
    data
) {

    const response =
        await api.patch(
            "/users/me",
            data
        );

    return response.data;

}


/*
|--------------------------------------------------------------------------
| Get Public Profile
|--------------------------------------------------------------------------
*/

export async function getUserProfile(
    publicId
) {

    const response =
        await api.get(
            `/users/${publicId}`
        );

    return response.data;

}


/*
|--------------------------------------------------------------------------
| Search Users
|--------------------------------------------------------------------------
*/

export async function searchUsers(
    query
) {

    const response =
        await api.get(
            "/users/search",
            {
                params: {
                    q: query
                }
            }
        );

    return response.data;

}


export default {

    getMyProfile,

    updateMyProfile,

    getUserProfile,

    searchUsers

};
