import { PublicFormClient } from "@/components/PublicFormClient";

export default function PublicFormPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-100 p-6">
      <PublicFormClient slug={params.id} />
    </main>
  );
}
