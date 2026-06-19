import { z } from "zod";
import { ObjectIdSchema } from "./objectId.js";

export const createSubmissionSchema = z.object({

    problemId: ObjectIdSchema,

    code: z
        .string()
        .trim()
        .min(1, "Code cannot be empty"),

    language: z.enum([
        "cpp",
        "java",
        "javascript",
        "python"
    ])

});

export const submissionIdSchema = z.object({
    id: ObjectIdSchema
});

export const getMySubmissionsQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform(val => Number(val) || 1),

    limit: z
        .string()
        .optional()
        .transform(val => Math.min(Number(val) || 20, 100))
});

