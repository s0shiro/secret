import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { Header } from "@/src/components/layout/header";
import { DeleteAccountButton } from "@/src/components/auth/delete-account-button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <main className="w-full max-w-md p-8 text-center space-y-6">
          <h1 className="text-4xl font-bold">Secret Page</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Share secrets with your friends
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="block w-full py-2 px-4 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-md transition-colors"
            >
              Create account
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Show dashboard for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <Header email={user.email ?? ""} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Manage your secrets and connect with friends.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/secret-page-1"
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">View Secret</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  See your current secret message
                </p>
              </Link>

              <Link
                href="/secret-page-2"
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">Edit Secret</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create or update your secret
                </p>
              </Link>

              <Link
                href="/secret-page-3"
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">Friends</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage friends and view their secrets
                </p>
              </Link>
            </div>
          </section>

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
