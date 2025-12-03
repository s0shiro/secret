"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { db, users, type NewUser } from "@/src/db";
import { eq } from "drizzle-orm";

// Validation schemas
const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1).optional(),
});

type AuthResult = { error: string } | undefined;

function parseFormData<T extends z.ZodSchema>(
  schema: T,
  formData: FormData
): { data: z.infer<T> } | { error: string } {
  const rawData = Object.fromEntries(formData.entries());
  const result = schema.safeParse(rawData);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError?.message ?? "Invalid form data" };
  }

  return { data: result.data };
}

export async function login(formData: FormData): Promise<AuthResult> {
  const parsed = parseFormData(loginSchema, formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { email, password } = parsed.data;

  // Check if user exists in our database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!existingUser) {
    return { error: "No account found with this email address" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function register(formData: FormData): Promise<AuthResult> {
  const parsed = parseFormData(registerSchema, formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { email, password, displayName } = parsed.data;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create user profile in our database
  if (authData.user) {
    try {
      const newUser: NewUser = {
        id: authData.user.id,
        email,
        displayName: displayName ?? null,
      };
      await db.insert(users).values(newUser);
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }

  revalidatePath("/", "layout");
  redirect("/secret-page-1");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function deleteAccount(): Promise<AuthResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Delete user from our database (cascades to secrets and friendships)
    await db.delete(users).where(eq(users.id, user.id));
    
    // Delete user from Supabase Auth using admin client
    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
    }
    
    // Sign out the user
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error deleting account:", error);
    return { error: "Failed to delete account" };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
