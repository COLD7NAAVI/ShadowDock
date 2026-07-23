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
| Random String
|--------------------------------------------------------------------------
*/

function randomString(length) {
  const bytes = crypto.randomBytes(length);

  let output = "";

  for (const byte of bytes) {
    output += CHARSET[byte % CHARSET.length];
  }

  return output;
}

/*
|--------------------------------------------------------------------------
| Public ID Generator
|--------------------------------------------------------------------------
|
| Examples
|
| usr_A81KD29F
| chat_P82KSL92
| msg_H92KDJ2A
|
*/

export function generatePublicId(prefix) {
  return `${prefix}_${randomString(8)}`;
}

/*
|--------------------------------------------------------------------------
| Secure Random Code
|--------------------------------------------------------------------------
*/

export function generateSecureCode(length = 32) {
  return randomString(length);
}

/*
|--------------------------------------------------------------------------
| OTP
|--------------------------------------------------------------------------
*/

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/*
|--------------------------------------------------------------------------
| Backup Recovery Code
|--------------------------------------------------------------------------
*/

export function generateBackupCode() {
  return `${randomString(4)}-${randomString(4)}`;
}

/*
|--------------------------------------------------------------------------
| Invite Code
|--------------------------------------------------------------------------
*/

export function generateInviteCode() {
  return randomString(8);
}

/*
|--------------------------------------------------------------------------
| Device Pairing Code
|--------------------------------------------------------------------------
*/

export function generatePairingCode() {
  return randomString(6);
}

/*
|--------------------------------------------------------------------------
| API Secret
|--------------------------------------------------------------------------
*/

export function generateApiSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}