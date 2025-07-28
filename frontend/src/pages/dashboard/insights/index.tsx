import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";

import {
  generateBurndownData,
  generateCommitsOverTimeData,
  generateGoalCompletionData,
  generateIssueFlowData,
  generateVelocityData,
  generateWorkItemFlowData,
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
  const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null; // jwtDecode can be used as well
  const userId =
    useSelector((state) => state.authReducer.id) || decodedToken?.id;

  useEffect(() => {
    getInsightsByProject()
      .then((res) => {
        if (res?.insights) setInsights(res.insights);
      })
      .catch(console.error);
  }, []);

  // Flatten all sprints from all projects into one array for sprint charts
  const allSprints = useMemo(() => {
    if (!insights.length) return [];
    return insights.flatMap(({ jira }) => jira?.sprints ?? []);
  }, [insights]);

  // Generate sprint-based chart data
  const burndownPerSprint = useMemo(
    () => allSprints.map(generateBurndownData).filter(Boolean),
    [allSprints]
  );
  const goalCompletionPerSprint = useMemo(
    () => allSprints.map(generateGoalCompletionData).filter(Boolean),
    [allSprints]
  );
  const velocityPerSprint = useMemo(
    () => allSprints.map(generateVelocityData).filter(Boolean),
    [allSprints]
  );
  const workItemData = useMemo(
    () => allSprints.map(generateWorkItemFlowData).filter(Boolean),
    [allSprints]
  );

  const allPRs = useMemo(() => {
    if (!insights.length) return [];
    return insights.flatMap((proj) => proj.github?.pullRequestCompletion ?? []);
  }, [insights]);

  const allCommits = useMemo(() => {
    if (!insights.length) return [];
    return insights.flatMap((proj) => proj.github?.commitActivity ?? []);
  }, [insights]);

  const commitsData = allSprints.map((sprint) =>
    generateCommitsOverTimeData(allCommits, sprint)
  );
  const issueFlowData = useMemo(() => generateIssueFlowData(allPRs), [allPRs]);

  return (
    <div className="p-6 space-y-10">
      {burndownPerSprint.length > 0 && (
        <Section title="Burndown">
          {burndownPerSprint.map((sprint) => (
            <SprintBurndownChart key={sprint.sprintId} sprint={sprint} />
          ))}
        </Section>
      )}

      {(goalCompletionPerSprint.length > 0 || velocityPerSprint.length > 0) && (
        <Section title="Sprint Performance">
          {goalCompletionPerSprint.map((sprint) => (
            <SprintGoalCompletionChart key={sprint.sprintId} sprint={sprint} />
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
        {/* {issueFlowData.length > 0 && <IssueFlowChart data={issueFlowData} />} */}
        <IssueFlowChart
          data={[
            { name: "Open", value: 8 },
            { name: "Closed", value: 4 },
            { name: "In Progress", value: 3 },
          ]}
        />
        {commitsData.length > 0 &&
          commitsData.map((data) => <CommitsOverTimeChart data={data} />)}
      </Section>
    </div>
  );
};

export default Insights;
