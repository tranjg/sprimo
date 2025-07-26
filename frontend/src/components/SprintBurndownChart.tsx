import * as React from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function SprintBurndownChart({ sprint }) {
  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{sprint.sprintName}</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">
              Total Story Points
            </span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {sprint.totalStoryPoints}
            </span>
          </div>
          <div className="bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">
              Total Days
            </span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {sprint.totalDays}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <LineChart
          accessibilityLayer
          data={sprint.data}
          width={600}
          height={300}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          {/* <CartesianGrid vertical={false} /> */}
          <XAxis dataKey="date" tickLine={false} axisLine={true} />
          <YAxis />
          <Tooltip />
          <Line
            dataKey="remaining"
            type="monotone"
            stroke={`var(--color-chart-1)`}
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </CardContent>
    </Card>
  );
}
