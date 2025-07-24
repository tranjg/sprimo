import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/jira`; // proxy to Express backend

const jiraApi = {
  authorize: () => {
    window.location.href = `${API_BASE}/authorize?returnTo=/dashboard`;
  },

  getProjects: async () => {
    const res = await axios.get(`${API_BASE}/get-projects`, {
      withCredentials: true,
    });
    return res.data;
  },

  getIssuesForProject: async (projectId: string) => {
    const res = await axios.get(`${API_BASE}/get-issues-for-project?projectId=${projectId}`, {
      withCredentials: true,
    });
    return res.data;
  },

  getCompletionRate: async (projectKey: string) => {
    const res = await axios.get(`${API_BASE}/get-completion-rate?projectKey=${projectKey}`, {
      withCredentials: true,
    });
    return res.data;
  },

  // Optional: query issues directly for team-managed projects if implemented
  getIssuesByProject: async (projectKey: string) => {
    const res = await axios.get(`${API_BASE}/issues?projectKey=${projectKey}`, {
      withCredentials: true,
    });
    return res.data;
  },
};

export default jiraApi;
