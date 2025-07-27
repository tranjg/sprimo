export function generateBurndownData(sprint) {
  if (!sprint || !sprint.startDate || !sprint.endDate) return null;
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const issues = Array.isArray(sprint.issues) ? sprint.issues : [];
  const totalStoryPoints = issues.reduce((sum, issue) => {
    const sp = issue?.fields?.customfield_10046;
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
  if (!sprint) return null;
  const issues = Array.isArray(sprint.issues) ? sprint.issues : [];

  let completed = 0;
  let incomplete = 0;

  for (const issue of issues) {
    const statusCategory = issue?.fields?.status?.statusCategory?.key;
    if (statusCategory === "done") {
      completed++;
    } else {
      incomplete++;
    }
  }

  return {
    sprintId: sprint.sprintId,
    sprintName: sprint.sprintName,
    totalIssues: issues.length,
    totalDays: sprint.totalDays || 0,
    data: [
      { name: "Completed", value: completed },
      { name: "Incomplete", value: incomplete },
    ],
  };
}

export function generateVelocityData(sprint) {
  if (!sprint) return null;
  const issues = Array.isArray(sprint.issues) ? sprint.issues : [];

  let committed = 0;
  let completed = 0;

  for (const issue of issues) {
    const sp = issue?.fields?.customfield_10046;
    const storyPoints = typeof sp === "number" ? sp : 0;
    committed += storyPoints;

    const isDone = issue?.fields?.status?.statusCategory?.key === "done";
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
  if (!sprint) return null;
  const issues = Array.isArray(sprint.issues) ? sprint.issues : [];

  const statusCounts = {};

  for (const issue of issues) {
    const status = issue?.fields?.status?.name || "Unknown";

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

export function generatePullRequestCompletionData(prs) {
  if (!Array.isArray(prs)) return [];

  let open = 0;
  let merged = 0;
  let closed = 0;

  prs.forEach((pr) => {
    if (pr.state === "open") open++;
    else if (pr.state === "closed" && pr.merged_at) merged++;
    else if (pr.state === "closed") closed++;
  });

  return [
    { name: "Open", value: open },
    { name: "Merged", value: merged },
    { name: "Closed (unmerged)", value: closed },
  ];
}

export function generateCommitsOverTimeData(commits) {
  if (!Array.isArray(commits)) return [];

  // Group commits by date (YYYY-MM-DD)
  const countsByDate = {};

  commits.forEach(({ commit }) => {
    const date = commit?.author?.date?.slice(0, 10);
    if (!date) return;
    countsByDate[date] = (countsByDate[date] || 0) + 1;
  });

  // Convert to array sorted by date
  const sortedDates = Object.keys(countsByDate).sort();

  return sortedDates.map((date) => ({
    date,
    commits: countsByDate[date],
  }));
}

export function generateIssueFlowData(issues) {
  if (!Array.isArray(issues)) return [];

  const counts = { open: 0, closed: 0 };

  issues.forEach((issue) => {
    if (issue.state === "open") counts.open++;
    else if (issue.state === "closed") counts.closed++;
  });

  return [
    { name: "Open", value: counts.open },
    { name: "Closed", value: counts.closed },
  ];
}
