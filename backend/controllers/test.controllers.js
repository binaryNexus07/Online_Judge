import { Problem } from "../schema/problem.js";
import { TestCase } from "../schema/testcase.js";
import { sendSuccess,sendError } from "../utils/response.js";
export const createTestCase = async (req, res) => {
    try {
        const { problemId } = req.validated.params;
        const { input, output, explanation, isHidden } = req.validated.body;
        const problem=await Problem.findById(problemId);
        if(!problem){
            return sendError(res,404,"problem not found");
        }
        const testCase = new TestCase({
            problemId,
            input,
            output,
            explanation,
            isHidden
        });
        await testCase.save();

     return sendSuccess(
    res,
    201,
    "Test case created successfully",
    testCase
);
    } catch (error) {
        console.error(error);
        sendError(res,500,"error creating test")
    }
};


export const getTestCases = async (req, res) => {
    try {
        const { problemId } = req.validated.params;
        const problem = await Problem.findById(
            problemId
        );

        if (!problem) {
            return sendError(
                res,
                404,
                "Problem not found"
            );
        }
        const testCases = await TestCase.find({
            problemId
        });
        return sendSuccess(
            res,
            200,
            "Test cases retrieved successfully",
            testCases
        );

    } catch (error) {
        console.error(error);
        return sendError(
            res,
            500,
            "Error retrieving test cases"
        );
    }
};

export const updateTestCase = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const updatedTestCase =
            await TestCase.findByIdAndUpdate(
                id,
                req.validated.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedTestCase) {
            return sendError(
                res,
                404,
                "Test case not found"
            );
        }
        return sendSuccess(
            res,
            200,
            "Test case updated successfully",
            updatedTestCase
        );

    } catch (error) {
        console.error(
            "Error updating test case:",
            error
        );
        return sendError(
            res,
            500,
            "Internal server error"
        );
    }
};

export const deleteTestcase=async(req,res)=>{
    try{
        const {id}=req.validated.params;
        const deletedTestCase = await TestCase.findByIdAndDelete(id);
        if (!deletedTestCase) {
            return sendError(
                res,
                404,
                "Test case not found"
            );
        }
        return sendSuccess(
            res,
            200,
            "Test case deleted successfully",
            deletedTestCase
        );
    }catch(error){
         console.error(
            "Error deleting test case:",
            error
        );
        return sendError(
            res,
            500,
            "Internal server error"
        );

    }
}