"use client";

import { useActionState } from "react";
import { saveSecret } from "@/src/lib/actions/secrets";
import type { Secret } from "@/src/db/schema";

interface SecretFormProps {
  existingSecret: Secret | null;
}

type FormState = { error: string } | { success: true } | null | undefined;

export function SecretForm({ existingSecret }: SecretFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState, formData: FormData) => {
      return await saveSecret(formData);
    },
    null
  );

  const isSuccess = state && "success" in state;
  const isError = state && "error" in state;

  return (
    <form action={formAction} className="space-y-4">
      {isError && (
        <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {isSuccess && (
        <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
          Secret saved successfully!
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium">
          Your Secret Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          defaultValue={existingSecret?.message ?? ""}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Write your secret here..."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
      >
        {pending
          ? "Saving..."
          : existingSecret
            ? "Update Secret"
            : "Create Secret"}
      </button>
    </form>
  );
}
