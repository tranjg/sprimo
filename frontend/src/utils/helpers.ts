export function generateBurndownData(sprint) {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const totalStoryPoints = sprint.issues.reduce((sum, issue) => {
    const sp = issue.fields.customfield_10046; // replace with your actual story points field
    return sum + (typeof sp === "number" ? sp : 0);
  }, 0);

  const burndownData = [];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);

    const remaining =
      totalStoryPoints - (i * totalStoryPoints) / (totalDays - 1); // linear ideal line

    burndownData.push({
      date: date.toISOString().split("T")[0],
      remaining: Math.max(0, Math.round(remaining)),
    });
  }

  return {
    sprintId: sprint.sprintId,
    sprintName: sprint.sprintName,
    totalStoryPoints,
    totalDays,
    data: burndownData,
  };
}

export function generateGoalCompletionData(sprint) {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  let completed = 0;
  let incomplete = 0;

  for (const issue of sprint.issues) {
    const statusCategory = issue.fields.status?.statusCategory?.key;
    if (statusCategory === "done") {
      completed++;
    } else {
      incomplete++;
    }
  }

  return {
    sprintId: sprint.sprintId,
    sprintName: sprint.sprintName,
    totalIssues: sprint.issues.length,
    totalDays,
    data: [
      { name: "Completed", value: completed },
      { name: "Incomplete", value: incomplete },
    ],
  };
}

export function generateVelocityData(sprint) {
  let committed = 0;
  let completed = 0;

  for (const issue of sprint.issues) {
    const sp = issue.fields.customfield_10046; // Replace with your actual SP field
    const storyPoints = typeof sp === "number" ? sp : 0;
    committed += storyPoints;

    const isDone = issue.fields.status?.statusCategory?.key === "done";
    if (isDone) {
      completed += storyPoints;
    }
  }

  return {
    sprintId: sprint.sprintId,
    sprintName: sprint.sprintName,
    committed,
    completed,
  };
}

export function generateWorkItemFlowData(sprint) {
  const statusCounts = {};

  for (const issue of sprint.issues) {
    const status = issue.fields.status?.name || "Unknown";

    if (!statusCounts[status]) {
      statusCounts[status] = 0;
    }

    statusCounts[status]++;
  }

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return {
    sprintId: sprint.sprintId,
    sprintName: sprint.sprintName,
    data,
  };
}
