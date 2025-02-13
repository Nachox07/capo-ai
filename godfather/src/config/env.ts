import { z } from "zod";
import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "development"
    ? ".env.development"
    : process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.test";

dotenv.config({ path: envFile });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("3000"),
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  CRONOS_URL: z.string().min(1, "Cronos URL is required"),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error(
    "❌ Invalid environment variables:",
    envValidation.error.format()
  );
  process.exit(1);
}

export const env = envValidation.data;
