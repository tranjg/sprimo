import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#82ca9d", "#ff6b6b"];

export const SprintGoalCompletionChart = ({ sprint }) => {
  return (
    <div>
      <h1>{sprint.sprintName}</h1>
      <PieChart width={400} height={300}>
        <Pie
          data={sprint.data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >
          {sprint.data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};
