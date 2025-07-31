import { getHomeDashboardMetrics } from "@/api/dashboard.ts";
import { useEffect, useState } from "react";
import { ProjectOverviewCard } from "@/components/ProjectOverviewCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isInJira, setIsInJira] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isInGit, setIsInGit] = useState(false);

  const fetchJiraProjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/jira/get-projects`,
        { withCredentials: true }
      );
      if (res.data.success !== false && res.data !== undefined) {
        setIsInJira(true);
      }
    } catch (error) {
      console.error("Failed to fetch Jira projects:", error);
    }
  };

  const fetchGitRepos = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/get-repos`,
        { withCredentials: true }
      );
      if (res.data.success !== false) {
        setIsInGit(true);
      }
    } catch (error) {
      console.error("Failed to fetch GitHub repos:", error);
    }
  };

  useEffect(() => {
    fetchJiraProjects();
    fetchGitRepos();
  }, []);

  useEffect(() => {
    if (isInGit && isInJira) {
      setIsLoadingMetrics(true);
      getHomeDashboardMetrics()
        .then((res) => setProjects(res.data))
        .finally(() => setIsLoadingMetrics(false));
    }
  }, [isInGit, isInJira]);

  return (
    <div className="flex-1 p-5 gap-4">
      {/* Integration Prompt */}
      {(isInJira === false || isInGit === false) && (
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

      {/* Main Project Section */}
      {isInJira && isInGit && (
        <div className="flex flex-col gap-2 mt-8 h-full">
          {isLoadingMetrics ? (
            <div className="text-black text-sm p-4">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-2">No projects found</h2>
              <p className="text-base mb-4">
                Create a project to get started
              </p>
              <Button asChild>
                <Link to="/dashboard/teams">Go to Teams</Link>
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectOverviewCard
                key={project.projectName}
                project={project}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
