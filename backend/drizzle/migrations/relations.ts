import { relations } from "drizzle-orm/relations";
import { teams, invitations, projects, users, projectMembers, teamMembers } from "./schema";

export const invitationsRelations = relations(invitations, ({one}) => ({
	team: one(teams, {
		fields: [invitations.teamId],
		references: [teams.id]
	}),
	project: one(projects, {
		fields: [invitations.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [invitations.invitedBy],
		references: [users.id]
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	invitations: many(invitations),
	projects: many(projects),
	user: one(users, {
		fields: [teams.createdBy],
		references: [users.id]
	}),
	teamMembers: many(teamMembers),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	invitations: many(invitations),
	team: one(teams, {
		fields: [projects.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [projects.createdBy],
		references: [users.id]
	}),
	projectMembers: many(projectMembers),
}));

export const usersRelations = relations(users, ({many}) => ({
	invitations: many(invitations),
	projects: many(projects),
	teams: many(teams),
	projectMembers: many(projectMembers),
	teamMembers: many(teamMembers),
}));

export const projectMembersRelations = relations(projectMembers, ({one}) => ({
	user: one(users, {
		fields: [projectMembers.userId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id]
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	}),
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
}));