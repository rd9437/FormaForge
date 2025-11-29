import { Schema, model, Types, type Document } from "mongoose";

export interface SubmissionFieldValue {
  fieldId: string;
  value: string | string[] | number | boolean | null;
}

export interface SubmissionDocument extends Document {
  formId: Types.ObjectId;
  ownerId: Types.ObjectId;
  values: SubmissionFieldValue[];
  media: string[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionFieldValueSchema = new Schema<SubmissionFieldValue>(
  {
    fieldId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: false }
  },
  { _id: false }
);

const SubmissionSchema = new Schema<SubmissionDocument>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    values: { type: [SubmissionFieldValueSchema], default: [] },
    media: { type: [String], default: [] },
    submittedAt: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);

SubmissionSchema.index({ formId: 1, submittedAt: -1 });
SubmissionSchema.index({ ownerId: 1, submittedAt: -1 });

export const SubmissionModel = model<SubmissionDocument>("Submission", SubmissionSchema);
