import judgeXClient from "./judgeX.client.js";
import { compareOutputs } from "./outputComprator.js";
export const getSubmission = async (token) => {
    const { data } = await judgeXClient.get(
        `/submissions/${token}`
    );

    return data;
}

export const compareResults = (expected, actual) => {
    return compareOutputs(expected, actual);
}

