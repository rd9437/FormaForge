'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { formApi, submissionApi } from "@/lib/api-client";
import type { FormField, FormSchema, FormSubmission, FormSubmissionFieldValue } from "@/types";
import { FormRenderer } from "@/components/FormRenderer";
import styles from "./form-detail-client.module.css";

interface FormDetailClientProps {
  formId: string;
}

export function FormDetailClient({ formId }: FormDetailClientProps) {
  const [form, setForm] = useState<FormSchema | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [formResponse, submissionResponse] = await Promise.all([
          formApi.byId(formId),
          submissionApi.listForForm(formId)
        ]);
        setForm(formResponse);
        setSubmissions(submissionResponse);
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load form details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    load().catch(console.error);
  }, [formId]);

  if (loading) {
    return <p className={styles.status}>Loading…</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!form) {
    return <p className={styles.status}>Form not found.</p>;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Form overview</span>
          <h1 className={styles.heroTitle}>{form.title}</h1>
          <p className={styles.heroSubtitle}>{form.description ?? "Preview and manage your generated form."}</p>
          <div className={styles.heroMeta}>
            <span>Shareable URL:</span>
            <code>/form/{form.sharingSlug}</code>
            <Link href={`/form/${form.sharingSlug}`} className={styles.heroLink}>
              View public form
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <section className={styles.previewCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Live form preview</h2>
              <p className={styles.cardSubtitle}>Preview how respondents experience this form in real time.</p>
            </div>
            <Link href="/dashboard/forms" className={styles.secondaryLink}>
              Back to forms
            </Link>
          </div>
          <div className={styles.previewInner}>
            <FormRenderer schema={form} disabled />
          </div>
        </section>

        <section className={styles.submissionsCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Submissions</h2>
              <p className={styles.cardSubtitle}>Track incoming responses and review uploads instantly.</p>
            </div>
          </div>
          {submissions.length === 0 ? (
            <p className={styles.empty}>No submissions yet.</p>
          ) : (
            <div className={styles.submissionList}>
              {submissions.map((submission: FormSubmission) => (
                <article key={submission._id} className={styles.submissionCard}>
                  <div className={styles.submissionMeta}>
                    <span>Submission</span>
                    <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                  </div>
                  <dl>
                    {submission.values.map((entry: FormSubmissionFieldValue) => {
                      const fieldDefinition = form.fields.find((field: FormField) => field.id === entry.fieldId);
                      return (
                        <div key={entry.fieldId} className={styles.field}>
                          <dt className={styles.fieldLabel}>{fieldDefinition?.label ?? entry.fieldId}</dt>
                          <dd className={styles.fieldValue}>
                            {Array.isArray(entry.value) ? entry.value.join(", ") : String(entry.value ?? "")}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                  {submission.media && submission.media.length > 0 ? (
                    <div className={styles.mediaList}>
                      {submission.media.map((url: string, index: number) => (
                        <a key={`${url}-${index}`} href={url} target="_blank" rel="noopener noreferrer" className={styles.mediaLink}>
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
