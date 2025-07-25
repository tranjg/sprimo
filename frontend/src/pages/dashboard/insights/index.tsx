import jiraApi from "@/api/jira";
import { SprintBurndownChart } from "@/components/SprintBurndownChart";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Insights = () => {
  const [jiraProjects, setJiraProjects] = useState([]);
  const [boards, setBoards] = useState([]);
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
    console.log(issuesData);
    setSprintIssues(issuesData); // or whatever state you're using
  };

  function generateBurndownData({ startDate, endDate, issues }) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    const totalPoints = issues.reduce((sum, issue) => {
      return sum + (issue.fields?.customfield_10046 || 0);
    }, 0);

    // Initialize each day with full total
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: dateStr, remaining: totalPoints });
    }

    // Subtract points on the resolution date
    for (const issue of issues) {
      const storyPoints = issue.fields?.customfield_10046 || 0;
      const resolved = issue.fields?.resolutiondate;
      if (!storyPoints || !resolved) continue;

      const resolvedDate = new Date(resolved).toISOString().split("T")[0];

      // subtract from all following days
      for (const day of days) {
        if (day.date >= resolvedDate) {
          day.remaining -= storyPoints;
        }
      }
    }

    return days;
  }

  const burndownPerSprint = sprintIssues.map((sprint) => {
    return {
      sprintId: sprint.sprintId,
      sprintName: sprint.sprintName,
      data: generateBurndownData({
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        issues: sprint.issues,
      }),
    };
  });
  console.log(burndownPerSprint)
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

  return (
    <div className="flex-1 p-5">
      {burndownPerSprint.map((burndown) => {
        return <SprintBurndownChart data={burndown.data} />;
      })}
    </div>
  );
};

export default Insights;
