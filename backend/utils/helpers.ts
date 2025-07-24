import axios from "axios";

export const getCloudId = async (token) => {
    const response = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      { headers: getHeaders(token) }
    );
    return response.data[0]?.id;
  };
  
  export const getHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });
  