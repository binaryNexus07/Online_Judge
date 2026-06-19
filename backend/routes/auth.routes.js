import express from "express";
import {
    registerController,
    login,
    logout,
    getUser,
    verifyUser,
    forgatPassword,
    resetPassword,
    updateUser,
    createAdmin,
    deactivateAdmin,
    activateAdmin
} from "../controllers/auth.controllers.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateUserSchema, createAdminSchema, objectIdSchema, userIdParamSchema, verifyTokenSchema, resetTokenParamSchema   } from "../validation/auth.validate.js";
const router = express.Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/verify/:verificationToken", validate(verifyTokenSchema,"params"), verifyUser);
router.post("/forgot-password", validate(forgotPasswordSchema), forgatPassword);
router.post(
    "/reset-password/:token",
    validate(resetTokenParamSchema, "params"),
    validate(resetPasswordSchema, "body"),
    resetPassword
);
router.get("/reset-password/:token", validate(resetTokenParamSchema,"params"), (req, res) => {

    const { token } = req.params;

    res.send(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Reset Password</title>

            <style>

                body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }

                .form-group { margin-bottom: 15px; }

                label { display: block; margin-bottom: 5px; }

                input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }

                button { background: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }

                button:hover { background: #0056b3; }

            </style>

        </head>

        <body>

            <h2>Reset Password</h2>

            <form action="/api/v1/auth/reset-password/${token}" method="POST">

                <div class="form-group">

                    <label for="password">New Password:</label>

                    <input type="password" id="password" name="password" required minlength="6">

                </div>

                <div class="form-group">

                    <label for="confirmPassword">Confirm Password:</label>

                    <input type="password" id="confirmPassword" name="confirmPassword" required>

                </div>

                <button type="submit">Reset Password</button>

            </form>

        </body>

        </html>

    `);

});


router.get("/user",authenticate, getUser);
router.put("/user",authenticate,validate(updateUserSchema), updateUser);
router.post("/admin",authenticate,authorize("admin"), validate(createAdminSchema), createAdmin);
router.patch(
    "/admin/deactivate/:id",
    authenticate,
    authorize("admin"),
    validate(userIdParamSchema, "params"),
    deactivateAdmin
);
router.patch(
    "/admin/activate/:id",
    authenticate,
    authorize("admin"),
    validate(userIdParamSchema, "params"),
    activateAdmin
);



export default router;
