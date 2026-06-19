import { z } from "zod";
import { ObjectIdSchema } from "./objectId.js";

export const createTestCaseSchema = z.object({
    input:z
    .string()
    .trim()
    .min(1, "Input cannot be empty"),

    output:z
    .string()
    .trim()
    .min(1, "Output cannot be empty"),

    explanation:z
    .string()
    .trim()
    .optional(),
    
    isHidden:z
    .boolean()
    .optional()
    .default(false),
});

export const updateTestCaseSchema = z.object({

    input:z
    .string()
    .trim()
    .optional(),
    output:z
    .string()
    .trim()
    .optional(),
    explanation:z
    .string()
    .trim()
    .optional(),
    isHidden:z
    .boolean()
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

export const getTestCasesSchema = z.object({
    problemId: ObjectIdSchema,
});

export const testCaseIdSchema = z.object({
    id: ObjectIdSchema
});
export const deleteTestCaseSchema = z.object({
    id: ObjectIdSchema,
});



