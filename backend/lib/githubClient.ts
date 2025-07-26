import {Octokit} from "octokit"

export const getGitHubClient = (token) => {
  return new Octokit({ auth: token }); // e.g. process.env.GITHUB_PAT
};
