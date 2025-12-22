import { pgTable, uuid, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  string: varchar("string", { length: 256 }),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  password: text("password"),
  image: varchar("image", { length: 256 }),
  role: varchar("role", { length: 50 }).default("viewer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
});

export const competitions = pgTable("competitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    solveScript: text("solve_script"),
    categoryId: uuid("category_id").notNull(),
    competitionId: uuid("competition_id"),
    authorId: uuid("author_id").notNull(),
    isDraft: boolean("is_draft").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    authorCreatedIdx: index("posts_author_id_created_at_idx").on(table.authorId, table.createdAt),
    draftCreatedIdx: index("posts_is_draft_created_at_idx").on(table.isDraft, table.createdAt),
    categoryDraftCreatedIdx: index("posts_category_id_is_draft_created_at_idx").on(
      table.categoryId,
      table.isDraft,
      table.createdAt,
    ),
    competitionDraftCreatedIdx: index("posts_competition_id_is_draft_created_at_idx").on(
      table.competitionId,
      table.isDraft,
      table.createdAt,
    ),
  }),
);

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: timestamp("expires_at"),
  tokenType: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: uuid("user_id").notNull(),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    primaryKey: [table.identifier, table.token],
  })
);

export const likes = pgTable(
  "likes",
  {
    userId: uuid("user_id").notNull(),
    postId: uuid("post_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    primaryKey: [table.userId, table.postId],
    postIdx: index("likes_post_id_idx").on(table.postId),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id").notNull(),
    userId: uuid("user_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
  },
  (table) => ({
    postCreatedIdx: index("comments_post_id_created_at_idx").on(table.postId, table.createdAt),
  }),
);

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
});

export const post_tags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id").notNull(),
    tagId: uuid("tag_id").notNull(),
  },
  (table) => ({
    primaryKey: [table.postId, table.tagId],
    tagIdx: index("post_tags_tag_id_idx").on(table.tagId),
  }),
);

export const competition_participants = pgTable(
  "competition_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    competitionCreatedIdx: index("competition_participants_competition_id_created_at_idx").on(
      table.competitionId,
      table.createdAt,
    ),
  }),
);

export const schema = {
  users,
  categories,
  competitions,
  posts,
  accounts,
  sessions,
  verificationTokens,
  likes,
  comments,
  tags,
  post_tags,
  competition_participants,
};
