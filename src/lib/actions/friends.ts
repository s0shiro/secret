"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import { db, users, friendships, secrets } from "@/src/db";
import { eq, and, or } from "drizzle-orm";

const addFriendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type FriendResult = { error: string } | { success: true } | undefined;

export async function sendFriendRequest(formData: FormData): Promise<FriendResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = addFriendSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message ?? "Invalid form data" };
  }

  const { email } = parsed.data;

  if (email.toLowerCase() === user.email?.toLowerCase()) {
    return { error: "You cannot add yourself as a friend" };
  }

  try {
    // Find the user by email
    const friendUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!friendUser) {
      return { error: "User not found" };
    }

    // Check if friendship already exists
    const existingFriendship = await db.query.friendships.findFirst({
      where: or(
        and(
          eq(friendships.userId, user.id),
          eq(friendships.friendId, friendUser.id)
        ),
        and(
          eq(friendships.userId, friendUser.id),
          eq(friendships.friendId, user.id)
        )
      ),
    });

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        return { error: "You are already friends" };
      }
      return { error: "Friend request already pending" };
    }

    // Create friend request
    await db.insert(friendships).values({
      userId: user.id,
      friendId: friendUser.id,
      status: "pending",
    });

    revalidatePath("/secret-page-3");
    return { success: true };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { error: "Failed to send friend request" };
  }
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  try {
    // Verify the friendship exists and user is the recipient
    const friendship = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.id, friendshipId),
        eq(friendships.friendId, user.id),
        eq(friendships.status, "pending")
      ),
    });

    if (!friendship) {
      return;
    }

    await db
      .update(friendships)
      .set({
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(friendships.id, friendshipId));

    revalidatePath("/secret-page-3");
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
}

export async function declineFriendRequest(friendshipId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  try {
    // Verify the friendship exists and user is part of it
    const friendship = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.id, friendshipId),
        or(
          eq(friendships.userId, user.id),
          eq(friendships.friendId, user.id)
        )
      ),
    });

    if (!friendship) {
      return;
    }

    await db.delete(friendships).where(eq(friendships.id, friendshipId));

    revalidatePath("/secret-page-3");
  } catch (error) {
    console.error("Error declining friend request:", error);
  }
}

export async function removeFriend(friendshipId: string): Promise<void> {
  return declineFriendRequest(friendshipId); // Same logic
}

// Get friend's secret - returns 401 if not friends
export async function getFriendSecret(friendId: string): Promise<{ error: string; status?: number } | { secret: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", status: 401 };
  }

  try {
    // Check if they are friends (accepted status)
    const friendship = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.status, "accepted"),
        or(
          and(
            eq(friendships.userId, user.id),
            eq(friendships.friendId, friendId)
          ),
          and(
            eq(friendships.userId, friendId),
            eq(friendships.friendId, user.id)
          )
        )
      ),
    });

    if (!friendship) {
      return { error: "Unauthorized - You must be friends to view this secret", status: 401 };
    }

    // Get the friend's secret
    const friendSecret = await db.query.secrets.findFirst({
      where: eq(secrets.userId, friendId),
    });

    if (!friendSecret) {
      return { error: "This user hasn't shared a secret yet" };
    }

    return { secret: friendSecret.message };
  } catch (error) {
    console.error("Error getting friend secret:", error);
    return { error: "Failed to get secret" };
  }
}
