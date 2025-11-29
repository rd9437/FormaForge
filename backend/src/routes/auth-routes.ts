import { Router } from "express";
import { login, logout, profile, register } from "../controllers/auth-controller.js";
import { authRequired } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/profile", authRequired, profile);
