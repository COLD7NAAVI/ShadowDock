import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| Character Set
|--------------------------------------------------------------------------
|
| URL-safe.
| No confusing characters.
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
    output += CHARSET[byte % CHARSET.length];
  }

  return output;
}

/*
|--------------------------------------------------------------------------
| Public ID Generator
|--------------------------------------------------------------------------
|
| Examples:
|
| user_xxxxxxxxxxxxxxxx
| chat_xxxxxxxxxxxxxxxx
| msg_xxxxxxxxxxxxxxxx
| att_xxxxxxxxxxxxxxxx
|
*/
const DEFAULT_ID_LENGTH = 16;
export function generatePublicId(
  prefix,
  length = DEFAULT_ID_LENGTH
) {
  return `${prefix}_${randomString(length)}`;
}

/*
|--------------------------------------------------------------------------
| Convenience Helpers
|--------------------------------------------------------------------------
*/

export const generateUserPublicId = () =>
  generatePublicId("user");

export const generateChatPublicId = () =>
  generatePublicId("chat");

export const generateMessagePublicId = () =>
  generatePublicId("msg");

export const generateAttachmentPublicId = () =>
  generatePublicId("att");

export const generateInvitePublicId = () =>
  generatePublicId("invite");

export const generateNotificationPublicId = () =>
  generatePublicId("notif");