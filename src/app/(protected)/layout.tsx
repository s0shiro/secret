import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { Header } from "@/src/components/layout/header";
import { DeleteAccountButton } from "@/src/components/auth/delete-account-button";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={user.email ?? ""} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {children}

          {/* Account Section */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Account
            </h2>
            <DeleteAccountButton />
          </section>
        </div>
      </main>
    </div>
  );
}
