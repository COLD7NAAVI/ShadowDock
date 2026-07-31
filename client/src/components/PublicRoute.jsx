import { Navigate, Outlet } from "react-router-dom";

import { useContext } from "react";

import AuthContext from "../context/AuthContext";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Public Route
|
| Responsibilities
|
| ✓ Allow guests
| ✓ Redirect authenticated users
|
|--------------------------------------------------------------------------
*/

function PublicRoute() {

    const {

        loading,

        isAuthenticated

    } = useContext(

        AuthContext

    );

    /*
    |--------------------------------------------------------------------------
    | Wait Until Authentication Finishes
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
    | Already Logged In
    |--------------------------------------------------------------------------
    */

    if (isAuthenticated) {

        return (

            <Navigate

                to="/"

                replace

            />

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Guest
    |--------------------------------------------------------------------------
    */

    return <Outlet />;

}

export default PublicRoute;