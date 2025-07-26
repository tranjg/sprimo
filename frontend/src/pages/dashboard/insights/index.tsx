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
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Insights = () => {
  const [jiraProjects, setJiraProjects] = useState([]);
  const [boards, setBoards] = useState([]);
  const [commits, setCommits] = useState([]);
  const [gitIssues, setGitIssues] = useState([]);
  const [boardsWithSprints, setBoardsWithSprints] = useState([{}]);
  const [sprintIssues, setSprintIssues] = useState([]);
  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode(token);
  const userId =
    useSelector((state: any) => state.authReducer.id) || decodedToken.id;

  const fetchJiraProjects = async () => {
    await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/jira/get-projects`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data) {
          setJiraProjects(res.data);
        }
      });
  };

  const fetchBoards = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/jira/get-boards`,
      {
        withCredentials: true,
      }
    );
    setBoards(res.data);
  };

  const fetchSprintsForBoard = async () => {
    const sprintData = await Promise.all(
      boards.map(async (board) => {
        const res = await jiraApi.getSprintsForBoard(board.id);
        return {
          id: board.id,
          name: board.name,
          sprints: res.values,
        };
      })
    );

    setBoardsWithSprints(sprintData);
  };

  const fetchIssues = async () => {
    const issuesData = await Promise.all(
      boardsWithSprints.flatMap((board) =>
        board.sprints.map(async (sprint) => {
          const res = await jiraApi.getIssuesForSprint(sprint.id);
          return {
            boardId: board.id,
            boardName: board.name,
            sprintId: sprint.id,
            sprintName: sprint.name,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            issues: res || [], // depends on your API format
          };
        })
      )
    );
    setSprintIssues(issuesData); // or whatever state you're using
  };

  const burndownPerSprint = sprintIssues.map((sprint) => {
    return generateBurndownData(sprint);
  });

  const goalCompletionPerSprint = sprintIssues.map((sprint) => {
    return generateGoalCompletionData(sprint);
  });

  const velocityPerSprint = sprintIssues.map((sprint) => {
    return generateVelocityData(sprint);
  });

  const workItemData = sprintIssues.map((sprint) => {
    return generateWorkItemFlowData(sprint);
  });

  useEffect(() => {
    if (boards.length > 0) {
      fetchSprintsForBoard();
    } else {
      fetchJiraProjects();
      fetchBoards();
    }
  }, [boards]);

  useEffect(() => {
    fetchIssues();
  }, [boardsWithSprints]);

  useEffect(() => {
    fetchCommitsForRepo("tranjg/sprimo")
      .then(setCommits)
      .catch(console.error);
    fetchIssueFlowForRepo("tranjg/sprimo")
        .then(setGitIssues)
  }, []);

  const commitsData = generateCommitsOverTimeData(commits);
  const issueFlowData = generateIssueFlowData(gitIssues);

  console.log(issueFlowData)

  return (
    <div className="flex-1 p-5">
      {burndownPerSprint.map((sprint) => {
        return <SprintBurndownChart sprint={sprint} />;
      })}
      {goalCompletionPerSprint.map((sprint) => {
        return <SprintGoalCompletionChart sprint={sprint} />;
      })}
      <VelocityChart data={velocityPerSprint} />
      {workItemData.map((data) => {
        return <WorkItemFlowChart data={data} />;
      })}
      <CommitsOverTimeChart data={commitsData} />
    </div>
  );
};

export default Insights;
