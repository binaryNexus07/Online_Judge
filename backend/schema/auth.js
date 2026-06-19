import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "Role must be either admin or user",
      },
      default: "user",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number and special character",
      ],
      select: false,
    },

    avatar: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          return (
            !value ||
            /^https?:\/\/.+/.test(value) ||
            /^\/uploads\/.+/.test(value)
          );
        },
        message: "Avatar must be a valid URL or file path",
      },
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
      default: undefined,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// =========================
// PASSWORD HASHING
// =========================

userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) {
      return;
    }

    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    console.log("Error hashing password:", error);
  }
});


// =========================
// PASSWORD COMPARISON
// =========================

userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("candidate:", candidatePassword);
  console.log("stored:", this.password);

  return bcrypt.compare(candidatePassword, this.password);
};

// =========================
// ACCOUNT LOCK CHECK
// =========================

userSchema.methods.isLocked = function () {
  return !!(
    this.lockUntil &&
    this.lockUntil.getTime() > Date.now()
  );
};


// =========================
// LOGIN ATTEMPTS
// =========================

userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 5 * 60 * 1000;

  if (
    this.lockUntil &&
    this.lockUntil.getTime() < Date.now()
  ) {
    return this.updateOne({
      $set: {
        loginAttempts: 1,
      },
      $unset: {
        lockUntil: 1,
      },
    });
  }

  const updates = {
    $inc: {
      loginAttempts: 1,
    },
  };

  if (
    this.loginAttempts + 1 >= MAX_ATTEMPTS &&
    !this.isLocked()
  ) {
    updates.$set = {
      lockUntil: new Date(Date.now() + LOCK_TIME),
    };
  }

  return this.updateOne(updates);
};


// =========================
// RESET LOGIN ATTEMPTS
// =========================

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: {
      loginAttempts: 0,
    },
    $unset: {
      lockUntil: 1,
    },
  });
};


// =========================
// PUBLIC PROFILE
// =========================

userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();

  delete user.password;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.loginAttempts;
  delete user.lockUntil;

  return user;
};


// =========================
// INDEXES
// =========================

userSchema.index({ role: 1 });

export const User = mongoose.model(
  "User",
  userSchema
);