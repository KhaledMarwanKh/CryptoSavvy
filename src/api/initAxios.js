import axios from "axios";

export const baseURL = "https://donors-calm-jeans-referring.trycloudflare.com/"

const axiosInst = axios.create({
    timeout: 10000,
    baseURL
});

export default axiosInst;