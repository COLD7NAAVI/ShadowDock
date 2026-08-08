import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Get authenticated user's chats
|--------------------------------------------------------------------------
*/

export async function getChats() {

    const response = await api.get(

        "/chats"

    );

    return response.data?.data || [];

}

/*
|--------------------------------------------------------------------------
| Create or retrieve private chat
|--------------------------------------------------------------------------
*/

export async function createPrivateChat(

    targetPublicId

) {

    const response = await api.post(

        "/chats/private",

        {

            targetPublicId,

        }

    );

    return response.data?.data || null;

}