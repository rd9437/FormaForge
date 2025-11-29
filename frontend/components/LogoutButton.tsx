'use client';

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/hooks/useAuth";
import styles from "./logout-button.module.css";

export function LogoutButton() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await authApi.logout();
      } finally {
        setUser(null);
        router.replace("/");
      }
    });
  };

  return (
    <button type="button" onClick={handleLogout} disabled={isPending} className={styles.button}>
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
