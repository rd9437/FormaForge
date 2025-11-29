import { SubmissionModel, type SubmissionFieldValue, type SubmissionDocument } from "../models/Submission.js";
import type { FormDocument } from "../models/Form.js";

export async function recordSubmission(params: {
  form: FormDocument;
  values: SubmissionFieldValue[];
  media?: string[];
}): Promise<SubmissionDocument> {
  return SubmissionModel.create({
    formId: params.form._id,
    ownerId: params.form.ownerId,
    values: params.values,
    media: params.media ?? []
  });
}

export async function listSubmissionsForForm(formId: string): Promise<SubmissionDocument[]> {
  return SubmissionModel.find({ formId }).sort({ submittedAt: -1 }).exec();
}
