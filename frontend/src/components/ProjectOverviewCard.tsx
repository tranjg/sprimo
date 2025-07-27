import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type StatusChange = {
  from: string;
  to: string;
  at: string;
};

type WorkItemFlow = {
  key: string;
  statusChanges: StatusChange[];
};

type JiraMetrics = {
  goalCompletion?: { done: number; total: number };
  velocityData?: Record<string, number>;
  workItemFlow?: WorkItemFlow[];
};

type CommitWeek = {
  days: number[];
  total: number;
  week: number; // epoch seconds
};

type GitHubMetrics = {
  prData?: { total: number; merged: number; mergeRate: number | null };
  commitStats?: CommitWeek[];
};

type ProjectMetrics = {
  projectName: string;
  jira?: JiraMetrics;
  github?: GitHubMetrics;
};

type Props = {
  project: ProjectMetrics;
};

export const ProjectOverviewCard = ({ project }: Props) => {
  const { projectName, jira, github } = project;
  const { goalCompletion, velocityData, workItemFlow } = jira || {};
  const { prData, commitStats: commitStatsArray } = github || {};

  const percentComplete =
    goalCompletion && goalCompletion.total > 0
      ? Math.round((goalCompletion.done / goalCompletion.total) * 100)
      : 0;

  const sprintNames = Object.keys(velocityData || {}).filter(
    (name) => name !== "Unknown Sprint"
  );
  const lastSprintName = sprintNames[sprintNames.length - 1] || "N/A";
  const velocityPoints = velocityData?.[lastSprintName] ?? 0;

  const totalCommits = useMemo(() => {
    if (!commitStatsArray) return 0;
    return commitStatsArray.reduce((acc, obj) => acc + (obj.total || 0), 0);
  }, [commitStatsArray]);

  const recentWeekData = commitStatsArray
    ? commitStatsArray[commitStatsArray.length - 2]
    : null;
  console.log(recentWeekData)

  const weekLabel = recentWeekData
    ? new Date(recentWeekData.week * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const recentDayCommits = recentWeekData?.days ?? [];

  // Recent Jira Updates (last 5 work items)
  const recentJiraUpdates = workItemFlow
    ? workItemFlow.slice(-5).reverse()
    : [];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{projectName}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Goal Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Goal Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>
                {goalCompletion?.done ?? 0}/{goalCompletion?.total ?? 0}
              </span>
              <span>{percentComplete}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Sprint Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {velocityPoints} pts <span>({lastSprintName})</span>
            </p>
            {/* Active Sprints */}
            {sprintNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {sprintNames.map((sprint) => (
                  <span
                    key={sprint}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {sprint}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PR Merge Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pull Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {prData?.merged ?? 0}/{prData?.total ?? 0} merged
              {prData?.mergeRate != null &&
                ` (${Math.round(prData.mergeRate * 100)}%)`}
            </p>
          </CardContent>
        </Card>

        {/* Commits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Commits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{totalCommits} commits total</p>
            {weekLabel && (
              <p className="text-xs text-gray-500 mt-1">
                Most recent week: {weekLabel}
              </p>
            )}
          </CardContent>
        </Card>
      </CardContent>

      {/* Recent Activity Section */}
      <div className="border-t pt-4 px-6">
        <h4 className="font-semibold mb-2">Recent Activity</h4>

        {/* Recent Commits (last 7 days of most recent week) */}
        {recentDayCommits.length > 0 && (
          <div className="mb-3">
            <h5 className="font-medium text-sm mb-1">
              Recent Commits (last 7 days)
            </h5>
            <ul className="text-xs list-disc list-inside h-full">
              {recentDayCommits.map((count, idx) => (
                <li key={idx}>
                  Day {idx + 1}: {count} commit{count !== 1 ? "s" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent PRs */}
        <div className="mb-3 text-sm">
          <h5 className="font-medium mb-1">PRs Merged</h5>
          <p>
            {prData?.merged ?? 0} merged out of {prData?.total ?? 0} total
          </p>
        </div>

        {/* Recent Jira Updates */}
        {recentJiraUpdates.length > 0 && (
          <div className="mb-1">
            <h5 className="font-medium text-sm mb-1">Recent Jira Updates</h5>
            <ul className="text-xs list-disc list-inside max-h-28 overflow-y-auto">
              {recentJiraUpdates.map(({ key, statusChanges }) => {
                const lastChange = statusChanges.slice(-1)[0];
                return (
                  <li key={key}>
                    <strong>{key}</strong>:{" "}
                    {lastChange
                      ? `Moved from ${lastChange.from} to ${lastChange.to}`
                      : "No recent status changes"}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
