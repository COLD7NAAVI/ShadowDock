import {

    useState

} from "react";

import {

    Navigate

} from "react-router-dom";

import useAuth
    from "../hooks/useAuth.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Login Page
|--------------------------------------------------------------------------
*/

function LoginPage() {

    const {

        login,

        isAuthenticated

    } = useAuth();

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

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        if (!email.trim()) {

            setError(
                "Email is required."
            );

            return;

        }

        if (!password) {

            setError(
                "Password is required."
            );

            return;

        }

        setLoading(true);

        try {

            await login({

                email:
                    email.trim(),

                password

            });

        }

        catch (err) {

            setError(

                err?.response?.data?.message ||

                err?.response?.data?.errors?.[0]?.msg ||

                err?.message ||

                "Login failed."

            );

        }

        finally {

            setLoading(false);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Redirect
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

    return (

        <main className="auth-page">

            <section className="auth-card">

                <div className="auth-logo">

                    ◈

                </div>

                <h1>

                    ShadowDock

                </h1>

                <p className="auth-subtitle">

                    Secure communication.

                </p>

                <form

                    onSubmit={handleSubmit}

                    className="auth-form"

                >

                    <label>

                        Email

                        <input

                            type="email"

                            value={email}

                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }

                            autoComplete="username"

                            placeholder="Email"

                            disabled={loading}

                        />

                    </label>

                    <label>

                        Password

                        <input

                            type="password"

                            value={password}

                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }

                            autoComplete="current-password"

                            placeholder="Password"

                            disabled={loading}

                        />

                    </label>

                    {error && (

                        <div className="auth-error">

                            {error}

                        </div>

                    )}

                    <button

                        type="submit"

                        disabled={loading}

                        className="auth-button"

                    >

                        {loading
                            ? "Signing In..."
                            : "Login"}

                    </button>

                </form>

            </section>

        </main>

    );

}

export default LoginPage;