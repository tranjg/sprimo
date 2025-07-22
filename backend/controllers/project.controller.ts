import { drizzle } from "drizzle-orm/node-postgres";
import { projects } from "../drizzle/schema.ts";
import axios from "axios";

const db = drizzle(process.env.DATABASE_URL as string);

export const addProject = async (req, res) => {
  try {
    const userId = req.session.userId;
    const cloudResp = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${req.session.jira_accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const cloudId = cloudResp.data[0]?.id;
    if (!cloudId) {
      return res.status(400).json({ message: "No Jira cloud found" });
    }
    const { name, description, jira_project, git_repo, team_id } = req.body;
    const parsedJiraProject = JSON.parse(jira_project);
    const parsedGitRepo = JSON.parse(git_repo);
    const newProject = await db.insert(projects).values({
      team_id: team_id,
      name: name,
      description: description,
      jira_project_id: parsedJiraProject.id,
      jira_project_key: parsedJiraProject.key,
      jira_project_name: parsedJiraProject.name,
      jira_project_type: parsedJiraProject.style,
      cloud_id: cloudId,
      github_repo_id: parsedGitRepo.id,
      github_repo_fullname: parsedGitRepo.full_name,
      github_default_branch: parsedGitRepo.default_branch,
      github_repo_url: parsedGitRepo.svn_url,
      created_by: userId,
    });
    return res
      .status(201)
      .json({ message: "Successfully added a new project", success: true });
  } catch (error) {
    console.error(error);
    console.error("Error adding a new project");

    return res
      .status(500)
      .json({ message: "There was an error adding a project", success: false });
  }
};
