'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { formApi } from "@/lib/api-client";
import type { FormSchema } from "@/types";
import styles from "./forms-list-client.module.css";

export function FormsListClient() {
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await formApi.list();
        setForms(result);
      } finally {
        setLoading(false);
      }
    };

    load().catch(console.error);
  }, []);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Your library</span>
        <h1 className={styles.title}>All forms</h1>
        <p className={styles.subtitle}>Manage the forms generated with FormaForge and jump into edits or sharing in seconds.</p>
      </header>

      {loading ? (
        <p className={styles.status}>Loading forms…</p>
      ) : forms.length === 0 ? (
        <p className={styles.status}>No forms yet. Generate one from the dashboard.</p>
      ) : (
        <ul className={styles.grid}>
          {forms.map((form: FormSchema) => (
            <li key={form._id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{form.title}</h3>
                <p className={styles.cardPurpose}>{form.purpose ?? form.description ?? "No summary provided."}</p>
              </div>
              <div className={styles.meta}>
                <span className={styles.linkBadge}>/form/{form.sharingSlug}</span>
                <span>{form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : ""}</span>
              </div>
              <div className={styles.actions}>
                <Link href={`/dashboard/forms/${form._id}`} className={styles.manageLink}>
                  Manage form
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
