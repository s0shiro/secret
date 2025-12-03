"use client";

import { useActionState } from "react";
import { sendFriendRequest } from "@/src/lib/actions/friends";

type FormState = { error: string } | { success: true } | null | undefined;

export function AddFriendForm() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState, formData: FormData) => {
      return await sendFriendRequest(formData);
    },
    null
  );

  const isSuccess = state && "success" in state;
  const isError = state && "error" in state;

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">Add a Friend</h3>

      <form action={formAction} className="space-y-4">
        {isError && (
          <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {state.error}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
            Friend request sent!
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            placeholder="Enter friend's email"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            {pending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
