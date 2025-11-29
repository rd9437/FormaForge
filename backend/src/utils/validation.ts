import { z } from "zod";

export const formFieldOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1)
});

export const formFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "textarea", "email", "number", "date", "datetime", "select", "checkbox", "radio", "file", "url", "phone"]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  options: z.array(formFieldOptionSchema).optional(),
  accept: z.array(z.string()).optional(),
  multiline: z.boolean().optional()
});

export const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  purpose: z.string().optional(),
  fields: z.array(formFieldSchema).min(1)
});

export type GeneratedFormSchema = z.infer<typeof formSchema>;
