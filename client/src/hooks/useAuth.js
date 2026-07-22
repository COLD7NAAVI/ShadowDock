import { useContext } from "react";

import AuthContext from "../context/AuthContext.jsx";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Authentication Hook
|
| Provides access to the global authentication state.
|
| Responsibilities
|
| ✓ Current User
| ✓ Login
| ✓ Logout
| ✓ Register
| ✓ Refresh Session
| ✓ Loading State
|
|--------------------------------------------------------------------------
*/

export default function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(

            "useAuth must be used inside AuthProvider."

        );

    }

    return context;

}