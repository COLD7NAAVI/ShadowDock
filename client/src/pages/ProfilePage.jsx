import {

    useEffect,
    useState

} from "react";

import {

    useNavigate

} from "react-router-dom";

import useAuth from "../hooks/useAuth.js";

import {

    getMyProfile,
    updateMyProfile

} from "../services/user.js";


/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Profile Page
|
|--------------------------------------------------------------------------
*/

function ProfilePage() {

    const navigate =
        useNavigate();

    const {

        user,
        updateCurrentUser

    } = useAuth();


    const [

        profile,

        setProfile

    ] = useState(null);


    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        editing,

        setEditing

    ] = useState(false);


    const [

        saving,

        setSaving

    ] = useState(false);


    const [

        error,

        setError

    ] = useState("");


    const [

        form,

        setForm

    ] = useState({

        display_name: "",

        bio: "",

        avatar_url: ""

    });


    /*
    |--------------------------------------------------------------------------
    | Load Profile
    |--------------------------------------------------------------------------
    */

    useEffect(

        () => {

            let cancelled = false;

            async function loadProfile() {

                setLoading(true);

                setError("");

                try {

                    const response =
                        await getMyProfile();

                    const data =
                        response?.data ??
                        response;

                    if (cancelled) {

                        return;

                    }

                    setProfile(
                        data
                    );

                    setForm({

                        display_name:
                            data?.display_name ??
                            data?.displayName ??
                            "",

                        bio:
                            data?.bio ??
                            "",

                        avatar_url:
                            data?.avatar_url ??
                            data?.avatarUrl ??
                            ""

                    });

                }

                catch (

                    requestError

                ) {

                    console.error(

                        "Failed to load profile:",

                        requestError

                    );

                    if (!cancelled) {

                        setError(

                            "Failed to load your profile."

                        );

                    }

                }

                finally {

                    if (!cancelled) {

                        setLoading(false);

                    }

                }

            }

            void loadProfile();

            return () => {

                cancelled = true;

            };

        },

        []

    );


    /*
    |--------------------------------------------------------------------------
    | Form Change
    |--------------------------------------------------------------------------
    */

    function handleChange(

        event

    ) {

        const {

            name,
            value

        } = event.target;

        setForm(

            (

                current

            ) => ({

                ...current,

                [name]: value

            })

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Cancel Editing
    |--------------------------------------------------------------------------
    */

    function handleCancel() {

        setForm({

            display_name:
                profile?.display_name ??
                profile?.displayName ??
                "",

            bio:
                profile?.bio ??
                "",

            avatar_url:
                profile?.avatar_url ??
                profile?.avatarUrl ??
                ""

        });

        setEditing(false);

        setError("");

    }


    /*
    |--------------------------------------------------------------------------
    | Save Profile
    |--------------------------------------------------------------------------
    */

    async function handleSave(

        event

    ) {

        event.preventDefault();

        setSaving(true);

        setError("");

        try {

            const response =
                await updateMyProfile(

                    {

                        display_name:
                            form.display_name.trim(),

                        bio:
                            form.bio.trim(),

                        avatar_url:
                            form.avatar_url.trim()

                    }

                );

            const updatedProfile =
                response?.data ??
                response;

            setProfile(
                (

                    current

                ) => ({

                    ...current,

                    ...updatedProfile

                })

            );

            /*
            --------------------------------------------------------------
            Keep global authenticated user synchronized
            --------------------------------------------------------------
            */

            updateCurrentUser(
                updatedProfile
            );

            setEditing(false);

        }

        catch (

            requestError

        ) {

            console.error(

                "Failed to update profile:",

                requestError

            );

            setError(

                requestError
                    ?.response
                    ?.data
                    ?.message

                ??

                "Failed to update profile."

            );

        }

        finally {

            setSaving(false);

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="profile-page">

                <div className="profile-loading">

                    Loading profile...

                </div>

            </div>

        );

    }


    const displayName =
        profile?.display_name ??
        profile?.displayName ??
        user?.display_name ??
        user?.displayName ??
        user?.username ??
        "User";


    const username =
        profile?.username ??
        user?.username ??
        "";


    const publicId =
        profile?.public_id ??
        profile?.publicId ??
        user?.public_id ??
        user?.publicId ??
        "";


    const avatarUrl =
        profile?.avatar_url ??
        profile?.avatarUrl ??
        "";


    return (

        <div className="profile-page">

            <div className="profile-topbar">

                <button

                    className="profile-back-button"

                    onClick={() =>
                        navigate("/")
                    }

                >

                    ← Back

                </button>

                <h1>

                    Profile

                </h1>

                <div />

            </div>


            <main className="profile-content">

                <section className="profile-card">

                    <div className="profile-avatar">

                        {avatarUrl ? (

                            <img

                                src={avatarUrl}

                                alt={displayName}

                            />

                        ) : (

                            displayName
                                ?.charAt(0)
                                ?.toUpperCase()

                        )}

                    </div>


                    {!editing ? (

                        <>

                            <h2 className="profile-display-name">

                                {displayName}

                            </h2>

                            <div className="profile-username">

                                @{username}

                            </div>


                            <div className="profile-details">

                                <div className="profile-detail">

                                    <span>

                                        Public ID

                                    </span>

                                    <strong>

                                        {publicId}

                                    </strong>

                                </div>


                                <div className="profile-detail profile-bio">

                                    <span>

                                        Bio

                                    </span>

                                    <p>

                                        {
                                            profile?.bio ||
                                            "No bio yet."
                                        }

                                    </p>

                                </div>


                                <div className="profile-detail">

                                    <span>

                                        Status

                                    </span>

                                    <strong>

                                        {
                                            profile?.is_online
                                                ? "Online"
                                                : "Offline"
                                        }

                                    </strong>

                                </div>


                                {profile?.created_at && (

                                    <div className="profile-detail">

                                        <span>

                                            Joined

                                        </span>

                                        <strong>

                                            {

                                                new Date(

                                                    profile.created_at

                                                ).toLocaleDateString()

                                            }

                                        </strong>

                                    </div>

                                )}

                            </div>


                            {error && (

                                <div className="profile-error">

                                    {error}

                                </div>

                            )}


                            <button

                                className="profile-primary-button"

                                onClick={() =>
                                    setEditing(true)
                                }

                            >

                                Edit Profile

                            </button>

                        </>

                    ) : (

                        <form

                            className="profile-form"

                            onSubmit={handleSave}

                        >

                            <label>

                                Display name

                                <input

                                    type="text"

                                    name="display_name"

                                    value={
                                        form.display_name
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    minLength="2"

                                    maxLength="100"

                                    required

                                />

                            </label>


                            <label>

                                Bio

                                <textarea

                                    name="bio"

                                    value={
                                        form.bio
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    maxLength="500"

                                    rows="5"

                                />

                            </label>


                            <label>

                                Avatar URL

                                <input

                                    type="url"

                                    name="avatar_url"

                                    value={
                                        form.avatar_url
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    placeholder="https://..."

                                />

                            </label>


                            {error && (

                                <div className="profile-error">

                                    {error}

                                </div>

                            )}


                            <div className="profile-actions">

                                <button

                                    type="button"

                                    className="profile-secondary-button"

                                    onClick={
                                        handleCancel
                                    }

                                    disabled={saving}

                                >

                                    Cancel

                                </button>


                                <button

                                    type="submit"

                                    className="profile-primary-button"

                                    disabled={saving}

                                >

                                    {

                                        saving
                                            ? "Saving..."
                                            : "Save Changes"

                                    }

                                </button>

                            </div>

                        </form>

                    )}

                </section>

            </main>

        </div>

    );

}


export default ProfilePage;
