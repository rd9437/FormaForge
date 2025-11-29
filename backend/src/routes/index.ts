import { Router } from "express";
import { authRouter } from "./auth-routes.js";
import { formRouter, publicFormRouter } from "./form-routes.js";
import { mediaRouter } from "./media-routes.js";
import { memoryRouter } from "./memory-routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/forms", formRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/memories", memoryRouter);
apiRouter.use("/public/forms", publicFormRouter);
