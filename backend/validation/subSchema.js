
import { z } from "zod";

export const exampleSchema = z.object({
    input: z.string().trim().min(1),
    output: z.string().trim().min(1),
    explanation: z.string().trim().min(1)
});

export const codeTemplateSchema = z.object({
    language: z.string().trim().min(1),
    starterCode: z.string().trim().min(1)
});

export const solutionSchema = z.object({
    language: z.string().trim().min(1),
    solution: z.string().trim().min(1)
});