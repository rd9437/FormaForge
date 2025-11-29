'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEnsureProfile, useAuthStore } from "@/hooks/useAuth";
import { formApi } from "@/lib/api-client";
import type { FormSchema, MemorySnippet } from "@/types";
import { FormPromptBuilder } from "@/components/FormPromptBuilder";
import { FormRenderer } from "@/components/FormRenderer";
import styles from "./dashboard-client.module.css";

export function DashboardClient() {
  useEnsureProfile();
  const { user, loading } = useAuthStore();
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [memories, setMemories] = useState<MemorySnippet[]>([]);
  const [activeForm, setActiveForm] = useState<FormSchema | null>(null);
  const [isLoadingForms, setIsLoadingForms] = useState(false);

  useEffect(() => {
    const loadForms = async () => {
      try {
        setIsLoadingForms(true);
        const records = await formApi.list();
        setForms(records);
      } catch (error) {
        console.error("Failed to load forms", error);
      } finally {
        setIsLoadingForms(false);
      }
    };

    loadForms().catch(console.error);
  }, []);

  const handleGenerated = ({ form, memories: retrieved }: { form: FormSchema; memories: MemorySnippet[] }) => {
    setActiveForm(form);
    setMemories(retrieved);
    setForms((current: FormSchema[]) => {
      const exists = current.some((item: FormSchema) => item._id === form._id);
      return exists ? current.map((item: FormSchema) => (item._id === form._id ? form : item)) : [form, ...current];
    });
  };

  if (loading) {
    return <p className={styles.status}>Checking your session…</p>;
  }

  if (!user) {
    return (
      <div className={styles.signinCard}>
        <h2 className={styles.signinTitle}>Please sign in</h2>
        <p className={styles.signinText}>
          You must be authenticated to access the dashboard.{' '}
          <Link href="/login" className={styles.signinLink}>
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>Welcome back</span>
          <h1 className={styles.heroTitle}>Hi {user.name ?? user.email}</h1>
          <p className={styles.heroSubtitle}>
            Generate a new form using natural language. Relevant past schemas will be retrieved automatically.
          </p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.primaryColumn}>
          <FormPromptBuilder onGenerated={handleGenerated} />

          {activeForm ? (
            <section className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <div>
                  <h2 className={styles.previewTitle}>Preview: {activeForm.title}</h2>
                  <p className={styles.previewLink}>
                    Share link: <code>/form/{activeForm.sharingSlug}</code>
                  </p>
                </div>
                <Link href={`/dashboard/forms/${activeForm._id}`} className={styles.manageLink}>
                  Manage form
                </Link>
              </div>
              <div className={styles.previewBody}>
                <FormRenderer schema={activeForm} disabled />
              </div>
            </section>
          ) : null}
        </div>

        <aside className={styles.secondaryColumn}>
          {memories.length > 0 ? (
            <section className={styles.memoryCard}>
              <h3 className={styles.sectionTitle}>Contextual memory used</h3>
              <ul className={styles.memoryList}>
                {memories.map((memory) => (
                  <li key={memory.formId} className={styles.memoryItem}>
                    <h4>{memory.purpose || "Untitled form"}</h4>
                    <p>{memory.summary}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className={styles.formsCard}>
            <div className={styles.formsHeader}>
              <h3 className={styles.sectionTitle}>Recent forms</h3>
              <Link href="/dashboard/forms" className={styles.viewAll}>
                View all
              </Link>
            </div>
            {isLoadingForms ? (
              <p className={styles.status}>Loading forms…</p>
            ) : forms.length === 0 ? (
              <p className={styles.emptyState}>No forms yet. Generate your first form above.</p>
            ) : (
              <ul className={styles.formsList}>
                {forms.map((form) => (
                  <li key={form._id} className={styles.formItem}>
                    <h3>{form.title}</h3>
                    <p>{form.purpose ?? form.description}</p>
                    <div className={styles.formMeta}>
                      <span>Public link: /form/{form.sharingSlug}</span>
                      <Link href={`/dashboard/forms/${form._id}`} className={styles.openLink}>
                        Open
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
