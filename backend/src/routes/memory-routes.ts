import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { listMemories } from "../controllers/memory-controller.js";

export const memoryRouter = Router();

memoryRouter.get("/", authRequired, listMemories);
