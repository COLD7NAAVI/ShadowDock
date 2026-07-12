import {
    findUserById,
    findUserByPublicId,

    updateProfile,

    searchUsers,

    setUserOnline,
    setUserOffline
} from "../repositories/user.repository.js";

export async function getMyProfile(
    userId
) {
    return await findUserById(
        userId
    );
}

export async function getProfile(
    publicId
) {
    return await findUserByPublicId(
        publicId
    );
}

export async function editProfile(
    userId,
    data
) {
    return await updateProfile(
        userId,
        data
    );
}

export async function findUsers(
    query
) {
    return await searchUsers(
        query
    );
}
/*
|--------------------------------------------------------------------------
| Presence
|--------------------------------------------------------------------------
*/

export async function markUserOnline(
    userId
) {

    return await setUserOnline(
        userId
    );

}

export async function markUserOffline(
    userId
) {

    return await setUserOffline(
        userId
    );

}
/*
|--------------------------------------------------------------------------
| Socket Authentication
|--------------------------------------------------------------------------
*/

export async function getUserForSocketAuth(

    userId

) {

    const user = await findUserById(

        userId

    );

    if (!user) {

        return null;

    }

    return user;

}