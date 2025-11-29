'use client';

import { useEffect, useState } from "react";
import { publicApi, submissionApi } from "@/lib/api-client";
import { uploadImageViaCloudinary } from "@/lib/cloudinary";
import type { FormRendererSubmission } from "@/components/FormRenderer";
import { FormRenderer } from "@/components/FormRenderer";
import type { FormSchema } from "@/types";

interface PublicFormClientProps {
  slug: string;
}

export function PublicFormClient({ slug }: PublicFormClientProps) {
  const [form, setForm] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const record = await publicApi.formBySlug(slug);
        setForm(record);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Form unavailable or archive removed.");
      } finally {
        setLoading(false);
      }
    };

    load().catch(console.error);
  }, [slug]);

  const handleSubmit = async (payload: FormRendererSubmission) => {
    if (!form) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const uploadedMedia: string[] = [];

      for (const fileEntry of payload.files) {
        for (const file of fileEntry.files) {
          const url = await uploadImageViaCloudinary(file);
          uploadedMedia.push(url);
        }
      }

      await submissionApi.submitPublic(form.sharingSlug, {
        values: payload.values,
        media: uploadedMedia.length > 0 ? uploadedMedia : undefined
      });

      setSuccess("Thank you! Your response has been recorded.");
    } catch (submitError) {
      console.error(submitError);
      setError("Submission failed. Please retry.");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading form…</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-500">{error}</p>;
  }

  if (!form) {
    return <p className="text-sm text-slate-600">Form not found.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{form.title}</h1>
        {form.description ? <p className="mt-2 text-sm text-slate-600">{form.description}</p> : null}
      </div>

      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}

      <FormRenderer schema={form} onSubmit={handleSubmit} submitLabel="Submit response" />
    </div>
  );
}
