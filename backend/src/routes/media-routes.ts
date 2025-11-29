import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { createSignature } from "../controllers/media-controller.js";

export const mediaRouter = Router();

mediaRouter.post("/signature", authRequired, createSignature);
