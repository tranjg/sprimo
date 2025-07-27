import { drizzle } from "drizzle-orm/node-postgres";
import { project_members, projects } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL as string)

export async function getProjectsByUser(userId: string) {
  return await db
    .select({
      projectId: projects.id,
      projectName: projects.name,
      jiraProjectId: projects.jira_project_id,
      jiraProjectKey: projects.jira_project_key,
      jiraProjectName: projects.jira_project_name,
      jiraCloudId: projects.cloud_id,
      githubRepo: projects.github_repo_fullname,
    })
    .from(project_members)
    .innerJoin(projects, eq(project_members.project_id, projects.id))
    .where(eq(project_members.user_id, userId));
}
