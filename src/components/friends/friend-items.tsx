"use client";

import { acceptFriendRequest, declineFriendRequest, removeFriend } from "@/src/lib/actions/friends";
import type { User, Friendship, Secret } from "@/src/db/schema";

interface FriendRequestItemProps {
  friendship: Friendship;
  friend: User;
}

export function FriendRequestItem({ friendship, friend }: FriendRequestItemProps) {
  const acceptAction = acceptFriendRequest.bind(null, friendship.id);
  const declineAction = declineFriendRequest.bind(null, friendship.id);

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
      <div>
        <p className="font-medium">{friend.displayName ?? friend.email}</p>
        {friend.displayName && (
          <p className="text-sm text-gray-500">{friend.email}</p>
        )}
      </div>
      <div className="flex gap-2">
        <form action={acceptAction}>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Accept
          </button>
        </form>
        <form action={declineAction}>
          <button
            type="submit"
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            Decline
          </button>
        </form>
      </div>
    </div>
  );
}

interface PendingSentItemProps {
  friendship: Friendship;
  friend: User;
}

export function PendingSentItem({ friendship, friend }: PendingSentItemProps) {
  const cancelAction = declineFriendRequest.bind(null, friendship.id);

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
      <div>
        <p className="font-medium">{friend.displayName ?? friend.email}</p>
        {friend.displayName && (
          <p className="text-sm text-gray-500">{friend.email}</p>
        )}
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Pending</p>
      </div>
      <form action={cancelAction}>
        <button
          type="submit"
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

interface FriendItemProps {
  friendship: Friendship;
  friend: User;
  secret: Secret | null;
}

export function FriendItem({ friendship, friend, secret }: FriendItemProps) {
  const removeAction = removeFriend.bind(null, friendship.id);

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium">{friend.displayName ?? friend.email}</p>
          {friend.displayName && (
            <p className="text-sm text-gray-500">{friend.email}</p>
          )}
        </div>
        <form action={removeAction}>
          <button
            type="submit"
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
          >
            Remove
          </button>
        </form>
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        {secret ? (
          <div>
            <p className="text-sm text-gray-500 mb-1">Their secret:</p>
            <p className="text-sm italic">&ldquo;{secret.message}&rdquo;</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            This friend hasn&apos;t shared a secret yet.
          </p>
        )}
      </div>
    </div>
  );
}
