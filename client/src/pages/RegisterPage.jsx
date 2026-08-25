import {
    useState,
    useContext
} from "react";

import {
    Navigate,
    Link
} from "react-router-dom";

import * as authService
    from "../services/auth";

import AuthContext
    from "../context/AuthContext";

/*
|--------------------------------------------------------------------------
| ShadowDock Register Page
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
        confirmPassword,
        setConfirmPassword
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

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (!username.trim()) {

            setError(
                "Username is required."
            );

            return;

        }

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

        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;

        }

        setLoading(true);

        try {

            await authService.register({

                username:
                    username.trim(),

                email:
                    email.trim(),

                password

            });

            setSuccess(
                "Account created successfully. You can now log in."
            );

            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

        }

        catch (err) {

            setError(

                err?.response?.data?.message ||

                err?.response?.data?.errors?.[0]?.msg ||

                "Registration failed."

            );

        }

        finally {

            setLoading(false);

        }

    };

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

                    Create Account

                </h1>

                <p className="auth-subtitle">

                    Join ShadowDock and start communicating.

                </p>

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    <label>

                        Username

                        <input
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            autoComplete="username"
                            placeholder="Username"
                            disabled={loading}
                        />

                    </label>

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
                            autoComplete="email"
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
                            autoComplete="new-password"
                            placeholder="Password"
                            disabled={loading}
                        />

                    </label>

                    <label>

                        Confirm Password

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            disabled={loading}
                        />

                    </label>

                    {error && (

                        <div className="auth-error">

                            {error}

                        </div>

                    )}

                    {success && (

                        <div className="auth-success">

                            {success}

                        </div>

                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-button"
                    >

                        {loading
                            ? "Creating Account..."
                            : "Create Account"}

                    </button>

                </form>

                <p className="auth-switch">

                    Already have an account?

                    {" "}

                    <Link to="/login">

                        Login

                    </Link>

                </p>

            </section>

        </main>

    );

}

export default RegisterPage;