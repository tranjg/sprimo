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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA66CC",
  "#FF6699",
];

export const WorkItemFlowChart = ({ data }) => {
  const filteredData =
    Array.isArray(data?.data) && data.data.filter((d) => d.value > 0);

  const hasValidData = filteredData && filteredData.length > 0;

  const totalWorkItems =
    filteredData?.reduce((acc, d) => acc + d.value, 0) || 0;

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex-1 flex flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{data.sprintName}</CardTitle>
          <CardDescription>
            Breakdown of work items by type
          </CardDescription>
        </div>
        <div className="bg-muted/50 flex flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6 sm:w-40">
          <span className="text-muted-foreground text-xs">
            Total Work Items
          </span>
          <span className="text-lg leading-none font-bold sm:text-3xl">
            {totalWorkItems}
          </span>
        </div>
      </CardHeader>

      <CardContent className="h-[320px] p-2 sm:p-6 flex items-center justify-center">
        {!hasValidData ? (
          <div className="text-muted-foreground text-center italic">
            No work item data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
