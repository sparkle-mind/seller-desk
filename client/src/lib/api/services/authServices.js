import axios from "@/lib/api/axiosInstance";

export const loginService = async (data) => {
  try {
    const response = await axios.post("/login", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerService = async (data) => {
  try {
    const response = await axios.post("/register", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// LOGOUT
export const logoutService = async () => {
  const response = await axios.post("/logout", {});

  return response.data;
};
