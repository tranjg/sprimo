import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function IssueFlowChart({ data }) {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];
  const filteredData = Array.isArray(data)
    ? data.filter((d) => d.value > 0)
    : [];
  const totalIssues = filteredData.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Issue Flow</CardTitle>
          <CardDescription>
            Distribution of issue statuses in the current sprint
          </CardDescription>
        </div>
        <div className="flex">
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">Total Issues</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {totalIssues}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[320px] p-2 sm:p-6 flex items-center justify-center">
        {filteredData.length === 0 ? (
          <div className="text-muted-foreground text-center italic">
            No issue flow data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
