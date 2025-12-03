import { createClient } from "@/src/lib/supabase/server";
import { db, secrets } from "@/src/db";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function SecretPage1() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const userSecret = await db.query.secrets.findFirst({
    where: eq(secrets.userId, user.id),
  });

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Your Secret</h2>

      {userSecret ? (
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative">
          <Link
            href="/secret-page-2"
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Edit secret"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Link>
          <p className="text-lg whitespace-pre-wrap">{userSecret.message}</p>
          <p className="text-sm text-gray-500 mt-4">
            Created: {userSecret.createdAt?.toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven&apos;t created a secret yet.
          </p>
          <Link
            href="/secret-page-2"
            className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Create your secret
          </Link>
        </div>
      )}
    </section>
  );
}
