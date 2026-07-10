import jwt from "jsonwebtoken";

import env from "../config/env.js";

import { findUserById } from "../repositories/user.repository.js";

/*
|--------------------------------------------------------------------------
| Socket Authentication Middleware
|--------------------------------------------------------------------------
|
| Authenticates every Socket.IO connection.
|
| Client sends:
|
| io(SERVER_URL,{
|     auth:{
|         token:"JWT_TOKEN"
|     }
| })
|
| On success:
|
| socket.user = authenticated user
|
*/

export default function socketAuth(io) {

    io.use(

        async (

            socket,

            next

        ) => {

            try {

                const token = socket.handshake.auth?.token;

                if (!token) {

                    return next(

                        new Error(
                            "Authentication required."
                        )

                    );

                }

                let payload;

                try {

                    payload = jwt.verify(

                        token,

                        env.jwt.accessSecret

                    );

                }

                catch {

                    return next(

                        new Error(
                            "Invalid or expired token."
                        )

                    );

                }

                const user = await findUserById(

                    payload.id

                );

                if (!user) {

                    return next(

                        new Error(
                            "User not found."
                        )

                    );

                }

                socket.user = {

                    id: user.id,

                    publicId: user.public_id,

                    username: user.username,

                    displayName: user.display_name,

                    avatarUrl: user.avatar_url

                };

                next();

            }

            catch (err) {

                next(err);

            }

        }

    );

}