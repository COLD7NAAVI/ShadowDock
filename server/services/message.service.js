import {
  createMessage,
  getMessages,
} from "../repositories/message.repository.js";

export async function saveMessage(
  chatId,
  sender,
  text
) {
  return await createMessage(
    chatId,
    sender,
    text
  );
}

export async function fetchMessages(
  chatId
) {
  return await getMessages(chatId);
}