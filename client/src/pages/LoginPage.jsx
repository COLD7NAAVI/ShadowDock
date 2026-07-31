import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useContext } from "react";

import AuthContext from "../context/AuthContext";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Login Page
|
| Responsibilities
|
| ✓ Collect credentials
| ✓ Authenticate user
| ✓ Show loading state
| ✓ Show server errors
|
| This page NEVER:
|
| ✗ Talks directly to API
| ✗ Stores tokens
| ✗ Connects sockets
|
|--------------------------------------------------------------------------
*/

function LoginPage() {

    const {

        login,

        isAuthenticated

    } = useContext(

        AuthContext

    );

    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    */

    const [

        email,

        setEmail

    ] = useState("");

    const [

        password,

        setPassword

    ] = useState("");

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        error,

        setError

    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);

        setError("");

        try {

            await login({

                email,

                password

            });

        }

        catch (err) {

            setError(

                err?.response?.data?.message ||

                "Login failed."

            );

        }

        finally {

            setLoading(false);

        }

    };

    /*
    |--------------------------------------------------------------------------
    | Already Logged In
    |--------------------------------------------------------------------------
    */

    if (isAuthenticated) {

        return <Navigate to="/" replace />;

    }

    return (

        <div
            style={{

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                height: "100vh",

                background: "#020617"

            }}
        >

            <form

                onSubmit={handleSubmit}

                style={{

                    width: 380,

                    padding: 40,

                    borderRadius: 16,

                    background: "#0f172a",

                    display: "flex",

                    flexDirection: "column",

                    gap: 18

                }}

            >

                <h1>

                    ShadowDock Login

                </h1>

                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={(event) =>

                        setEmail(

                            event.target.value

                        )

                    }

                />

                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={(event) =>

                        setPassword(

                            event.target.value

                        )

                    }

                />

                {

                    error &&

                    <span>

                        {error}

                    </span>

                }

                <button

                    disabled={loading}

                >

                    {

                        loading

                        ?

                        "Signing In..."

                        :

                        "Login"

                    }

                </button>

            </form>

        </div>

    );

}

export default LoginPage;