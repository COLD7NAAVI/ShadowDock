import {

    BrowserRouter,

    Navigate,

    Route,

    Routes

} from "react-router-dom";

import {

    useContext

} from "react";

import AuthContext from "../context/AuthContext";

import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";

import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Application Routes
|
| Responsibilities
|
| ✓ Initialize Providers
| ✓ Configure React Router
| ✓ Protect private routes
| ✓ Redirect authenticated users
|
|--------------------------------------------------------------------------
*/

function AppRouter() {

    const {

        loading

    } = useContext(

        AuthContext

    );

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
| Root Router
|--------------------------------------------------------------------------
*/

function AppRoutes() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <SocketProvider>

                    <AppRouter />

                </SocketProvider>

            </AuthProvider>

        </BrowserRouter>

    );

}

export default AppRoutes;