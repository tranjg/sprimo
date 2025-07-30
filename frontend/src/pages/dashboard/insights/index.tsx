import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  generateBurndownData,
  generateGoalCompletionData,
  generateVelocityData,
  generateWorkItemFlowData,
  generateCommitsOverTimeData,
  generateIssueFlowData,
} from "@/utils/helpers";
import { getInsightsByProject } from "@/api/insights";
import { CommitsOverTimeChart } from "@/components/CommitsOverTime";
import { IssueFlowChart } from "@/components/IssueFlowChart";
import { SprintBurndownChart } from "@/components/SprintBurndownChart";
import { SprintGoalCompletionChart } from "@/components/SprintGoalCompletionChart";
import { VelocityChart } from "@/components/VelocityChart";
import { WorkItemFlowChart } from "@/components/WorkItemFlowChart";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    <div className="grid gap-6 md:grid-cols-2">{children}</div>
  </section>
);

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [filters, setFilters] = useState({
    projectId: "",
    sprintName: "",
    startDate: "",
    endDate: "",
  });

  const token = localStorage.getItem("token") || "";
  const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const userId =
    useSelector((state) => state.authReducer.id) || decodedToken?.id;

  useEffect(() => {
    getInsightsByProject()
      .then((res) => {
        if (res?.insights) setInsights(res.insights);
      })
      .catch(console.error);
  }, []);

  const projectsWithSprints = useMemo(() => {
    if (!insights.length) return [];
    return insights.map(({ projectId, projectName, jira, github }) => ({
      projectId,
      projectName,
      sprints: jira?.sprints ?? [],
      githubData: github ?? {},
    }));
  }, [insights]);

  const filteredProjects = useMemo(() => {
    return projectsWithSprints
      .filter((project) => {
        if (filters.projectId && project.projectId !== filters.projectId)
          return false;
        return true;
      })
      .map((project) => ({
        ...project,
        sprints: project.sprints.filter((sprint) => {
          const matchesName = filters.sprintName
            ? sprint.sprintName
                ?.toLowerCase()
                .includes(filters.sprintName.toLowerCase())
            : true;

          const start = filters.startDate ? new Date(filters.startDate) : null;
          const end = filters.endDate ? new Date(filters.endDate) : null;
          const sprintStart = new Date(sprint.startDate);
          const sprintEnd = new Date(sprint.endDate);

          const inDateRange =
            (!start || sprintEnd >= start) && (!end || sprintStart <= end);

          return matchesName && inDateRange;
        }),
      }))
      .filter((project) => project.sprints.length > 0);
  }, [projectsWithSprints, filters]);

  const clearFilters = () => {
    setFilters({
      projectId: "",
      sprintName: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="p-6 space-y-10">
      {/* Filter UI */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div className="w-60">
          <label className="text-sm text-muted-foreground mb-1 block">
            Project
          </label>
          <Select
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, projectId: value, sprintName: "" }))
            }
            value={filters.projectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              {projectsWithSprints.map((project) => (
                <SelectItem key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-60">
          <label className="text-sm text-muted-foreground mb-1 block">
            Sprint Name
          </label>
          <Select
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, sprintName: value }))
            }
            value={filters.sprintName}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sprints" />
            </SelectTrigger>
            <SelectContent>
              {projectsWithSprints
                .find((p) => p.projectId === filters.projectId)
                ?.sprints.map((sprint) => (
                  <SelectItem key={sprint.sprintName} value={sprint.sprintName}>
                    {sprint.sprintName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="text-sm text-muted-foreground mb-1 block">
            Start Date
          </label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, startDate: e.target.value }))
            }
          />
        </div>

        <div className="w-48">
          <label className="text-sm text-muted-foreground mb-1 block">
            End Date
          </label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: e.target.value }))
            }
          />
        </div>

        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:underline mt-2 ml-2"
        >
          Clear Filters
        </button>
      </div>

      {/* Insights UI */}
      {filteredProjects.map(
        ({ projectId, projectName, sprints, githubData }) => {
          const burndownPerSprint = sprints
            .map(generateBurndownData)
            .filter(Boolean);
          const goalCompletionPerSprint = sprints
            .map(generateGoalCompletionData)
            .filter(Boolean);
          const velocityPerSprint = sprints
            .map(generateVelocityData)
            .filter(Boolean);
          const workItemData = sprints
            .map(generateWorkItemFlowData)
            .filter(Boolean);

          const pullRequestCompletion = githubData.pullRequestCompletion || [];
          const commitActivity = githubData.commitActivity || [];
          const issueFlowData = generateIssueFlowData(pullRequestCompletion);
          const commitsData = sprints.map((sprint) =>
            generateCommitsOverTimeData(commitActivity, sprint)
          );

          return (
            <div
              key={projectId}
              className="border rounded-xl p-6 bg-white shadow-md space-y-8"
            >
              <h1 className="text-3xl font-bold mb-6">{projectName}</h1>

              {burndownPerSprint.length > 0 && (
                <Section title="Burndown">
                  {burndownPerSprint.map((sprint) => (
                    <SprintBurndownChart
                      key={sprint.sprintId}
                      sprint={sprint}
                    />
                  ))}
                </Section>
              )}

              {(goalCompletionPerSprint.length > 0 ||
                velocityPerSprint.length > 0) && (
                <Section title="Sprint Performance">
                  {goalCompletionPerSprint.map((sprint) => (
                    <SprintGoalCompletionChart
                      key={sprint.sprintId}
                      sprint={sprint}
                    />
                  ))}
                  {velocityPerSprint.length > 0 && (
                    <VelocityChart data={velocityPerSprint} />
                  )}
                </Section>
              )}

              {workItemData.length > 0 && (
                <Section title="Work Item Flow">
                  {workItemData.map((data) => (
                    <WorkItemFlowChart key={data.sprintId} data={data} />
                  ))}
                </Section>
              )}

              <Section title="GitHub Activity">
                {/* {pullRequestCompletion.length > 0 && ( <IssueFlowChart data={issueFlowData} /> )} */}
                <IssueFlowChart
                  data={[
                    { name: "Open", value: 8 },
                    { name: "Closed", value: 4 },
                  ]}
                />
                {commitActivity.length > 0 &&
                  commitsData.map((data, i) => (
                    <CommitsOverTimeChart key={i} data={data} />
                  ))}
              </Section>
            </div>
          );
        }
      )}
    </div>
  );
};

export default Insights;
