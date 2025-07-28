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

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    <div className="grid gap-6 md:grid-cols-2">{children}</div>
  </section>
);

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const token = localStorage.getItem("token") || "";
  const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null; // or use jwtDecode
  const userId =
    useSelector((state) => state.authReducer.id) || decodedToken?.id;

  useEffect(() => {
    getInsightsByProject()
      .then((res) => {
        if (res?.insights) setInsights(res.insights);
      })
      .catch(console.error);
  }, []);

  // Group sprints by project
  const projectsWithSprints = useMemo(() => {
    if (!insights.length) return [];
    return insights.map(({ projectId, projectName, jira, github }) => ({
      projectId,
      projectName,
      sprints: jira?.sprints ?? [],
      githubData: github ?? {},
    }));
  }, [insights]);

  return (
    <div className="p-6 space-y-10">
      {projectsWithSprints.map(
        ({ projectId, projectName, sprints, githubData }) => {
          // Generate sprint charts data per project
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

          // GitHub data for project
          const pullRequestCompletion = githubData.pullRequestCompletion || [];
          const commitActivity = githubData.commitActivity || [];
          
          // Generate GitHub charts data
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
                {/* {pullRequestCompletion.length > 0 && (
                  <IssueFlowChart data={issueFlowData} />
                )} */}
                <IssueFlowChart
                  data={[
                    { name: "Open", value: 8 },
                    { name: "Closed", value: 4 },
                    { name: "In Progress", value: 3 },
                  ]}
                />
                {commitActivity.length > 0 &&
                  commitsData.map((data) => (
                    <CommitsOverTimeChart data={data} />
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
