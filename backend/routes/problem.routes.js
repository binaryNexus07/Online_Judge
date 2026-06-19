import express from "express";
import { createProblem, getAllProblem,getProblemBySlug,updateProblem,deleteProblem } from "../controllers/problem.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import {createProblemSchema, problemIdSchema,updateProblemSchema,slugSchema, getAllProblemQuerySchema } from "../validation/problem.validate.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/create", authenticate, authorize("admin"), validate(createProblemSchema), createProblem);
router.get("/all", validate(getAllProblemQuerySchema,"query"), getAllProblem);
router.get("/:slug", validate(slugSchema,"params"), getProblemBySlug);
router.patch(
    "/:id",
    authenticate,
    authorize("admin"),
    validate(problemIdSchema, "params"),
    validate(updateProblemSchema, "body"),
    updateProblem
);
router.delete("/:id", authenticate, authorize("admin"), validate(problemIdSchema,"params"), deleteProblem);

export default router;