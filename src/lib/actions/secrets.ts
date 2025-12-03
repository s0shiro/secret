"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import { db, secrets } from "@/src/db";
import { eq } from "drizzle-orm";

const secretSchema = z.object({
  message: z.string().min(1, "Secret message is required"),
});

type SecretResult = { error: string } | { success: true } | undefined;

export async function saveSecret(formData: FormData): Promise<SecretResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = secretSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message ?? "Invalid form data" };
  }

  const { message } = parsed.data;

  try {
    const existingSecret = await db.query.secrets.findFirst({
      where: eq(secrets.userId, user.id),
    });

    if (existingSecret) {
      await db
        .update(secrets)
        .set({
          message: message.trim(),
          updatedAt: new Date(),
        })
        .where(eq(secrets.id, existingSecret.id));
    } else {
      await db.insert(secrets).values({
        userId: user.id,
        message: message.trim(),
      });
    }

    revalidatePath("/secret-page-1");
    revalidatePath("/secret-page-2");
    return { success: true };
  } catch (error) {
    console.error("Error saving secret:", error);
    return { error: "Failed to save secret" };
  }
}
