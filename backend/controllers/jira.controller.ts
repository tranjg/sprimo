import axios from "axios";

const redirectUri = "http://localhost:3000/api/jira/callback"; // Must match Atlassian dev console
const clientId = process.env.ATLASSIAN_DEV_CLIENT_ID;
const clientSecret = process.env.ATLASSIAN_DEV_SECRET;

export const authorize = async (req, res) => {
  try {
    const scopes = ["read:jira-user", "read:jira-work", "offline_access"].join(
      " "
    );

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
    if (!cloudId)
      return res.status(400).json({ message: "No Jira cloud found" });

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

    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data.values);
  } catch (err) {
    console.error(
      "Error fetching Jira projects:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};
