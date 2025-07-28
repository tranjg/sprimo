import axios from "axios";
import { eq } from "drizzle-orm";
import { getCommitStats, getPRCompletionData } from "./github.controller.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { projects, project_members } from "../drizzle/schema.ts";
import { parseSprintField } from "./jira.controller.ts";

const db = drizzle(process.env.DATABASE_URL as string);

interface JiraMetrics {
  goalCompletion: { done: number; total: number };
  velocityData: Record<string, number>;
  burndownData: Record<string, number>;
  workItemFlow: {
    key: string;
    statusChanges: { from: string; to: string; at: string }[];
  }[];
}

interface GitHubMetrics {
  prData: any;
  commitStats: any;
}

interface ProjectMetrics {
  projectName: string;
  jira?: JiraMetrics;
  github?: GitHubMetrics;
}

export const getHomeDashboardMetrics = async (req, res) => {
  const jiraToken = req.session.jira_accessToken;
  const githubToken = req.session.github_accessToken;
  const userId = req.session.userId;

  if (!jiraToken || !userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const cloudResp = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      { headers: { Authorization: `Bearer ${jiraToken}` } }
    );

    const cloudId = cloudResp.data[0]?.id;
    if (!cloudId)
      return res.status(400).json({ message: "No Jira cloud found" });

    // Fetch projects user is part of
    const userProjects = await db
      .select({
        projectId: projects.id,
        name: projects.name,
        jiraProjectKey: projects.jira_project_key,
        githubRepo: projects.github_repo_fullname,
      })
      .from(project_members)
      .innerJoin(projects, eq(project_members.project_id, projects.id))
      .where(eq(project_members.user_id, userId));

    const result: ProjectMetrics[] = [];

    for (const project of userProjects) {
      const { jiraProjectKey, githubRepo, name } = project;
      const projectMetrics: ProjectMetrics = {
        projectName: name,
      };

      // === JIRA ===
      if (jiraProjectKey && jiraToken && cloudId) {
        const searchResp = await axios.get(
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
          {
            headers: {
              Authorization: `Bearer ${jiraToken}`,
              "Content-Type": "application/json",
            },
            params: {
              jql: `project = ${jiraProjectKey}`,
              maxResults: 100,
              expand: "changelog",
              fields: [
                "summary",
                "status",
                "created",
                "updated",
                "resolutiondate",
                "customfield_10020", // Sprint
                "customfield_10016", // Story points
              ],
            },
          }
        );

        const issues = searchResp.data.issues;

        const velocityData: Record<string, number> = {};
        const burndownData: Record<string, number> = {};
        const goalCompletion = { done: 0, total: issues.length };
        const workItemFlow: any[] = [];

        for (const issue of issues) {
          const fields = issue.fields;
          const changelog = issue.changelog?.histories || [];
          const storyPoints = fields.customfield_10016 || 0;

          if (fields.status?.statusCategory?.key === "done") {
            goalCompletion.done++;
          }

          const sprintRaw = fields.customfield_10020?.[0];
          const sprint = sprintRaw ? parseSprintField(sprintRaw) : {};
          const sprintName = sprint.name || "Unknown Sprint";

          if (!velocityData[sprintName]) velocityData[sprintName] = 0;
          velocityData[sprintName] += storyPoints;

          if (fields.resolutiondate) {
            const date = fields.resolutiondate.slice(0, 10);
            burndownData[date] = (burndownData[date] || 0) + storyPoints;
          }

          const statusChanges = changelog
            .flatMap((h) => h.items)
            .filter((i) => i.field === "status")
            .map((i) => ({
              from: i.fromString,
              to: i.toString,
              at: new Date(fields.updated).toISOString(),
            }));

          workItemFlow.push({ key: issue.key, statusChanges });
        }

        projectMetrics.jira = {
          goalCompletion,
          velocityData,
          burndownData,
          workItemFlow,
        };
      }

      // === GITHUB ===
      if (githubRepo && githubToken) {
        const [owner, repo] = githubRepo.split("/");
        const prData = await getPRCompletionData(owner, repo, githubToken);
        const commitStats = await getCommitStats(owner, repo, githubToken);
        projectMetrics.github = {
          prData,
          commitStats,
        };
      }

      result.push(projectMetrics);
    }

    res.status(200).json({ data: result });
  } catch (err: any) {
    console.error("Dashboard error:", err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to load dashboard metrics" });
  }
};
