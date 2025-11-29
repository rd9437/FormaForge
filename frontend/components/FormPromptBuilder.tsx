'use client';

import { useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import { formApi } from "@/lib/api-client";
import { uploadImageViaCloudinary } from "@/lib/cloudinary";
import type { FormSchema, MemorySnippet } from "@/types";
import styles from "./form-prompt-builder.module.css";

interface FormPromptBuilderProps {
  onGenerated: (payload: { form: FormSchema; memories: MemorySnippet[] }) => void;
}

export function FormPromptBuilder({ onGenerated }: FormPromptBuilderProps) {
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const selected = Array.from(event.target.files);
    setAttachments((prev: File[]) => [...prev, ...selected].slice(0, 4));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError("Describe the form you need before generating.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        let uploadedMedia: string[] | undefined;
        if (attachments.length > 0) {
          uploadedMedia = [];
          for (const file of attachments) {
            const url = await uploadImageViaCloudinary(file);
            uploadedMedia.push(url);
          }
        }

        const result = await formApi.generate({ prompt, attachments: uploadedMedia });
        onGenerated({ form: result.form, memories: result.relatedMemories });
        setAttachments([]);
        setPrompt("");
      } catch (generateError) {
        console.error(generateError);
        setError("Something went wrong while generating the form. Please try again.");
      }
    });
  };

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>Describe your next form</h2>
        <p className={styles.subtitle}>
          Provide details like purpose, field requirements, and validation rules. Mention tone or validation needs for a more tailored schema.
        </p>
      </header>

      <div className={styles.promptArea}>
        <textarea
          value={prompt}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPrompt(event.target.value)}
          placeholder="I need a signup form with name, email, age, and profile picture."
          className={styles.textarea}
        />
      </div>

      <div className={styles.uploadArea}>
        <label className={styles.uploadLabel}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAttachmentChange}
            className={styles.fileInput}
          />
          Attach reference images (optional)
        </label>
        {attachments.length > 0 ? (
          <div className={styles.attachments}>
            {attachments.map((file) => (
              <span key={`${file.name}-${file.lastModified}`} className={styles.attachmentChip}>
                {file.name.length > 28 ? `${file.name.slice(0, 25)}…` : file.name}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.hint}>PNG, JPG, or WebP up to 4 files.</p>
        )}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button type="button" onClick={handleGenerate} disabled={isPending} className={styles.generateButton}>
          {isPending ? "Generating…" : "Generate form"}
        </button>
      </div>
    </section>
  );
}
