import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COLORS = ["#82ca9d", "#ff6b6b"]; // Green = Complete, Red = Incomplete

export const SprintGoalCompletionChart = ({ sprint }) => {
  const hasValidData =
    Array.isArray(sprint.data) && sprint.data.some((d) => d.value > 0);
  const totalGoals = sprint.data?.reduce((acc, d) => acc + d.value, 0) || 0;

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{sprint.sprintName}</CardTitle>
          <CardDescription>
            Completion breakdown of sprint goals
          </CardDescription>
        </div>
        <div className="flex">
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">Total Goals</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {totalGoals}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[320px] p-2 sm:p-6 flex items-center justify-center">
        {!hasValidData ? (
          <div className="text-muted-foreground text-center italic">
            No sprint goal data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sprint.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {sprint.data.map((entry, index) => (
                  <Cell
                    key={`goal-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
