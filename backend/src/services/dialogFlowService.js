import dotenv from "dotenv";
import dialogflow from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

const sessionClient = new dialogflow.SessionsClient({
  projectId,
  credentials: {
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

function parseParameters(fields) {
  const entities = {};

  for (let key in fields) {
    const field = fields[key];

    if (field.stringValue) {
      entities[key] = field.stringValue;
    } else if (field.numberValue !== undefined) {
      entities[key] = field.numberValue;
    } else if (field.boolValue !== undefined) {
      entities[key] = field.boolValue;
    } else if (field.listValue) {
      entities[key] = field.listValue.values.map(
        (v) => v.stringValue || v.numberValue
      );
    } else if (field.structValue) {
      entities[key] = parseParameters(field.structValue.fields);
    }
  }

  return entities;
}

export async function detectIntent(text, languageCode = "en") {
  const sessionId = uuidv4();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;

  const entities = result.parameters?.fields
    ? parseParameters(result.parameters.fields)
    : {};

  return {
    intent: result.intent?.displayName || "unknown",
    entities,
  };
}
