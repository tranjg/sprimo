import { relations } from "drizzle-orm";
import { date, pgTable, uuid, varchar, integer, text, primaryKey, unique, timestamp, json } from "drizzle-orm/pg-core";


export const session = pgTable("session", {
    sid: text("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  });

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    first_name: varchar('first_name', {length: 35}).notNull(),
    last_name: varchar('last_name', {length: 35}).notNull(),
    email: varchar('email', {length: 255}).notNull(),
    username: varchar('username', {length: 50}).notNull(),
    password: varchar('password', {length: 64}).notNull(),
    created_at: timestamp('created_at').defaultNow()
})

export const usersRelations = relations(users, ({many}) =>({
    teams: many(teams),
    projects: many(projects)
}));

export const teams = pgTable('teams', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', {length: 50}).notNull(),
    description: varchar('description', {length: 250}),
    created_by: uuid('created_by').references(() => users.id).notNull(),
    created_at: timestamp('created_at').defaultNow()
})

export const teamsRelations = relations(teams, ({many}) =>({
    team_members: many(team_members)
}))

export const team_members = pgTable('team_members', {
    user_id: uuid('user_id').references(() => users.id, {onDelete:'cascade'}).notNull(),
    team_id: uuid('team_id').references(() => teams.id, {onDelete:'cascade'}).notNull(),
    role: text('role').default('member'),
    joined_at: timestamp('joined_at').defaultNow()
}, (table) => [
    primaryKey({ columns: [table.team_id, table.user_id]})
]
)

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    team_id: uuid('team_id').references(() => teams.id, {onDelete:'cascade'}).notNull(),
    name: varchar('name', {length: 50}).notNull(),
    status: text('status').default('active'),
    jira_project_id: text('jira_project_id'),
    jira_project_key: text('jira_project_key'),
    jira_project_name: text('jira_project_name'),
    jira_project_type: text('jira_project_type'),
    cloud_id: text('cloud_id'),
    connected_by: text('connected_by'),
    github_repo_url: text('github_repo_url'),
    created_by: uuid('created_by').references(() => users.id),
    created_at: timestamp('created_at').defaultNow()
})

export const projectsRelations = relations(teams, ({many}) => ({
    project_members: many(project_members)
}))

export const project_members = pgTable('project_members', {
    user_id: uuid('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    project_id: uuid('project_id').references(() => projects.id, {onDelete:'cascade'}).notNull(),
    joined_at: timestamp('joined_at').defaultNow()
}, (table) => [
    unique().on(table.user_id, table.project_id)
])

export const invitations = pgTable('invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', {length: 255}).notNull(),
    team_id: uuid('team_id').references(() => teams.id, {onDelete: 'cascade'}),
    project_id: uuid('project_id').references(() => projects.id),
    invited_by: uuid('invited_by').references(() => users.id),
    status: text('status').default('pending'),
    token: text().unique().notNull(),
    created_at: timestamp('created_at').defaultNow()
})