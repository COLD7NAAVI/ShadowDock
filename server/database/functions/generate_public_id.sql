-- ==========================================================
-- ShadowDock Database Function
-- File: generate_public_id.sql
--
-- Description:
-- Generates cryptographically secure public IDs.
--
-- Examples:
--
-- usr_A8K2M7QP
-- msg_Z4R8PQWX
-- cht_KX9M72AB
-- att_Q7MP3WXR
--
-- Safe for every ShadowDock entity.
-- ==========================================================

------------------------------------------------------------
-- Required Extension
------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

------------------------------------------------------------
-- Public ID Generator
------------------------------------------------------------

CREATE OR REPLACE FUNCTION generate_public_id(

    prefix TEXT,
    id_length INTEGER DEFAULT 8

)

RETURNS TEXT

LANGUAGE plpgsql

AS
$$

DECLARE

    --------------------------------------------------------
    -- Character Set
    --
    -- Removed:
    -- O
    -- 0
    -- I
    -- 1
    -- L
    --------------------------------------------------------

    alphabet CONSTANT TEXT :=
        'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    alphabet_length CONSTANT INTEGER :=
        length(alphabet);

    random_bytes BYTEA;

    generated TEXT := '';

    random_value INTEGER;

    i INTEGER;

BEGIN

    --------------------------------------------------------
    -- Validation
    --------------------------------------------------------

    IF prefix IS NULL OR length(trim(prefix)) = 0 THEN

        RAISE EXCEPTION
            'Public ID prefix cannot be empty.';

    END IF;

    IF id_length < 6 THEN

        RAISE EXCEPTION
            'Public ID length must be at least 6.';

    END IF;

    IF id_length > 32 THEN

        RAISE EXCEPTION
            'Public ID length cannot exceed 32.';

    END IF;

    --------------------------------------------------------
    -- Secure Random Bytes
    --------------------------------------------------------

    random_bytes := gen_random_bytes(id_length);

    --------------------------------------------------------
    -- Generate Random Portion
    --------------------------------------------------------

    FOR i IN 0 .. id_length - 1 LOOP

        random_value := get_byte(random_bytes, i);

        generated := generated ||

            substr(

                alphabet,

                (random_value % alphabet_length) + 1,

                1

            );

    END LOOP;

    --------------------------------------------------------
    -- Return
    --------------------------------------------------------

    RETURN

        lower(trim(prefix))

        || '_'

        || generated;

END;

$$;

------------------------------------------------------------
-- Documentation
------------------------------------------------------------

COMMENT ON FUNCTION generate_public_id(TEXT, INTEGER)

IS

'Generates cryptographically secure public IDs for ShadowDock entities.';