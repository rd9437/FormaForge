import { Router } from "express";
import {
  deleteForm,
  generateForm,
  getPublicForm,
  getUserForm,
  listFormSubmissions,
  listUserForms,
  submitPublicForm,
  updateForm
} from "../controllers/form-controller.js";
import { authRequired } from "../middleware/auth.js";

export const formRouter = Router();

formRouter.post("/generate", authRequired, generateForm);
formRouter.get("/", authRequired, listUserForms);
formRouter.get("/:formId", authRequired, getUserForm);
formRouter.patch("/:formId", authRequired, updateForm);
formRouter.delete("/:formId", authRequired, deleteForm);
formRouter.get("/:formId/submissions", authRequired, listFormSubmissions);

export const publicFormRouter = Router();

publicFormRouter.get("/:slug", getPublicForm);
publicFormRouter.post("/:slug/submit", submitPublicForm);
