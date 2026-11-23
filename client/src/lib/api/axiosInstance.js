import axios from "axios";

/**
 * Single configured Axios instance for the whole app.
 * Features should use this instance instead of importing Axios directly.
 */

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
