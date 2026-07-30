import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from "react";

import * as authService from "../services/auth.js";

import {
    connectSocket,
    disconnectSocket
} from "../services/socket.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Authentication Context
|
| Responsibilities
|
| ✓ Authentication State
| ✓ Current User
| ✓ Access Token
| ✓ Login
| ✓ Logout
| ✓ Session Restore
| ✓ Socket Lifecycle
|
|--------------------------------------------------------------------------
*/

const AuthContext = createContext(null);

export function AuthProvider({

    children

}) {

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [

        user,

        setUser

    ] = useState(null);

    const [

        accessToken,

        setAccessToken

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

            setUser(

                response.user

            );

            localStorage.setItem(
                "accessToken",
                response.accessToken
            );

            setAccessToken(

                response.accessToken

            );

            connectSocket(

                response.accessToken

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
                 Ignore logout failures.
                */

            }

            disconnectSocket();

            setUser(null);

            localStorage.removeItem(
                "accessToken"
            );

            setAccessToken(null);

        },

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Restore Session
    |--------------------------------------------------------------------------
    */

    const restoreSession = useCallback(

        async () => {

            try {

                /*
                 Refresh Access Token
                */

                const refreshResponse =

                    await authService.refresh();

                const token =

                    refreshResponse.accessToken;

                localStorage.setItem(
                    "accessToken",
                    token
                );


                setAccessToken(

                    token

                );

                connectSocket(

                    token

                );

                /*
                 Load Current User
                */

                const me =

                    await authService.getCurrentUser();

                setUser(

                    me.data

                );

            }

            catch {

                disconnectSocket();

                setUser(null);

                localStorage.removeItem(
                    "accessToken"
                );

                setAccessToken(null);

            }

            finally {

                setLoading(false);

            }

        },

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Restore On Startup
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const initialize = async () => {

         await restoreSession();

        };

        void initialize();

    }, [

        restoreSession

    ]);

    /*
    |--------------------------------------------------------------------------
    | Context Value
    |--------------------------------------------------------------------------
    */

    const value = useMemo(() => ({

        user,

        accessToken,

        loading,

        

        isAuthenticated: !!user,

        login,

        logout,

        restoreSession

    }), [

        user,

        accessToken,

        loading,

        login,

        logout,

        restoreSession

    ]);

    return (

        <AuthContext.Provider

            value={value}

        >

            {children}

        </AuthContext.Provider>

    );

}

export default AuthContext;