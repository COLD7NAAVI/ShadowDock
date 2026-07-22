import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Public Route
|
| Prevents authenticated users from
| visiting authentication pages.
|
| Responsibilities
|
| ✓ Wait for session restoration
| ✓ Show loading state
| ✓ Redirect authenticated users
| ✓ Render public content
|
|--------------------------------------------------------------------------
*/

export default function PublicRoute({

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
    | Already Logged In
    |--------------------------------------------------------------------------
    */

    if (user) {

        return (

            <Navigate

                to="/"

                replace

            />

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Guest User
    |--------------------------------------------------------------------------
    */

    return children;

}