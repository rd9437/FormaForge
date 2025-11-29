'use client';

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { FormField, FormSchema, FormFieldOption } from "@/types";
import styles from "./form-renderer.module.css";

export interface FormRendererSubmission {
  values: { fieldId: string; value: string | string[] | number | boolean | null }[];
  files: { fieldId: string; files: File[] }[];
}

interface FormRendererProps {
  schema: FormSchema;
  submitLabel?: string;
  onSubmit?: (payload: FormRendererSubmission) => Promise<void> | void;
  disabled?: boolean;
}

type FieldValue = string | string[] | number | boolean | null;

function resolveDefaultValue(field: FormField): FieldValue {
  switch (field.type) {
    case "checkbox":
      return false;
    case "number":
      return "";
    case "select":
    case "radio":
      return field.options && field.options.length > 0 ? field.options[0].value : "";
    default:
      return "";
  }
}

export function FormRenderer({ schema, submitLabel = "Submit", onSubmit, disabled }: FormRendererProps) {
  const initialState = useMemo(() => {
    const values: Record<string, FieldValue> = {};
    schema.fields.forEach((field: FormField) => {
      values[field.id] = resolveDefaultValue(field);
    });
    return values;
  }, [schema.fields]);

  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(initialState);
  const [fileValues, setFileValues] = useState<Record<string, File[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleFieldChange = (field: FormField, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (field.type === "checkbox") {
      setFieldValues((prev: Record<string, FieldValue>) => ({
        ...prev,
        [field.id]: (event.target as HTMLInputElement).checked
      }));
      return;
    }

    setFieldValues((prev: Record<string, FieldValue>) => ({ ...prev, [field.id]: event.target.value }));
  };

  const handleSelectChange = (field: FormField, event: ChangeEvent<HTMLSelectElement>) => {
    setFieldValues((prev: Record<string, FieldValue>) => ({ ...prev, [field.id]: event.target.value }));
  };

  const handleFileChange = (field: FormField, event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const files = Array.from(event.target.files);
    setFileValues((prev: Record<string, File[]>) => ({ ...prev, [field.id]: files }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const values = schema.fields.map((field: FormField) => {
        const rawValue = fieldValues[field.id];
        let value: FieldValue = rawValue;

        if (field.type === "checkbox") {
          value = Boolean(rawValue);
        } else if (field.type === "number") {
          if (rawValue === "" || rawValue === null) {
            value = null;
          } else {
            const numericValue = Number(rawValue);
            value = Number.isNaN(numericValue) ? null : numericValue;
          }
        }

        return {
          fieldId: field.id,
          value
        };
      });

      const files = Object.entries(fileValues)
        .filter((entry): entry is [string, File[]] => Array.isArray(entry[1]) && entry[1].length > 0)
        .map(([fieldId, filesForField]) => ({
          fieldId,
          files: filesForField
        }));

      await onSubmit({ values, files });
    } catch (submitError) {
      console.error(submitError);
      setError("Unable to submit form. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = fieldValues[field.id];

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={field.id}
            className={styles.textarea}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(field, event)}
            value={String(value ?? "")}
            rows={field.multiline ? 6 : 4}
          />
        );
      case "select":
        return (
          <select
            id={field.id}
            className={styles.select}
            value={String(value ?? "")}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => handleSelectChange(field, event)}
            required={field.required}
          >
            {(field.options ?? []).map((option: FormFieldOption) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className={styles.radioGroup}>
            {(field.options ?? []).map((option: FormFieldOption) => (
              <label key={option.value} className={styles.radioOption}>
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => handleFieldChange(field, event)}
                  required={field.required}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <label className={styles.checkboxLabel}>
            <input
              id={field.id}
              type="checkbox"
              className={styles.checkboxInput}
              checked={Boolean(value)}
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleFieldChange(field, event)}
            />
            {field.placeholder ?? field.label}
          </label>
        );
      case "file":
        return (
          <input
            id={field.id}
            type="file"
            accept={(field.accept ?? ["*"]).join(",")}
            className={styles.fileInput}
            onChange={(event: ChangeEvent<HTMLInputElement>) => handleFileChange(field, event)}
            required={field.required}
          />
        );
      default:
        return (
          <input
            id={field.id}
            type={field.type === "phone" ? "tel" : field.type}
            className={styles.input}
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(event: ChangeEvent<HTMLInputElement>) => handleFieldChange(field, event)}
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {schema.fields.map((field: FormField) => (
        <div key={field.id} className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label htmlFor={field.id} className={styles.label}>
              {field.label}
              {field.required ? <span className={styles.required}>*</span> : null}
            </label>
            {field.description ? <span className={styles.description}>{field.description}</span> : null}
          </div>
          {renderField(field)}
        </div>
      ))}

      {error ? <p className={styles.error}>{error}</p> : null}

      {onSubmit ? (
        <div className={styles.actions}>
          <button type="submit" disabled={pending || disabled} className={styles.submit}>
            {pending ? "Submitting…" : submitLabel}
          </button>
        </div>
      ) : null}
    </form>
  );
}
