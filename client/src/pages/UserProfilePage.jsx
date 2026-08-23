import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import {
    getUserProfile
} from "../services/user.js";

function UserProfilePage() {

    const {
        publicId
    } = useParams();

    const [

        user,

        setUser

    ] = useState(null);

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        error,

        setError

    ] = useState("");

    useEffect(() => {

        let cancelled = false;

        async function loadUser() {

            setLoading(true);

            setError("");

            try {

                const result =
                    await getUserProfile(
                        publicId
                    );

                if (cancelled) {

                    return;

                }

                setUser(
                    result.data
                );

            }

            catch (error) {

                if (cancelled) {

                    return;

                }

                console.error(
                    "Failed to load user profile:",
                    error
                );

                setError(
                    error?.response?.data?.message ||
                    "Failed to load user profile."
                );

            }

            finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }

        void loadUser();

        return () => {

            cancelled = true;

        };

    }, [

        publicId

    ]);

    if (loading) {

        return (

            <div className="profile-page">

                <div className="profile-loading">

                    Loading profile...

                </div>

            </div>

        );

    }

    if (error || !user) {

        return (

            <div className="profile-page">

                <div className="profile-error">

                    <h2>

                        User not found

                    </h2>

                    <p>

                        {error ||
                            "This user does not exist."}

                    </p>

                    <Link
                        to="/"
                        className="profile-back-button"
                    >

                        ← Back to chats

                    </Link>

                </div>

            </div>

        );

    }

    const displayName =

        user.display_name ||
        user.username ||
        "Unknown User";

    const avatarLetter =

        displayName
            .charAt(0)
            .toUpperCase();

    return (

        <div className="profile-page">

            <div className="profile-container">

                <div className="profile-topbar">

                    <Link
                        to="/"
                        className="profile-back-button"
                    >

                        ← Back

                    </Link>

                    <div className="profile-title">

                        User Profile

                    </div>

                </div>

                <div className="profile-card">

                    <div className="profile-avatar">

                        {

                            user.avatar_url
                                ? (

                                    <img
                                        src={
                                            user.avatar_url
                                        }
                                        alt={
                                            displayName
                                        }
                                    />

                                )
                                : (

                                    avatarLetter

                                )

                        }

                    </div>

                    <h1 className="profile-display-name">

                        {displayName}

                    </h1>

                    <div className="profile-username">

                        @{user.username}

                    </div>

                    <div
                        className={
                            user.is_online
                                ? "profile-status online"
                                : "profile-status"
                        }
                    >

                        <span
                            className="profile-status-dot"
                        />

                        {

                            user.is_online
                                ? "Online"
                                : "Offline"

                        }

                    </div>

                    <div className="profile-divider" />

                    <div className="profile-details">

                        <div className="profile-detail">

                            <span className="profile-detail-label">

                                Public ID

                            </span>

                            <span className="profile-detail-value">

                                {user.public_id}

                            </span>

                        </div>

                        <div className="profile-detail">

                            <span className="profile-detail-label">

                                Bio

                            </span>

                            <span className="profile-detail-value">

                                {

                                    user.bio ||
                                    "No bio yet."

                                }

                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default UserProfilePage;