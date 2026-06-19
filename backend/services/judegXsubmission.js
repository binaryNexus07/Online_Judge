import { Submission } from "../schema/submission.js";
import { Problem } from "../schema/problem.js";
import { TestCase } from "../schema/testcase.js";

import { executeCode } from "./judgeX.service.js";
import { compareOutputs } from "./outputComprator.js";
import { getLanguageId } from "./languageMap.js";
import { buildCode } from "./codeBuilder.js";

export const judgeSubmission = async (submissionId) => {
  try {
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    submission.status = "judging";
    await submission.save();

    const problem = await Problem.findById(
      submission.problemId
    );

    if (!problem) {
      submission.status = "runtime_error";
      submission.errorOutput = "Problem not found";
      await submission.save();
      return;
    }

    const testCases = await TestCase.find({
      problemId: submission.problemId,
    });

    if (!testCases.length) {
      submission.status = "runtime_error";
      submission.errorOutput =
        "No test cases found";
      await submission.save();
      return;
    }

    const fullCode = buildCode(
      submission.code,
      submission.language,
      problem
    );

    let passed = 0;

    let maxRuntime = 0;
    let maxMemory = 0;

    let finalOutput = "";
    let finalToken = "";

    for (const testCase of testCases) {
      const result = await executeCode(
        fullCode,
        getLanguageId(submission.language),
        testCase.input
      );

      finalToken = result.token || "";

      const statusId = result.status?.id;

      // Compile Error
      if (statusId === 6) {
        submission.status = "compile_error";

        submission.compileOutput =
          result.compile_output || "";

        submission.judge0Token = finalToken;

        await submission.save();

        return submission;
      }

      // Runtime Errors
      if (
        [7, 8, 9, 10, 11, 12, 13].includes(
          statusId
        )
      ) {
        submission.status = "runtime_error";

        submission.errorOutput =
          result.stderr ||
          result.message ||
          "Runtime Error";

        submission.judge0Token = finalToken;

        await submission.save();

        return submission;
      }

      // Time Limit Exceeded
      if (statusId === 5) {
        submission.status =
          "time_limit_exceeded";

        submission.judge0Token =
          finalToken;

        await submission.save();

        return submission;
      }

      const actualOutput =
        result.stdout?.trim() || "";

      const expectedOutput =
        testCase.output?.trim() || "";

      const isCorrect = compareOutputs(
        expectedOutput,
        actualOutput
      );

      if (isCorrect) {
        passed++;
      }

      maxRuntime = Math.max(
        maxRuntime,
        Number(result.time || 0)
      );

      maxMemory = Math.max(
        maxMemory,
        Number(result.memory || 0)
      );

      finalOutput = actualOutput;
    }

    submission.passedTestCases = passed;

    submission.totalTestCases =
      testCases.length;

    submission.runtime = maxRuntime;

    submission.executionTime =
      maxRuntime;

    submission.memory = maxMemory;

    submission.executionOutput =
      finalOutput;

    submission.judge0Token =
      finalToken;

    submission.accepted =
      passed === testCases.length;

    submission.status =
      passed === testCases.length
        ? "accepted"
        : "wrong_answer";

    await submission.save();

    return submission;
  } catch (error) {
    console.error(
      "Judge Submission Error:",
      error
    );

    await Submission.findByIdAndUpdate(
      submissionId,
      {
        status: "runtime_error",
        errorOutput:
          error.message ||
          "Internal Server Error",
      }
    );

    throw error;
  }
};