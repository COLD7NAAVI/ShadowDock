import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import {
    useContext
} from "react";

import AuthContext from "../context/AuthContext.jsx";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import PublicRoute from "../components/PublicRoute.jsx";

import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Application Routes
|
| Responsibilities
|
| ✓ Read authentication state
| ✓ Configure React Router
| ✓ Protect private routes
| ✓ Redirect authenticated users
| ✓ Handle session restoration state
|
| Router and global providers are initialized in main.jsx.
|
|--------------------------------------------------------------------------
*/

function AppRouter() {

    const {
        loading
    } = useContext(AuthContext);

    /*
    |--------------------------------------------------------------------------
    | Wait Until Session Restore Completes
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "#020617",
                    color: "white",
                    fontSize: 22
                }}
            >
                Loading...
            </div>
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Application Routes
    |--------------------------------------------------------------------------
    */

    return (
        <Routes>

            {/* ------------------------------------------------------ */}
            {/* Guest Routes */}
            {/* ------------------------------------------------------ */}

            <Route element={<PublicRoute />}>

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

            </Route>


            {/* ------------------------------------------------------ */}
            {/* Protected Routes */}
            {/* ------------------------------------------------------ */}

            <Route element={<ProtectedRoute />}>

                <Route
                    path="/"
                    element={<HomePage />}
                />

            </Route>


            {/* ------------------------------------------------------ */}
            {/* Fallback */}
            {/* ------------------------------------------------------ */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );

}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default AppRouter;