import serverless from "serverless-http";
import app from "../backend/src/server.js";

export default serverless(app);