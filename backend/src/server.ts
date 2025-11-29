import "dotenv/config";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(helmet());
const corsOrigins = Array.isArray(env.CORS_ORIGIN) && env.CORS_ORIGIN.length > 0 ? env.CORS_ORIGIN : [/localhost/, /127\.0\.0\.1/];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  morgan("dev", {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  })
);

app.get("/api/health", (_request: Request, response: Response) => {
  response.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiRouter);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

void bootstrap();
