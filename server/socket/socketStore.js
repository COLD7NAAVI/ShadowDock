/*
|--------------------------------------------------------------------------
| Socket Store
|--------------------------------------------------------------------------
|
| Keeps track of connected users and their sockets.
|
| Supports:
| • Multiple devices per user
| • Presence
| • Notifications
| • Direct messaging
| • Future clustering compatibility
|
*/

const userSockets = new Map();

const socketUsers = new Map();

/*
|--------------------------------------------------------------------------
| Register Socket
|--------------------------------------------------------------------------
*/

export function registerSocket(
    userId,
    socketId
) {

    if (!userSockets.has(userId)) {

        userSockets.set(
            userId,
            new Set()
        );

    }

    userSockets
        .get(userId)
        .add(socketId);

    socketUsers.set(
        socketId,
        userId
    );

}

/*
|--------------------------------------------------------------------------
| Remove Socket
|--------------------------------------------------------------------------
*/

export function removeSocket(
    socketId
) {

    const userId =
        socketUsers.get(socketId);

    if (!userId) {

        return;

    }

    const sockets =
        userSockets.get(userId);

    if (sockets) {

        sockets.delete(socketId);

        if (sockets.size === 0) {

            userSockets.delete(userId);

        }

    }

    socketUsers.delete(socketId);

}

/*
|--------------------------------------------------------------------------
| Get User Socket IDs
|--------------------------------------------------------------------------
*/

export function getUserSockets(
    userId
) {

    return Array.from(

        userSockets.get(userId) ?? []

    );

}

/*
|--------------------------------------------------------------------------
| User Online?
|--------------------------------------------------------------------------
*/

export function isUserOnline(
    userId
) {

    return userSockets.has(userId);

}

/*
|--------------------------------------------------------------------------
| Connected Users
|--------------------------------------------------------------------------
*/

export function getOnlineUsers() {

    return Array.from(

        userSockets.keys()

    );

}

/*
|--------------------------------------------------------------------------
| Total Connections
|--------------------------------------------------------------------------
*/

export function getConnectionCount() {

    let total = 0;

    for (const sockets of userSockets.values()) {

        total += sockets.size;

    }

    return total;

}

/*
|--------------------------------------------------------------------------
| Clear Store
|--------------------------------------------------------------------------
|
| Useful for tests.
|
*/

export function clearSocketStore() {

    userSockets.clear();

    socketUsers.clear();

}