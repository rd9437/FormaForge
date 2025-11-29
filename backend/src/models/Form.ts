import { Schema, model, Types, type Document } from "mongoose";

export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "url"
  | "phone";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: FormFieldOption[];
  accept?: string[];
  multiline?: boolean;
}

export interface FormDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  ownerId: Types.ObjectId;
  title: string;
  description?: string;
  purpose?: string;
  sharingSlug: string;
  fields: FormField[];
  embeddingVector?: number[];
  memorySummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldOptionSchema = new Schema<FormFieldOption>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const FormFieldSchema = new Schema<FormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    placeholder: { type: String },
    description: { type: String },
    options: { type: [FormFieldOptionSchema], default: [] },
    accept: { type: [String], default: undefined },
    multiline: { type: Boolean, default: false }
  },
  { _id: false }
);

const FormSchema = new Schema<FormDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    purpose: { type: String },
    sharingSlug: { type: String, required: true, unique: true },
    fields: { type: [FormFieldSchema], default: [] },
    embeddingVector: { type: [Number], default: undefined },
    memorySummary: { type: String }
  },
  { timestamps: true }
);

FormSchema.index({ ownerId: 1, title: 1 });
FormSchema.index({ ownerId: 1, purpose: 1 });
FormSchema.index({ ownerId: 1, sharingSlug: 1 });

export const FormModel = model<FormDocument>("Form", FormSchema);
