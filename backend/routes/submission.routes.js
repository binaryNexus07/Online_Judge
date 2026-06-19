import express from "express";

import {submitCode,getSubmissionById,getMySubmissions} from "../controllers/submission.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {createSubmissionSchema,submissionIdSchema,getMySubmissionsQuerySchema } from "../validation/submission.validate.js";
import { validate } from "../middleware/validate.middleware.js";

const router=express.Router();

router.post("/submit",authenticate,validate(createSubmissionSchema),submitCode);
router.get("/my-submissions",authenticate,validate(getMySubmissionsQuerySchema,"query"),getMySubmissions);
router.get("/:id",authenticate,validate(submissionIdSchema,"params"),getSubmissionById);


export default router;