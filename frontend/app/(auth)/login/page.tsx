import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.wrapper}>
      <div className={styles.backdrop} />
      <section className={styles.container}>
        <AuthForm mode="login" />
        <p className={styles.switchPrompt}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
