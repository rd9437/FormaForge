"use client";

import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import styles from "./register.module.css";

const HIGHLIGHTS = [
  "Generate forms with Gemini-backed schema building",
  "Store submissions and media securely in one place",
  "Track engagement with AI-powered memory retrieval"
];

export default function RegisterPage() {
  return (
    <main className={styles.wrapper}>
      <div className={styles.backdrop} />
      <section className={styles.panel}>
        <div className={styles.showcase}>
          <h2>Build intelligent forms in moments</h2>
          <p>
            FormaForge gives product, growth, and operations teams the speed of AI with the structure of an enterprise
            form builder. Unlock polished experiences in a single brief.
          </p>
          <div className={styles.highlightList}>
            {HIGHLIGHTS.map((item, index) => (
              <div key={item} className={styles.highlightItem}>
                <span className={styles.bullet}>{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formColumn}>
          <AuthForm mode="register" />
          <p className={styles.switchPrompt}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
