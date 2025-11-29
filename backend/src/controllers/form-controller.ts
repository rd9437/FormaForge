import type { Request, Response } from "express";
import { z } from "zod";
import { generateFormForUser, listForms, getFormById, getFormBySlug } from "../services/form-service.js";
import { recordSubmission, listSubmissionsForForm } from "../services/submission-service.js";
import { SubmissionModel } from "../models/Submission.js";
import { FormModel } from "../models/Form.js";
import { logger } from "../utils/logger.js";

const generatePayloadSchema = z.object({
  prompt: z.string().min(5),
  attachments: z.array(z.string().url()).optional()
});

const updateFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  purpose: z.string().optional()
});

const submissionSchema = z.object({
  values: z
    .array(
      z.object({
        fieldId: z.string(),
        value: z.union([z.string(), z.array(z.string()), z.number(), z.boolean(), z.null()])
      })
    )
    .min(1),
  media: z.array(z.string().url()).optional()
});

export async function generateForm(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = generatePayloadSchema.parse(request.body);
    const { form, memories } = await generateFormForUser({
      user: request.user,
      prompt: payload.prompt,
      attachments: payload.attachments
    });

    response.status(201).json({
      form,
      relatedMemories: memories
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: error.errors.map((issue) => issue.message).join(", ") });
      return;
    }

    logger.error({ err: error }, "Failed to generate form" );
    response.status(500).json({ message: error instanceof Error ? error.message : "Unable to generate form" });
  }
}

export async function listUserForms(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const forms = await listForms(request.user.id);
  response.json(forms);
}

export async function getUserForm(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const form = await getFormById(request.user._id.toString(), request.params.formId);
  if (!form) {
    response.status(404).json({ message: "Form not found" });
    return;
  }

  response.json(form);
}

export async function updateForm(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const payload = updateFormSchema.parse(request.body);
  const form = await FormModel.findOneAndUpdate(
    { _id: request.params.formId, ownerId: request.user._id },
    payload,
    { new: true }
  ).exec();

  if (!form) {
    response.status(404).json({ message: "Form not found" });
    return;
  }

  response.json(form);
}

export async function deleteForm(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const result = await FormModel.deleteOne({ _id: request.params.formId, ownerId: request.user._id }).exec();
  await SubmissionModel.deleteMany({ formId: request.params.formId }).exec();

  if (result.deletedCount === 0) {
    response.status(404).json({ message: "Form not found" });
    return;
  }

  response.json({ success: true });
}

export async function listFormSubmissions(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const form = await getFormById(request.user._id.toString(), request.params.formId);
  if (!form) {
    response.status(404).json({ message: "Form not found" });
    return;
  }

  const submissions = await listSubmissionsForForm(form.id);
  response.json(submissions);
}

export async function getPublicForm(request: Request, response: Response): Promise<void> {
  const form = await getFormBySlug(request.params.slug);
  if (!form) {
    response.status(404).json({ message: "Form not found" });
    return;
  }

  response.json(form);
}

export async function submitPublicForm(request: Request, response: Response): Promise<void> {
  const form = await getFormBySlug(request.params.slug);
  if (!form) {
    response.status(404).json({ message: "Form not found" });
    return;
  }

  const payload = submissionSchema.parse(request.body);
  const submission = await recordSubmission({
    form,
    values: payload.values,
    media: payload.media
  });

  response.status(201).json(submission);
}
