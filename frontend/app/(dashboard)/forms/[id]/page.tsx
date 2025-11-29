import { redirect } from "next/navigation";

export default function FormDetailLegacyPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/forms/${params.id}`);
}
