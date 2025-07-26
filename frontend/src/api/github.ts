import axios from "axios";

export async function fetchPullRequestCompletionForRepo(repo: string) {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/github/pull-requests`, {
    params: { repo },
    withCredentials: true,
  });
  return res.data;
}

export async function fetchCommitsForRepo(repo: string) {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/github/commits`, {
    params: { repo },
    withCredentials: true,
  });
  return res.data;
}

export async function fetchIssueFlowForRepo(repo: string) {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/github/issues`, {
    params: { repo },
    withCredentials: true,
  });
  return res.data;
}
