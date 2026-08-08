import {

    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState

} from "react";

import * as authService
    from "../services/auth.js";

import {

    clearAccessToken,
    setAccessToken

} from "../services/api.js";

import {

    connectSocket,
    disconnectSocket,
    updateSocketToken

} from "../services/socket.js";

/*
|--------------------------------------------------------------------------
| Context
|--------------------------------------------------------------------------
*/

const AuthContext =
    createContext(null);

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

export function AuthProvider({

    children

}) {

    const [

        user,

        setUser

    ] = useState(null);

    const [

        accessToken,

        setAccessTokenState

    ] = useState(null);

    const [

        loading,

        setLoading

    ] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    const login = useCallback(

        async (credentials) => {

            const response =
                await authService.login(
                    credentials
                );

            const token =
                response?.accessToken;

            if (!token) {

                throw new Error(

                    "Login response did not contain an access token."

                );

            }

            setAccessToken(
                token
            );

            setAccessTokenState(
                token
            );

            setUser(
                response?.user ??
                null
            );

            connectSocket(
                token
            );

            return response;

        },

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const logout = useCallback(

        async () => {

            try {

                await authService.logout();

            }

            catch {

                /*
                Logout must still clear the
                local session if server logout fails.
                */

            }

            disconnectSocket();

            clearAccessToken();

            setUser(null);

            setAccessTokenState(null);

        },

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Restore session
    |--------------------------------------------------------------------------
    */

    const restoreSession = useCallback(

        async () => {

            try {

                const response =
                    await authService.refresh();

                const token =
                    response?.accessToken;

                if (!token) {

                    throw new Error(

                        "No access token returned during refresh."

                    );

                }

                setAccessToken(
                    token
                );

                setAccessTokenState(
                    token
                );

                /*
                ----------------------------------------------------------
                Load authoritative user
                ----------------------------------------------------------
                */

                const me =
                    await authService.getCurrentUser();

                const currentUser =
                    me?.data ??
                    me;

                setUser(
                    currentUser
                );

                /*
                ----------------------------------------------------------
                Start Socket.IO
                ----------------------------------------------------------
                */

                connectSocket(
                    token
                );

            }

            catch {

                disconnectSocket();

                clearAccessToken();

                setUser(null);

                setAccessTokenState(null);

            }

            finally {

                setLoading(false);

            }

        },

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Restore on application startup
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        void restoreSession();

    }, [

        restoreSession

    ]);

    /*
    |--------------------------------------------------------------------------
    | Authentication failure from Axios
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const handleAuthFailure = () => {

            disconnectSocket();

            clearAccessToken();

            setUser(null);

            setAccessTokenState(null);

        };

        window.addEventListener(

            "shadowdock:auth-failed",

            handleAuthFailure

        );

        return () => {

            window.removeEventListener(

                "shadowdock:auth-failed",

                handleAuthFailure

            );

        };

    }, []);

    /*
    |--------------------------------------------------------------------------
    | Keep Socket.IO token synchronized
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (accessToken) {

            updateSocketToken(
                accessToken
            );

        }

    }, [

        accessToken

    ]);

    /*
    |--------------------------------------------------------------------------
    | Context value
    |--------------------------------------------------------------------------
    */

    const value = useMemo(

        () => ({

            user,

            accessToken,

            loading,

            isAuthenticated:
                Boolean(user),

            login,

            logout,

            restoreSession

        }),

        [

            user,

            accessToken,

            loading,

            login,

            logout,

            restoreSession

        ]

    );

    return (

        <AuthContext.Provider

            value={value}

        >

            {children}

        </AuthContext.Provider>

    );

}

export default AuthContext;