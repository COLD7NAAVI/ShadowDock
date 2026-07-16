import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| Character Set
|--------------------------------------------------------------------------
|
| URL-safe.
| No ambiguous characters.
|
*/

const CHARSET =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/*
|--------------------------------------------------------------------------
| Generate Random String
|--------------------------------------------------------------------------
*/

function randomString(length) {

    const bytes = crypto.randomBytes(length);

    let output = "";

    for (const byte of bytes) {

        output += CHARSET[
            byte % CHARSET.length
        ];

    }

    return output;

}

/*
|--------------------------------------------------------------------------
| Generate Secure Code
|--------------------------------------------------------------------------
|
| Used for:
|
| • Email verification
| • Password reset
| • Device pairing
| • Backup codes
| • Invite codes
|
*/

export function generateSecureCode(
    length = 32
) {

    return randomString(length);

}

/*
|--------------------------------------------------------------------------
| OTP
|--------------------------------------------------------------------------
|
| Six-digit numeric code.
|
*/

export function generateOtp() {

    return crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();

}

/*
|--------------------------------------------------------------------------
| Backup Recovery Code
|--------------------------------------------------------------------------
|
| Example:
|
| K9X7-M4PQ
|
*/

export function generateBackupCode() {

    return `${randomString(4)}-${randomString(4)}`;

}

/*
|--------------------------------------------------------------------------
| Invite Code
|--------------------------------------------------------------------------
|
| Example:
|
| 8HJ2QW9P
|
*/

export function generateInviteCode() {

    return randomString(8);

}

/*
|--------------------------------------------------------------------------
| Device Pairing Code
|--------------------------------------------------------------------------
|
| Example:
|
| 4K8N2P
|
*/

export function generatePairingCode() {

    return randomString(6);

}

/*
|--------------------------------------------------------------------------
| API Key / Secret
|--------------------------------------------------------------------------
|
| Cryptographically secure hexadecimal token.
|
*/

export function generateApiSecret(
    bytes = 32
) {

    return crypto
        .randomBytes(bytes)
        .toString("hex");

}