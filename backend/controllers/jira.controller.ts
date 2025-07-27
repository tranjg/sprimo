import axios from "axios";
import { getCloudId, getHeaders } from "../utils/helpers.ts";

const redirectUri = "http://localhost:3000/api/jira/callback"; // Must match Atlassian dev console
const clientId = process.env.ATLASSIAN_DEV_CLIENT_ID;
const clientSecret = process.env.ATLASSIAN_DEV_SECRET;

export const authorize = async (req, res) => {
  try {
    const scopes = [
      "read:jira-user",
      "read:jira-work",
      "read:issue:jira",
      "read:project:jira",
      "read:workflow:jira",
      "read:jira-board",
      "read:jira-software",
      "offline_access",
      "read:board-scope:jira-software",
      "read:sprint:jira-software",
    ].join(" ");

    const stateData = {
      state: crypto.randomUUID(),
      returnTo: req.query.returnTo || "/dashboard",
    };
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString(
      "base64"
    );

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${encodedState}&response_type=code&prompt=consent`;

    res.redirect(authUrl);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "There was an error authorizing", success: false });
  }
};

export const callback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  try {
    const stateData = JSON.parse(Buffer.from(state, "base64").toString("utf8"));
    const returnTo = stateData.returnTo || "/";

    const tokenResponse = await axios.post(
      "https://auth.atlassian.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    req.session.jira_accessToken = access_token; // TO-DO: save to db
    req.session.jira_refreshToken = refresh_token; // TO-DO: save to db
    res.redirect(returnTo);
  } catch (error) {
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
    res.status(500).send("Error exchanging code for token");
  }
};

export const getProjects = async (req, res) => {
  const token = req.session.jira_accessToken;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const cloudResp = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const cloudId = cloudResp.data[0]?.id;
    if (!cloudId) {
      return res.status(400).json({ message: "No Jira cloud found" });
    }

    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.values) {
      res.json(response.data.values);
    }
  } catch (err) {
    console.error(
      "Error fetching Jira projects:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

export const getBoards = async (req, res) => {
  const token = req.session.jira_accessToken;
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const cloudResp = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const cloudId = cloudResp.data[0]?.id;
    if (!cloudId)
      return res.status(400).json({ message: "No Jira cloud found" });

    const projectsResp = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.json(projectsResp.data.values);
  } catch (err) {
    console.error(
      "Error fetching Jira projects:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

export async function getJiraBoardsByProject(
  jiraProjectId: string,
  cloudId: string,
  accessToken: string
) {
  const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board?projectKeyOrId=${jiraProjectId}`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  return res.data.values;
}

export const getSprintsForBoard = async (req, res) => {
  const { boardId } = req.query;
  const token = req.session.jira_accessToken;

  try {
    const cloudId = await getCloudId(token);

    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/sprint`,
      { headers: getHeaders(token) }
    );
    return res.json(response.data);
  } catch (err) {
    console.error("Error fetching sprints:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch sprints" });
  }
};

export const getIssuesForSprint = async (req, res) => {
  const { sprintId } = req.query;
  const token = req.session.jira_accessToken;

  if (!sprintId) {
    return res.status(400).json({ message: "Sprint ID is required" });
  }

  try {
    const cloudId = await getCloudId(token);

    const jql = `sprint = ${sprintId}`;
    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
      {
        headers: getHeaders(token),
        params: {
          jql,
          maxResults: 100, // optional: adjust as needed
          fields: [
            "summary",
            "status",
            "assignee",
            "issuetype",
            "created",
            "updated",
            "customfield_10020", // likely the sprint field, safe to include
          ],
        },
      }
    );

    res.json(response.data.issues);
  } catch (err) {
    console.error(
      "Error fetching sprint issues:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch sprint issues" });
  }
};

export const getCompletionRate = async (req, res) => {
  const { sprintId } = req.query;
  const token = req.session.jira_accessToken;

  try {
    const cloudId = await getCloudId(token);

    const { data } = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/sprint/${sprintId}/issue`,
      { headers: getHeaders(token) }
    );

    const total = data.issues.length;
    const completed = data.issues.filter(
      (issue) => issue.fields.status.statusCategory.name === "Done"
    ).length;

    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    res.json({ total, completed, rate });
  } catch (err) {
    console.error(
      "Error calculating completion rate:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to calculate rate" });
  }
};

export const parseSprintField = (sprintRaw: any) => {
  if (typeof sprintRaw === "string") {
    const sprint: Record<string, string> = {};
    sprintRaw.split(",").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        sprint[key.trim()] = value.trim();
      }
    });
    return sprint;
  } else if (typeof sprintRaw === "object" && sprintRaw !== null) {
    // Already a parsed sprint object
    return sprintRaw;
  } else {
    return {};
  }
};

export const getJiraMetrics = async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const cloudResp = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const cloudId = cloudResp.data[0]?.id;
    if (!cloudId)
      return res.status(400).json({ message: "No Jira cloud found" });

    const searchResp = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          maxResults: 100,
          expand: "changelog",
          fields: [
            "summary",
            "status",
            "created",
            "updated",
            "resolutiondate",
            "customfield_10020", // Sprint
            "customfield_10016", // Story points (adjust to match your Jira setup)
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

      if (fields.status?.statusCategory?.key === "done") goalCompletion.done++;

      const sprintRaw = fields.customfield_10020?.[0]; // assume latest sprint only
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
          at: new Date(issue.fields.updated).toISOString(), // rough estimate
        }));
      workItemFlow.push({ key: issue.key, statusChanges });
    }

    res.json({
      goalCompletion,
      velocityData,
      burndownData,
      workItemFlow,
    });
  } catch (error) {
    console.error("Jira Metrics Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch Jira metrics" });
  }
};

// export const getIssuesForProject = async (req, res) => {
//   console.log("in get issues");
//   const token = req.session.jira_accessToken;
//   const { projectId } = req.query;
//   if (!token) return res.status(401).json({ message: "Not authorized" });
//   if (!projectId) return res.status(400).json({ message: "Missing sprintId" });

//   try {
//     const cloudId = await getCloudId(token);

//     const jql = `project = ${projectId}`;

//     const searchResp = await axios.post(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
//       {
//         jql,
//         fields: ["summary", "status", "assignee"],
//         maxResults: 100,
//       },
//       { headers: getHeaders(token) }
//     );
//     res.json(searchResp.data.issues);
//   } catch (error) {
//     console.error(
//       "Error fetching sprint issues:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({ message: "Failed to fetch sprint issues" });
//   }
// };

// export const getCompletionRate = async (req, res) => {
//   const token = req.session.jira_accessToken;
//   const { projectKey } = req.query;

//   if (!token) return res.status(401).json({ message: "Not authorized" });
//   if (!projectKey)
//     return res.status(400).json({ message: "Missing projectKey" });

//   try {
//     const cloudId = await getCloudId(token);

//     const jql = `project = ${projectKey}`;

//     const searchResp = await axios.post(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
//       {
//         jql,
//         fields: ["summary", "status", "assignee"],
//         maxResults: 100,
//       },
//       { headers: getHeaders(token) }
//     );
//     const issues = searchResp.data.issues;
//     const total = issues.length;

//     const completed = issues.filter(
//       (issue) => issue.fields.status.statusCategory.name === "Done"
//     ).length;

//     const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

//     res.json({ total, completed, rate });
//   } catch (error) {
//     console.error(
//       "Error calculating completion rate:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({ message: "Failed to calculate completion rate" });
//   }
// };
