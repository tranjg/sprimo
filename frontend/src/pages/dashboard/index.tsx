import { getHomeDashboardMetrics } from "@/api/dashboard.ts";
import CreateTeamDialog from "./components/CreateTeamDialog.tsx";
import { useEffect, useState } from "react";
import { ProjectOverviewCard } from "@/components/ProjectOverviewCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import axios from "axios";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isInJira, setIsInJira] = useState(false);
  const [isInGit, setIsInGit] = useState(false);

  const fetchJiraProjects = async () => {
    await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/jira/get-projects`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success !== false) {
          setIsInJira(true);
        }
      });
  };

  const fetchGitRepos = async () => {
    await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/github/get-repos`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success !== false) {
          setIsInGit(true);
        }
      });
  };

  useEffect(() => {
    fetchJiraProjects();
    fetchGitRepos();
  }, []);

  useEffect(() => {
    if (isInGit && isInJira) {
      getHomeDashboardMetrics().then((res) => setProjects(res.data));
    }
  }, [isInGit, isInJira]);
  return (
    <div className="flex-1 p-5 gap-4">
      {!isInJira && !isInGit && (
        <div className="flex p-4 border-1 rounded-md justify-end bg-sidebar">
          <div className="flex gap-2">
            {!isInJira && (
              <Button
                type="button"
                onClick={() => {
                  const currentPath =
                    "http://localhost:5173" +
                    window.location.pathname +
                    window.location.search;
                  const authorizeUrl = `http://localhost:3000/api/jira/authorize?returnTo=${encodeURIComponent(
                    currentPath
                  )}`;
                  window.location.href = authorizeUrl;
                }}
              >
                Connect to Jira
              </Button>
            )}
            {!isInGit && (
              <Button
                type="button"
                onClick={() => {
                  const currentPath =
                    "http://localhost:5173" +
                    window.location.pathname +
                    window.location.search;
                  const authorizeUrl = `http://localhost:3000/api/github/authorize?returnTo=${encodeURIComponent(
                    currentPath
                  )}`;
                  window.location.href = authorizeUrl;
                }}
              >
                Connect to GitHub
              </Button>
            )}
          </div>
        </div>
      )}
      {isInJira && isInGit && (
        <div className="flex flex-col gap-2 mt-8 h-full">
          {projects.map((project) => (
            <ProjectOverviewCard key={project.projectName} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
