import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const VelocityChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="sprintName" />
        <Tooltip />
        <Legend />
        <Bar dataKey="committed" fill="#8884d8" name="Committed SP" />
        <Bar dataKey="completed" fill="#82ca9d" name="Completed SP" />
      </BarChart>
    </ResponsiveContainer>
  );
};
