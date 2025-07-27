import { fetchCommitsForRepo, fetchIssueFlowForRepo } from "@/api/github";
import jiraApi from "@/api/jira";
import { CommitsOverTimeChart } from "@/components/CommitsOverTime";
import { IssueFlowChart } from "@/components/IssueFlowChart";
import { SprintBurndownChart } from "@/components/SprintBurndownChart";
import { SprintGoalCompletionChart } from "@/components/SprintGoalCompletionChart";
import { VelocityChart } from "@/components/VelocityChart";
import { WorkItemFlowChart } from "@/components/WorkItemFlowChart";

import {
  generateBurndownData,
  generateCommitsOverTimeData,
  generateGoalCompletionData,
  generateIssueFlowData,
  generateVelocityData,
  generateWorkItemFlowData,
} from "@/utils/helpers";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    <div className="grid gap-6 md:grid-cols-2">{children}</div>
  </section>
);

const ChartCard = ({ children }) => (
  <div className="rounded-2xl shadow-md border border-gray-200 bg-white p-4">
    {children}
  </div>
);

const Insights = () => {
  const [jiraProjects, setJiraProjects] = useState([]);
  const [boards, setBoards] = useState([]);
  const [commits, setCommits] = useState([]);
  const [gitIssues, setGitIssues] = useState([]);
  const [boardsWithSprints, setBoardsWithSprints] = useState([]);
  const [sprintIssues, setSprintIssues] = useState([]);
  const token = localStorage.getItem("token") || "";
  const decodedToken = token ? jwtDecode(token) : null;
  const userId =
    useSelector((state: any) => state.authReducer.id) || decodedToken?.id;

  const fetchJiraProjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/jira/get-projects`,
        {
          withCredentials: true,
        }
      );
      if (res.data) setJiraProjects(res.data);
    } catch (e) {
      console.error("Failed to fetch Jira projects", e);
    }
  };

  const fetchBoards = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/jira/get-boards`,
        {
          withCredentials: true,
        }
      );
      setBoards(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to fetch boards", e);
    }
  };

  const fetchSprintsForBoard = async () => {
    try {
      const sprintData = await Promise.all(
        boards.map(async (board) => {
          const res = await jiraApi.getSprintsForBoard(board.id);
          return {
            id: board.id,
            name: board.name,
            sprints: Array.isArray(res.values) ? res.values : [],
          };
        })
      );
      setBoardsWithSprints(sprintData);
    } catch (e) {
      console.error("Failed to fetch sprints for boards", e);
    }
  };

  const fetchIssues = async () => {
    try {
      const issuesData = await Promise.all(
        boardsWithSprints.flatMap((board) =>
          (board.sprints || []).map(async (sprint) => {
            const res = await jiraApi.getIssuesForSprint(sprint.id);
            return {
              boardId: board.id,
              boardName: board.name,
              sprintId: sprint.id,
              sprintName: sprint.name,
              startDate: sprint.startDate,
              endDate: sprint.endDate,
              issues: Array.isArray(res) ? res : [],
            };
          })
        )
      );
      setSprintIssues(issuesData);
    } catch (e) {
      console.error("Failed to fetch sprint issues", e);
    }
  };

  useEffect(() => {
    if (boards.length > 0) {
      fetchSprintsForBoard();
    } else {
      fetchJiraProjects();
      fetchBoards();
    }
  }, [boards]);

  useEffect(() => {
    if (boardsWithSprints.length > 0) {
      fetchIssues();
    }
  }, [boardsWithSprints]);

  useEffect(() => {
    fetchCommitsForRepo("tranjg/sprimo").then(setCommits).catch(console.error);
    fetchIssueFlowForRepo("tranjg/sprimo")
      .then(setGitIssues)
      .catch(console.error);
  }, []);

  const burndownPerSprint = useMemo(
    () => sprintIssues.map(generateBurndownData).filter(Boolean),
    [sprintIssues]
  );
  const goalCompletionPerSprint = useMemo(
    () => sprintIssues.map(generateGoalCompletionData).filter(Boolean),
    [sprintIssues]
  );
  const velocityPerSprint = useMemo(
    () => sprintIssues.map(generateVelocityData).filter(Boolean),
    [sprintIssues]
  );
  const workItemData = useMemo(
    () => sprintIssues.map(generateWorkItemFlowData).filter(Boolean),
    [sprintIssues]
  );
  const commitsData = useMemo(
    () => generateCommitsOverTimeData(commits),
    [commits]
  );
  const issueFlowData = useMemo(
    () => generateIssueFlowData(gitIssues),
    [gitIssues]
  );

  return (
    <div className="p-6 space-y-10">
      {burndownPerSprint.length > 0 && (
        <Section title="Burndown">
          {burndownPerSprint.map((sprint) => (
              <SprintBurndownChart sprint={sprint} />
          ))}
        </Section>
      )}

      {(goalCompletionPerSprint.length > 0 || velocityPerSprint.length > 0) && (
        <Section title="Sprint Performance">
          {goalCompletionPerSprint.map((sprint) => (
              <SprintGoalCompletionChart sprint={sprint} />
          ))}
          {velocityPerSprint.length > 0 && (
              <VelocityChart data={velocityPerSprint} />
          )}
        </Section>
      )}

      {workItemData.length > 0 && (
        <Section title="Work Item Flow">
          {workItemData.map((data) => (
              <WorkItemFlowChart data={data} />
          ))}
        </Section>
      )}

      <Section title="GitHub Activity">
        {issueFlowData.length > 0 && (
            <IssueFlowChart data={issueFlowData} />
            // <IssueFlowChart
            //   data={[
            //     { name: "Open", value: 8 },
            //     { name: "Closed", value: 4 },
            //     { name: "In Progress", value: 3 },
            //   ]}
            // />
        )}
        {commitsData.length > 0 && (
            <CommitsOverTimeChart data={commitsData} />
        )}
      </Section>
    </div>
  );
};

export default Insights;
