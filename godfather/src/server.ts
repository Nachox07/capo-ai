import express from "express";
import cors from "cors";
import { validateRequest } from "./middleware/validateRequest";
import { statementSchema } from "./validators/statementValidator";
import { env } from "./config/env";
import { getAllConversations, getConversation } from "./handlers/conversation";
import { statementHandler } from "./handlers/statement";

const app = express();

app.use(cors());

app.use(express.json());

app.post("/statement", validateRequest(statementSchema), statementHandler);

app.get("/conversations/:id", getConversation);

app.get("/conversations", getAllConversations);

app.listen(env.PORT, () => {
  console.log(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
