"use client";

import Link from "next/link";
import styles from "./home.module.css";

const FEATURES = [
  "Generate production-ready schemas in minutes",
  "Reuse knowledge from past launches automatically",
  "Share public links with media uploads built in"
];

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.badge}>AI Powered Form Builder</span>
        <h1 className={styles.title}>Launch forms faster with FormaForge</h1>
        <p className={styles.copy}>
          Describe the experience, attach inspiration, and watch the schema assemble itself. Publish instantly,
          collect rich submissions, and keep every interaction in context with AI-assisted memory.
        </p>

        <div className={styles.ctaRow}>
          <Link href="/register" className={styles.ctaPrimary}>
            Create account <span className={styles.arrow}>-&gt;</span>
          </Link>
          <Link href="/login" className={styles.ctaSecondary}>
            Sign in
          </Link>
        </div>

        <div className={styles.featureCard}>
          {FEATURES.map((feature) => (
            <div key={feature} className={styles.feature}>
              <span className={styles.check} aria-hidden="true" />
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
