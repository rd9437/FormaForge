import { API_BASE_URL } from "@/lib/config";
import type { FormSchema, UserProfile, GenerateFormResponse, FormSubmission } from "@/types";

const API_TIMEOUT = 20000;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const url = `${API_BASE_URL.replace(/\/?$/, "")}/${path}`;
    const headers = new Headers(init.headers);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      credentials: "include",
      ...init,
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export interface AuthResponse {
  user: UserProfile;
}

export const authApi = {
  register: (payload: { email: string; password: string; name?: string }) =>
    request<AuthResponse>("auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  logout: () =>
    request<{ success: boolean }>("auth/logout", {
      method: "POST"
    }),
  profile: () => request<AuthResponse>("auth/profile")
};

export const formApi = {
  generate: (payload: { prompt: string; attachments?: string[] }) =>
    request<GenerateFormResponse>("forms/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  list: () => request<FormSchema[]>("forms"),
  byId: (formId: string) => request<FormSchema>(`forms/${formId}`),
  publish: (formId: string, payload: Partial<FormSchema>) =>
    request<FormSchema>(`forms/${formId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  remove: (formId: string) =>
    request<{ success: boolean }>(`forms/${formId}`, {
      method: "DELETE"
    })
};

export const submissionApi = {
  listForForm: (formId: string) => request<FormSubmission[]>(`forms/${formId}/submissions`),
  submitPublic: (sharingSlug: string, payload: { values: FormSubmission["values"]; media?: string[] }) =>
    request<FormSubmission>(`public/forms/${sharingSlug}/submit`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const memoryApi = {
  history: () => request("memories")
};

export const publicApi = {
  formBySlug: (slug: string) => request<FormSchema>(`public/forms/${slug}`)
};

export const mediaApi = {
  requestSignature: (payload: { folder?: string; resourceType?: string }) =>
    request<{
      timestamp: number;
      signature: string;
      apiKey: string;
      cloudName: string;
      folder?: string;
    }>("media/signature", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
