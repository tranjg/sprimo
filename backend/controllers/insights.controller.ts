import { and, eq } from "drizzle-orm";
import { projects, project_members } from "../drizzle/schema.ts";
import { getPRCompletionData, getCommitStats } from "./github.controller.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  fetchIssuesForSprint,
  fetchSprintsForBoard,
  getCloudId,
} from "../utils/helpers.ts";
import axios from "axios";

const db = drizzle(process.env.DATABASE_URL as string);

export const getInsightsByProject = async (req, res) => {
  try {
    const userId = req.session.userId;
    const githubToken = req.session.github_accessToken;
    const jiraToken = req.session.jira_accessToken;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const projectList = await db
      .select()
      .from(projects)
      .innerJoin(project_members, eq(project_members.project_id, projects.id))
      .where(eq(project_members.user_id, userId));

    const results = await Promise.all(
      projectList.map(async ({ projects: project }) => {
        const { id, name, jira_project_key, cloud_id, github_repo_fullname } =
          project;

        const [owner, repo] = github_repo_fullname?.split("/") || [];

        // GitHub data
        let githubData = null;
        if (githubToken && owner && repo) {
          const prData = await getPRCompletionData(owner, repo, githubToken);
          const commitData = await getCommitStats(owner, repo, githubToken);
          githubData = {
            pullRequestCompletion: prData,
            commitActivity: commitData,
          };
        }

        // Jira data
        let jiraData = null;
        if (jiraToken && jira_project_key && cloud_id) {
          try {
            const resolvedCloudId = await getCloudId(jiraToken);

            const boardsResponse = await axios.get(
              `https://api.atlassian.com/ex/jira/${resolvedCloudId}/rest/agile/1.0/board`,
              {
                headers: {
                  Authorization: `Bearer ${jiraToken}`,
                },
                params: {
                  projectKeyOrId: jira_project_key,
                },
              }
            );
            const boards = boardsResponse.data.values || [];

            const allSprints = [];
            for (const board of boards) {
              const sprints = await fetchSprintsForBoard(
                resolvedCloudId,
                board.id,
                jiraToken
              );

              for (const sprint of sprints) {
                const issues = await fetchIssuesForSprint(
                  resolvedCloudId,
                  sprint.id,
                  jiraToken
                );

                // Normalize story points
                const normalizedIssues = issues.map((issue) => {
                  const storyPoints =
                    issue.fields.customfield_10016 ??
                    issue.fields.customfield_10046 ??
                    null;

                  return {
                    ...issue,
                    fields: {
                      ...issue.fields,
                      storyPoints,
                    },
                  };
                });

                allSprints.push({
                  boardId: board.id,
                  boardName: board.name,
                  sprintId: sprint.id,
                  sprintName: sprint.name,
                  startDate: sprint.startDate,
                  endDate: sprint.endDate,
                  issues: normalizedIssues,
                });
              }
            }

            jiraData = {
              sprints: allSprints,
            };
          } catch (jiraErr) {
            console.error("Error fetching Jira data:", jiraErr);
          }
        }

        return {
          projectId: id,
          projectName: name,
          github: githubData,
          jira: jiraData,
        };
      })
    );

    res.json({ insights: results });
  } catch (error) {
    console.error("Error in getInsightsByProject:", error);
    res.status(500).json({ message: "Failed to fetch project insights" });
  }
};
