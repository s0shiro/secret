import { createClient } from "@/src/lib/supabase/server";
import { db, friendships, users, secrets } from "@/src/db";
import { eq, or, and } from "drizzle-orm";
import { AddFriendForm } from "@/src/components/friends/add-friend-form";
import {
  FriendRequestItem,
  PendingSentItem,
  FriendItem,
} from "@/src/components/friends/friend-items";
import type { User, Friendship, Secret } from "@/src/db/schema";

async function getFriendshipsWithUsers(userId: string) {
  // Get all friendships involving this user
  const allFriendships = await db
    .select({
      friendship: friendships,
      user: users,
    })
    .from(friendships)
    .innerJoin(users, or(
      and(
        eq(friendships.userId, userId),
        eq(users.id, friendships.friendId)
      ),
      and(
        eq(friendships.friendId, userId),
        eq(users.id, friendships.userId)
      )
    ))
    .where(or(
      eq(friendships.userId, userId),
      eq(friendships.friendId, userId)
    ));

  return allFriendships;
}

export default async function SecretPage3() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const friendshipsData = await getFriendshipsWithUsers(user.id);

  // Categorize friendships
  const pendingReceived: { friendship: Friendship; friend: User }[] = [];
  const pendingSent: { friendship: Friendship; friend: User }[] = [];
  const acceptedFriends: { friendship: Friendship; friend: User }[] = [];

  for (const item of friendshipsData) {
    const friendData = {
      friendship: item.friendship,
      friend: item.user,
    };

    if (item.friendship.status === "pending") {
      if (item.friendship.friendId === user.id) {
        // User received this request
        pendingReceived.push(friendData);
      } else {
        // User sent this request
        pendingSent.push(friendData);
      }
    } else if (item.friendship.status === "accepted") {
      acceptedFriends.push(friendData);
    }
  }

  // Get secrets for accepted friends
  const friendIds = acceptedFriends.map((f) => f.friend.id);
  const friendSecrets: Secret[] = friendIds.length > 0
    ? await db.query.secrets.findMany({
        where: or(...friendIds.map((id) => eq(secrets.userId, id))),
      })
    : [];

  const secretsMap = new Map(friendSecrets.map((s) => [s.userId, s]));

  return (
    <>
      {/* Add Friend Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Friends</h2>
        <AddFriendForm />
      </section>

      {/* Pending Received Requests */}
      {pendingReceived.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Friend Requests ({pendingReceived.length})
          </h3>
          <div className="space-y-3">
            {pendingReceived.map(({ friendship, friend }) => (
              <FriendRequestItem
                key={friendship.id}
                friendship={friendship}
                friend={friend}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pending Sent Requests */}
      {pendingSent.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Sent Requests ({pendingSent.length})
          </h3>
          <div className="space-y-3">
            {pendingSent.map(({ friendship, friend }) => (
              <PendingSentItem
                key={friendship.id}
                friendship={friendship}
                friend={friend}
              />
            ))}
          </div>
        </section>
      )}

      {/* Accepted Friends */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Your Friends ({acceptedFriends.length})
        </h3>
        {acceptedFriends.length > 0 ? (
          <div className="space-y-3">
            {acceptedFriends.map(({ friendship, friend }) => (
              <FriendItem
                key={friendship.id}
                friendship={friendship}
                friend={friend}
                secret={secretsMap.get(friend.id) ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You don&apos;t have any friends yet. Add someone by their email!
            </p>
          </div>
        )}
      </section>
    </>
  );
}
