-- ==========================================================
-- ShadowDock Database Helper Functions
-- File: helpers.sql
--
-- Description:
-- Generic reusable helper functions used throughout
-- the ShadowDock database.
--
-- These helpers are intentionally generic and contain
-- no business logic.
-- ==========================================================

------------------------------------------------------------
-- Required Extension
------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================================
-- Generate Account Number
--
-- Example:
-- 1000000001
-- 1000000002
-- ==========================================================

CREATE SEQUENCE IF NOT EXISTS account_number_seq

START WITH 1000000001

INCREMENT BY 1

MINVALUE 1000000001

NO MAXVALUE

CACHE 100;

CREATE OR REPLACE FUNCTION generate_account_number()

RETURNS BIGINT

LANGUAGE plpgsql

AS
$$

BEGIN

    RETURN nextval('account_number_seq');

END;

$$;

COMMENT ON FUNCTION generate_account_number()

IS

'Generates sequential ShadowDock account numbers.';

-- ==========================================================
-- Normalize Email
-- ==========================================================

CREATE OR REPLACE FUNCTION normalize_email(

    email_input TEXT

)

RETURNS TEXT

LANGUAGE plpgsql

IMMUTABLE

AS
$$

BEGIN

    IF email_input IS NULL THEN

        RETURN NULL;

    END IF;

    RETURN lower(trim(email_input));

END;

$$;

COMMENT ON FUNCTION normalize_email(TEXT)

IS

'Returns normalized email address.';

-- ==========================================================
-- Normalize Username
-- ==========================================================

CREATE OR REPLACE FUNCTION normalize_username(

    username_input TEXT

)

RETURNS TEXT

LANGUAGE plpgsql

IMMUTABLE

AS
$$

BEGIN

    IF username_input IS NULL THEN

        RETURN NULL;

    END IF;

    RETURN lower(trim(username_input));

END;

$$;

COMMENT ON FUNCTION normalize_username(TEXT)

IS

'Returns normalized username.';

-- ==========================================================
-- Clean Text
-- Removes leading/trailing whitespace
-- ==========================================================

CREATE OR REPLACE FUNCTION clean_text(

    value TEXT

)

RETURNS TEXT

LANGUAGE plpgsql

IMMUTABLE

AS
$$

BEGIN

    IF value IS NULL THEN

        RETURN NULL;

    END IF;

    RETURN trim(value);

END;

$$;

COMMENT ON FUNCTION clean_text(TEXT)

IS

'Removes leading and trailing whitespace.';

-- ==========================================================
-- Current UTC Timestamp
-- ==========================================================

CREATE OR REPLACE FUNCTION utc_now()

RETURNS TIMESTAMPTZ

LANGUAGE sql

STABLE

AS
$$

SELECT timezone('UTC', now());
$$;

COMMENT ON FUNCTION utc_now()

IS

'Returns current UTC timestamp.';

-- ==========================================================
-- UUID Validation
-- ==========================================================

CREATE OR REPLACE FUNCTION is_valid_uuid(

    uuid_text TEXT

)

RETURNS BOOLEAN

LANGUAGE plpgsql

IMMUTABLE

AS
$$

BEGIN

    RETURN uuid_text ~

    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';

END;

$$;

COMMENT ON FUNCTION is_valid_uuid(TEXT)

IS

'Checks whether a string is a valid UUID.';

-- ==========================================================
-- Public ID Validation
--
-- Examples:
--
-- usr_AB92KXQP
-- msg_QPW82KLM
-- cht_KJ72MZXP
-- ==========================================================

CREATE OR REPLACE FUNCTION is_valid_public_id(

    value TEXT

)

RETURNS BOOLEAN

LANGUAGE plpgsql

IMMUTABLE

AS
$$

BEGIN

    RETURN value ~

    '^[a-z]{3}_[A-Z2-9]{8}$';

END;

$$;

COMMENT ON FUNCTION is_valid_public_id(TEXT)

IS

'Checks whether a public ID matches the ShadowDock format.';