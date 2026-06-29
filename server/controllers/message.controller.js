import {
  fetchMessages,
} from "../services/message.service.js";

export async function getMessages(
  req,
  res,
  next
) {
  try {
    const messages =
      await fetchMessages(
        req.params.chatId
      );

    res.json(messages);
  } catch (err) {
    next(err);
  }
}