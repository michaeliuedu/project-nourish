import {
  boolean,
  date,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  preferences: text("preferences").array().notNull().default([]),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  diet_tags: text("diet_tags").array().notNull().default([]),
  cook_time: integer("cook_time").notNull(),
  servings: integer("servings").notNull(),
  image_url: text("image_url"),
  ingredients: jsonb("ingredients").notNull(),
  steps: jsonb("steps").notNull(),
  tips: text("tips"),
  save_count: integer("save_count").notNull().default(0),
  made_count: integer("made_count").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const diaryDays = pgTable("diary_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  overall_feel: varchar("overall_feel", { length: 500 }).notNull(),
  notes: text("notes"),
  is_public: boolean("is_public").notNull().default(false),
});

export const mealEntries = pgTable("meal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  diary_day_id: uuid("diary_day_id")
    .notNull()
    .references(() => diaryDays.id),
  recipe_id: uuid("recipe_id").references(() => recipes.id),
  meal_name: varchar("meal_name", { length: 100 }).notNull(),
  logged_at: timestamp("logged_at").notNull().defaultNow(),
  notes: text("notes"),
  feel: varchar("feel", { length: 500 }).notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  recipe_id: uuid("recipe_id").references(() => recipes.id),
  diary_day_id: uuid("diary_day_id").references(() => diaryDays.id),
  body: text("body").notNull(),
  like_count: integer("like_count").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    post_id: uuid("post_id")
      .notNull()
      .references(() => posts.id),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    parent_id: uuid("parent_id"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    parentCommentFk: foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
    }),
  })
);

export const saves = pgTable(
  "saves",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
    recipe_id: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userRecipeUnique: uniqueIndex("saves_user_recipe_unique").on(
      table.user_id,
      table.recipe_id
    ),
  })
);

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
    post_id: uuid("post_id")
      .notNull()
      .references(() => posts.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userPostUnique: uniqueIndex("likes_user_post_unique").on(
      table.user_id,
      table.post_id
    ),
  })
);

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    follower_id: integer("follower_id")
      .notNull()
      .references(() => users.id),
    following_id: integer("following_id")
      .notNull()
      .references(() => users.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    followerFollowingUnique: uniqueIndex(
      "follows_follower_following_unique"
    ).on(table.follower_id, table.following_id),
  })
);

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  author_id: integer("author_id").references(() => users.id),
  meal: varchar("meal", { length: 15 }).notNull(),
  description: text("description").notNull(),
  recipe_id: uuid("recipe_id").references(() => recipes.id),
});
