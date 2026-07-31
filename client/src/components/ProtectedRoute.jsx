import { Navigate, Outlet } from "react-router-dom";

import { useContext } from "react";

import AuthContext from "../context/AuthContext";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Protected Route
|
| Responsibilities
|
| ✓ Wait until authentication initialization finishes
| ✓ Allow authenticated users
| ✓ Redirect guests to Login
|
|--------------------------------------------------------------------------
*/

function ProtectedRoute() {

    const {

        loading,

        isAuthenticated

    } = useContext(

        AuthContext

    );

    /*
    |--------------------------------------------------------------------------
    | Wait Until Auth Is Ready
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div
                style={{

                    height: "100vh",

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    fontSize: "18px",

                    fontWeight: 600

                }}
            >

                Loading ShadowDock...

            </div>

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Not Logged In
    |--------------------------------------------------------------------------
    */

    if (!isAuthenticated) {

        return (

            <Navigate

                to="/login"

                replace

            />

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Logged In
    |--------------------------------------------------------------------------
    */

    return <Outlet />;

}

export default ProtectedRoute;