import axios from "axios";

export async function getHomeDashboardMetrics() {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/home`, {
      withCredentials: true,
    });
    return res.data;
  }