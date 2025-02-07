import { Request, Response } from "express";
import { StatementRequest } from "../validators/statementValidator";
import { OpenAIClient } from "../clients/OpenAIClient";
import { conversationManager } from "../state/conversationState";
import { submitRequestToCronos } from "../clients/chronos";

const DEFAULT_COMMAND = " (NOTE : I want a flight ticket refund)"

export async function statementHandler(
  req: Request<{}, {}, StatementRequest>,
  res: Response
) {
  try {
    var { prompt } = req.body;
    const { conversationId } = req.body;
    let conversation;
    let query = "";
    let chronosResponse;
    const TO_SUBMIT_REQUEST_TEXT = "Request submitted.";
    if (!conversationId) {
      conversation = conversationManager.createConversation({ prompt });
      query = `${prompt} Please tell me the necessary information to provide to airline customer service.\
        You don't need to specify the steps I need to take, just list up the information I need to provide.${DEFAULT_COMMAND}`;
    } else {
      // TODO Separate the new prompt with the context
      conversation = conversationManager.addMessageToConversation(
        conversationId,
        { prompt }
      );

      if (conversation.messages.length > 0) {
        const { messages } = conversation;
        console.debug("conversation's messages : ", messages)
        const problemStatement = messages
          .map(message => message.prompt)
          .join(" ");
        const responses = messages
          .map(message => message.response)
          .join(" ");
        query = `My problem statement was "${problemStatement}" and the responses were "${responses}". : Do I have all the information I need to resolve this query?. If yes, then respond with only text ${TO_SUBMIT_REQUEST_TEXT}, else list up the missing information without saying No."`;

        // console.debug("######query : ", query)
      }
    }
    const messageUpdateId =
      conversation.messages[conversation.messages.length - 1].id;
    conversationManager.updateConversationMessage(conversation.id, {
      query,
      id: messageUpdateId,
    });
    const openAIClient = new OpenAIClient();
    const response = await openAIClient.generateResponse(query);
    conversationManager.updateConversationMessage(conversation.id, {
      id: messageUpdateId,
      response,
    });

    if (response.includes(TO_SUBMIT_REQUEST_TEXT)) {
      console.debug("submitting request to cronos")
      chronosResponse = await submitRequestToCronos(conversation);
      console.debug("cronos response : ", chronosResponse)
    }
    res.json({ ...conversation, submittedResponse: chronosResponse });
  } catch (error) {
    console.error("Error processing statement:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
