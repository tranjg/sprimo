import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CommitsOverTimeChart({ data }) {
  const totalCommits = data.reduce((sum, d) => sum + d.commits, 0);
  const totalDays = data.length;
  const sprintName = data.length > 0 ? data[0].sprintName : null;
  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Commits Over Time - {sprintName}</CardTitle>
          <CardDescription>
            Tracking commit activity throughout the sprint duration
          </CardDescription>
        </div>
        <div className="flex">
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">Total Commits</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {totalCommits}
            </span>
          </div>
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">Total Days</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {totalDays}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <LineChart
          data={data}
          width={600}
          height={300}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="commits"
            stroke={`var(--color-chart-1)`}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </CardContent>
    </Card>
  );
}
