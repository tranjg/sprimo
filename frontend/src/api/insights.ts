import axios from "axios";

export async function getInsightsByProject() {
  const res = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/api/insights/projects`,
    {
      withCredentials: true,
    }
  );
  return res.data;
}
