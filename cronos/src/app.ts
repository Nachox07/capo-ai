import express from 'express';
import { ConversationController } from './controllers/conversationController';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Initialize controller
const conversationController = new ConversationController(
  process.env.OPENAI_API_KEY || '',
  process.env.WEBHOOK_URL || ''
);

// Routes
app.post('/conversation', conversationController.handleConversation);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 