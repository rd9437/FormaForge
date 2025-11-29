import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { ReactNode } from "react";
import styles from "./dashboard-layout.module.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}>
          FormaForge
        </Link>
        <nav className={styles.nav}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/forms">Forms</Link>
          <LogoutButton />
        </nav>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
