'use client';

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/hooks/useAuth";
import styles from "./auth-form.module.css";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = mode === "login" ? "Welcome back" : "Create your FormaForge account";
  const cta = mode === "login" ? "Sign in" : "Sign up";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = mode === "register" ? { email, password, name } : { email, password };
      const result = mode === "register" ? await authApi.register(payload) : await authApi.login(payload);
      setUser(result.user);
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h1>{heading}</h1>
        <p>
          {mode === "login"
            ? "Access your generated forms and submissions dashboard."
            : "Describe new forms, generate schemas, and share them instantly."}
        </p>
      </div>

      {mode === "register" ? (
        <label className={styles.field} htmlFor="name">
          <span>Full name</span>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        </label>
      ) : null}

      <label className={styles.field} htmlFor="email">
        <span>Email</span>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>

      <label className={styles.field} htmlFor="password">
        <span>Password</span>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}

      <button type="submit" disabled={loading} className={styles.submit}>
        {loading ? "Please wait…" : cta}
      </button>
    </form>
  );
}
