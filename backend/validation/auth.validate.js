import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


// =========================
// REGISTER
// =========================

export const registerSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .regex(
      passwordRegex,
      "Password must contain uppercase, lowercase, number and special character"
    ),
});


// =========================
// LOGIN
// =========================

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .optional(),

    userName: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username cannot exceed 50 characters")
      .optional(),

    password: z
      .string()
      .trim()
      .min(1, "Password is required"),
  })
  .refine(
    (data) => data.email || data.userName,
    {
      message: "Provide email or username",
      path: ["email"],
    }
  )
  .refine(
    (data) => !(data.email && data.userName),
    {
      message:
        "Provide either email or username, not both",
      path: ["email"],
    }
  );


// =========================
// CREATE ADMIN
// =========================

export const createAdminSchema = registerSchema;


// =========================
// FORGOT PASSWORD
// =========================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
});


// =========================
// RESET PASSWORD
// =========================

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number and special character"
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );


// =========================
// UPDATE USER
// =========================

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .optional(),

    currentPassword: z
      .string()
      .min(1)
      .optional(),

    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number and special character"
      )
      .optional(),
  })
  .refine(
    (data) =>
      !(data.newPassword && !data.currentPassword),
    {
      message:
        "Current password is required to change password",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one field must be provided",
    }
  );


// =========================
// OBJECT ID
// =========================

export const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId"
  );


// =========================
// USER PARAMS
// =========================

export const userIdParamSchema = z.object({
  id: objectIdSchema,
});


// =========================
// EMAIL VERIFY
// =========================

export const verifyTokenSchema = z.object({
  verificationToken: z
    .string()
    .trim()
    .min(1, "Verification token is required"),
});


// =========================
// RESET TOKEN PARAMS
// =========================

export const resetTokenParamSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Reset token is required"),
});