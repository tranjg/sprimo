import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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

export const VelocityChart = ({ data }) => {
  const hasValidData =
    Array.isArray(data) &&
    data.length > 0 &&
    data.some((d) => d.committed > 0 || d.completed > 0);

  const totalCommitted =
    data?.reduce((acc, d) => acc + (d.committed || 0), 0) || 0;
  const totalCompleted =
    data?.reduce((acc, d) => acc + (d.completed || 0), 0) || 0;

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Velocity</CardTitle>
          <CardDescription>
            Comparison of committed vs. completed story points per sprint
          </CardDescription>
        </div>
        <div className="flex">
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">Committed</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {totalCommitted}
            </span>
          </div>
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">Completed</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {totalCompleted}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[320px] p-2 sm:p-6 flex items-center justify-center">
        {!hasValidData ? (
          <div className="text-muted-foreground text-center italic">
            No velocity data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="sprintName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="committed" fill="#8884d8" name="Committed SP" />
              <Bar dataKey="completed" fill="#82ca9d" name="Completed SP" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
