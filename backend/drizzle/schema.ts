import { date, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const teams = pgTable('teams', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', {length: 50}).notNull(),
    jira_board_id: varchar('jira_board_id'),
    github_repo_url: varchar('github_repo_url'),
})