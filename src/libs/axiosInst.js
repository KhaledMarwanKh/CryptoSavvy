import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const axiosInst = axios.create({
  baseURL,
  timeout: 100000,
});

export default axiosInst;
