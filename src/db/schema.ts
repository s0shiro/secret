import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Secrets table - one secret per user
export const secrets = pgTable("secrets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Friendship status enum
export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
]);

// Friendships table - bidirectional friend relationships
export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  friendId: uuid("friend_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: friendshipStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for use in application

// User types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserUpdate = Partial<Omit<NewUser, "id" | "createdAt">>;

// Secret types
export type Secret = typeof secrets.$inferSelect;
export type NewSecret = typeof secrets.$inferInsert;
export type SecretUpdate = Partial<Pick<NewSecret, "message">>;

// Friendship types
export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;
export type FriendshipStatus = (typeof friendshipStatusEnum.enumValues)[number];

// Composite types for queries with joins
export type UserWithSecret = User & { secret: Secret | null };
export type FriendshipWithUser = {
  friendship: Friendship;
  friend: User;
};
export type FriendshipWithUserAndSecret = FriendshipWithUser & {
  secret: Secret | null;
};
