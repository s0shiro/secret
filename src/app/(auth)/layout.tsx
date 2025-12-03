import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already logged in, redirect to secret page
  if (user) {
    redirect("/secret-page-1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  );
}
