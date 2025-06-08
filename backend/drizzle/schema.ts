import { date, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: varchar('id',{length:20}).notNull().primaryKey(),
    username:varchar('username',{length:50}).notNull(),
    password:varchar('password',{length:256}).notNull(),
    createdAt:date('created_at').defaultNow()
});
