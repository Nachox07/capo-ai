import axios, { AxiosResponse } from "axios";
import { Conversation } from "../types/conversation";

export async function submitRequestToCronos(context: Conversation) {
  return await axios
    .post(`${process.env.CRONOS_URL}/conversation`, {
      context,
    })
    .then((response: AxiosResponse) => ({
      summary: response.data.summary,
      messages: response.data.messages,
    }))
    .catch((error) => {
      console.error("Failed to send response to webhook:", error);
      throw new Error("Failed to send response to webhook");
    });
}
