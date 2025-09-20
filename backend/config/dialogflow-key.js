import dotenv from "dotenv";
dotenv.config();

const config = {
  projectId: process.env.DIALOGFLOW_PROJECT_ID,
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
  },
};