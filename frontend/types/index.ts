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

export interface FormSchema {
  _id?: string;
  ownerId?: string;
  title: string;
  description?: string;
  purpose?: string;
  sharingSlug: string;
  fields: FormField[];
  createdAt?: string;
  updatedAt?: string;
  embeddingVector?: number[];
}

export interface FormSubmissionFieldValue {
  fieldId: string;
  value: string | string[] | number | boolean | null;
}

export interface FormSubmission {
  _id?: string;
  formId: string;
  submittedAt: string;
  values: FormSubmissionFieldValue[];
  media?: string[];
}

export interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  organization?: string;
  createdAt: string;
}

export interface MemorySnippet {
  formId: string;
  purpose: string;
  highlights: string[];
  summary: string;
}

export interface GenerateFormResponse {
  form: FormSchema;
  relatedMemories: MemorySnippet[];
}
