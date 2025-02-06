import axios, { AxiosResponse } from "axios";
import { Conversation } from "../types/conversation";

export async function submitRequestToCronos(context: Conversation) {
  return await axios
    .post(`${process.env.CRONOS_URL}/conversation`, {
      context: JSON.stringify(context),
    })
    .then((response: AxiosResponse) => {
      return {
        summary: response.data.response.summary,
        messages: response.data.response.messages,
        }
    })
    .catch((error) => {
      console.error("Failed to send response to webhook:", error);
      throw new Error("Failed to send response to webhook");
    });
}
