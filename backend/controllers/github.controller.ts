import axios from "axios";
import { getGitHubHeaders } from "../utils/helpers.ts";
import { getGitHubClient } from "../lib/githubClient.ts";

const redirectUri = "http://localhost:3000/api/github/callback"; // Must match Atlassian dev console
const clientId = process.env.GITHUB_DEV_CLIENT_ID;
const clientSecret = process.env.GITHUB_DEV_SECRET;

export const authorize = (req, res) => {
  try {
    const stateData = {
      state: crypto.randomUUID(),
      returnTo: req.query.returnTo || "/dashboard",
    };
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString(
      "base64"
    );

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&state=${encodedState}`;
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
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: { Accept: "application/json" },
      }
    );
    const { access_token } = tokenResponse.data;
    req.session.github_accessToken = access_token;
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

export const getRepos = async (req, res) => {
  const token = req.session.github_accessToken;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  if (token) {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.data) {
      res.json(response.data);
    }
  } else {
    res.status(401).json({ message: "Unauthorized", success: false });
  }
};

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
});

export const getPullRequestsForRepo = async (req, res) => {
  const { repo } = req.query; // repo = "owner/repo-name"
  const token = req.session.github_accessToken;

  if (!repo || !token) {
    return res.status(400).json({ message: "Missing repo or token" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/pulls?state=all&per_page=100`,
      { headers: getAuthHeaders(token) }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching PRs:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch pull requests" });
  }
};

export const getCommitsForRepo = async (req, res) => {
  const { repo } = req.query;
  const token = req.session.github_accessToken;

  if (!repo || !token) {
    return res.status(400).json({ message: "Missing repo or token" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/commits?per_page=100`,
      { headers: getAuthHeaders(token) }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching commits:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch commits" });
  }
};

export const getIssuesForRepo = async (req, res) => {
  const { repo } = req.query;
  const token = req.session.github_accessToken;

  if (!repo || !token) {
    return res.status(400).json({ message: "Missing repo or token" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/issues?state=all&per_page=100`,
      { headers: getAuthHeaders(token) }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching issues:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
};
