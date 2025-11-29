import { FormDetailClient } from "@/components/FormDetailClient";

export default function FormDetailPage({ params }: { params: { id: string } }) {
  return <FormDetailClient formId={params.id} />;
}
