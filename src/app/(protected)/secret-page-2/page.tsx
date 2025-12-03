import { createClient } from "@/src/lib/supabase/server";
import { db, secrets } from "@/src/db";
import { eq } from "drizzle-orm";
import { SecretForm } from "@/src/components/secrets/secret-form";
import Link from "next/link";

export default async function SecretPage2() {
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {userSecret ? "Edit Your Secret" : "Create Your Secret"}
        </h2>
        {userSecret && (
          <Link
            href="/secret-page-1"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View secret →
          </Link>
        )}
      </div>

      <SecretForm existingSecret={userSecret ?? null} />
    </section>
  );
}
