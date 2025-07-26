import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function IssueFlowChart({ data }) {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];
  return (
    <div className="w-full h-80">
      <h2 className="text-xl font-semibold mb-2">Issue Flow</h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
