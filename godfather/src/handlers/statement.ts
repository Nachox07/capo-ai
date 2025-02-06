import { Request, Response } from "express";
import { StatementRequest } from "../validators/statementValidator";
import { OpenAIClient } from "../clients/OpenAIClient";
import { conversationManager } from "../state/conversationState";
import { submitRequestToCronos } from "../clients/chronos";
import { Conversation } from "../types/conversation";

const openAIClient = new OpenAIClient();
const TO_SUBMIT_REQUEST_TEXT = "Request submitted.";

export async function getPromptAnalysis(prompt: string): Promise<string> {
  return openAIClient.generateResponse(
    `"${prompt}" - If this is greeting, return only "1", if this is a query return only "2", if this is a detail to the query return only "3". Return only the number and no text`
  );
}

function generateQuery(
  prompt: string,
  promptType: string,
  conversation: Conversation
) {
  let query = "";

  switch (promptType) {
    case "1":
      query = `Reply to '${prompt}'`;
      break;
    case "2":
      query = `'${prompt}'. If you were customer service, what information would you need to resolve this query?. Ask it like, please provide me your name, email etc`;
      break;
    case "3":
      const { messages } = conversation;
      console.debug("conversation's messages : ", messages);
      const problemStatement = messages
        .map((message) => message.prompt)
        .join(" ");
      const responses = messages.map((message) => message.response).join(" ");
      query = `My problem statement was "${problemStatement}" and the responses were "${responses}". : Do I have all the information I need to resolve this query as customer service?. If yes, then respond with only text ${TO_SUBMIT_REQUEST_TEXT}, else list up the missing information by just saying Please provide ....."`;
      break;
    default:
  }
  return query;
}

export async function statementHandler(
  req: Request<{}, {}, StatementRequest>,
  res: Response
) {
  try {
    var { prompt } = req.body;
    const { conversationId } = req.body;
    let conversation;
    let chronosResponse;
    const promptType = await getPromptAnalysis(prompt);
    console.log("Prompt Type : ", promptType);

    var query = "";

    if (!conversationId) {
      conversation = conversationManager.createConversation({
        prompt,
        promptType,
      });
      query = generateQuery(prompt, promptType, conversation);
    } else {
      conversation = conversationManager.addMessageToConversation(
        conversationId,
        { prompt }
      );
      query = generateQuery(prompt, promptType, conversation);
    }
    const messageUpdateId =
      conversation.messages[conversation.messages.length - 1].id;
    conversationManager.updateConversationMessage(conversation.id, {
      query,
      id: messageUpdateId,
    });
    console.log("Query is: ", query);
    const response = await openAIClient.generateResponse(query);
    conversationManager.updateConversationMessage(conversation.id, {
      id: messageUpdateId,
      response,
    });

    if (response.includes(TO_SUBMIT_REQUEST_TEXT)) {
      console.debug("submitting request to cronos");
      chronosResponse = await submitRequestToCronos(conversation);
    }
    res.json({ ...conversation, submittedResponse: chronosResponse });
  } catch (error) {
    console.error("Error processing statement:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
