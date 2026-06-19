import judgeXClient from "./judgeX.client.js";

export const executeCode = async (code, language, stdin) => {
    const response = await judgeXClient.post("/submissions?wait=true", {
        source_code: code,
        language_id: language,
        stdin: stdin,
    });
    return response.data;
};