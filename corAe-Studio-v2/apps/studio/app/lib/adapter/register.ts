// Importing this file anywhere will register available adapters
import { registerAdapter } from ".";
import { LocalAdapter } from "./providers/local";
import { OpenAIAdapter } from "./providers/openai";

registerAdapter(LocalAdapter);
registerAdapter(OpenAIAdapter);
