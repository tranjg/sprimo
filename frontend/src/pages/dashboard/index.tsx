import { getHomeDashboardMetrics } from "@/api/dashboard.ts";
import CreateTeamDialog from "./components/CreateTeamDialog.tsx";
import { useEffect, useState } from "react";
import { ProjectOverviewCard } from "@/components/ProjectOverviewCard.tsx";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    getHomeDashboardMetrics().then((res) => setProjects(res.data));
  }, []);
  return (
    <div className="flex-1 p-5 gap-4">
      <div className="flex p-4 border-1 rounded-md justify-end bg-sidebar">
        <CreateTeamDialog />
      </div>
      <div className="flex flex-col gap-2 mt-8 h-full">
        {projects.map((project) => (
          <ProjectOverviewCard key={project.projectName} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
