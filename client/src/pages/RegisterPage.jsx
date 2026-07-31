import { useState } from "react";

import { Navigate } from "react-router-dom";

import * as authService from "../services/auth";

import { useContext } from "react";

import AuthContext from "../context/AuthContext";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Register Page
|--------------------------------------------------------------------------
*/

function RegisterPage() {

    const {

        isAuthenticated

    } = useContext(

        AuthContext

    );

    const [

        username,

        setUsername

    ] = useState("");

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

    const [

        success,

        setSuccess

    ] = useState("");

    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);

        setError("");

        setSuccess("");

        try {

            await authService.register({

                username,

                email,

                password

            });

            setSuccess(

                "Registration successful. Please login."

            );

            setUsername("");

            setEmail("");

            setPassword("");

        }

        catch (err) {

            setError(

                err?.response?.data?.message ||

                "Registration failed."

            );

        }

        finally {

            setLoading(false);

        }

    };

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

                    width: 400,

                    padding: 40,

                    background: "#0f172a",

                    borderRadius: 16,

                    display: "flex",

                    flexDirection: "column",

                    gap: 18

                }}

            >

                <h1>

                    Create Account

                </h1>

                <input

                    placeholder="Username"

                    value={username}

                    onChange={(event)=>

                        setUsername(

                            event.target.value

                        )

                    }

                />

                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={(event)=>

                        setEmail(

                            event.target.value

                        )

                    }

                />

                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={(event)=>

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

                {

                    success &&

                    <span>

                        {success}

                    </span>

                }

                <button

                    disabled={loading}

                >

                    {

                        loading

                        ?

                        "Creating..."

                        :

                        "Register"

                    }

                </button>

            </form>

        </div>

    );

}

export default RegisterPage;