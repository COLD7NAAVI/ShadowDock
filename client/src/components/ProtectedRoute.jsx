import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Protected Route
|
| Prevents unauthenticated users
| from accessing protected pages.
|
| Responsibilities
|
| ✓ Wait for session restoration
| ✓ Show loading state
| ✓ Redirect guests to login
| ✓ Render protected content
|
|--------------------------------------------------------------------------
*/

export default function ProtectedRoute({

    children

}) {

    const {

        user,

        loading

    } = useAuth();

    /*
    |--------------------------------------------------------------------------
    | Wait Until Session Restores
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="app-loading">

                Loading...

            </div>

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Guest User
    |--------------------------------------------------------------------------
    */

    if (!user) {

        return (

            <Navigate

                to="/login"

                replace

            />

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Authenticated
    |--------------------------------------------------------------------------
    */

    return children;

}