import axios from "axios";

const judgeXClient = axios.create({
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

judgeXClient.interceptors.request.use((config) => {
    config.baseURL = process.env.JUDGE0_API_BASE_URL || "http://localhost:2358";
    return config;
});

export default judgeXClient;
