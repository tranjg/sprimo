import axios from "axios";

export const getCloudId = async (token) => {
  const response = await axios.get(
    "https://api.atlassian.com/oauth/token/accessible-resources",
    { headers: getHeaders(token) }
  );
  return response.data[0]?.id;
};

export const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export function getGitHubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };
}

export async function fetchSprintsForBoard(
  cloudId: string,
  boardId: string,
  token: string
) {
  const response = await axios.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/sprint`,
    { headers: getHeaders(token) }
  );
  return response.data.values || [];
}

export async function fetchIssuesForSprint(
  cloudId: string,
  sprintId: string,
  token: string
) {
  const jql = `sprint = ${sprintId}`;
  const response = await axios.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
    {
      headers: getHeaders(token),
      params: {
        jql,
        maxResults: 100,
        fields: [
          "summary",
          "status",
          "assignee",
          "issuetype",
          "created",
          "updated",
          "customfield_10020",
          "customfield_10016", // story points
          "customfield_10046", // story points
        ],
      },
    }
  );
  const issues = response.data.issues || [];

  // Map and normalize story points from either field
  const enrichedIssues = issues.map((issue) => {
    const fields = issue.fields;

    const storyPoints =
      typeof fields.customfield_10016 === "number"
        ? fields.customfield_10016
        : typeof fields.customfield_10046 === "number"
        ? fields.customfield_10046
        : 0;

    return {
      ...issue,
      storyPoints, // normalized story points
    };
  });

  return enrichedIssues;
}
