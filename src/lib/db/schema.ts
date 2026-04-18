import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  date,
  time,
  smallint,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ===== enums =====

export const roleEnum = pgEnum("user_role", ["teacher", "user"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "confirmed",
  "cancelled",
]);

// ===== better-auth tables =====

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  // App-level extensions
  age: integer("age"),
  role: roleEnum("role").notNull().default("user"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

// ===== app tables =====

export const availabilityRules = pgTable(
  "availability_rules",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    dayOfWeek: smallint("day_of_week").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("availability_rules_day_check", sql`${t.dayOfWeek} between 0 and 6`),
    check("availability_rules_time_order", sql`${t.endTime} > ${t.startTime}`),
    index("availability_rules_day_idx").on(t.dayOfWeek),
  ]
);

export const availabilityBlocks = pgTable(
  "availability_blocks",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    date: date("date").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("availability_blocks_date_unique").on(t.date)]
);

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    // end_at is maintained by the bookings_set_end_at trigger (migration 0001).
    // Treated as read-only from app code; don't set on insert/update.
    endAt: timestamp("end_at", { withTimezone: true }),
    status: bookingStatusEnum("status").notNull().default("confirmed"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: text("cancelled_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "bookings_duration_check",
      sql`${t.durationMinutes} in (30, 45, 60)`
    ),
    index("bookings_user_idx").on(t.userId, t.startAt),
    index("bookings_start_idx").on(t.startAt),
  ]
);
