import jwt from "jsonwebtoken";
import { User } from "../schema/auth.js";

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (
        req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : null
      );

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(decoded.userId)
      .select("+lockUntil +passwordChangedAt");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    if (user.isLocked()) {
      return res.status(403).json({
        success: false,
        message:
          "Account temporarily locked due to multiple failed login attempts",
      });
    }

    /*
      Token invalid after password change
    */
    if (
      user.passwordChangedAt &&
      decoded.iat
    ) {
      const passwordChangedTime =
        Math.floor(
          new Date(user.passwordChangedAt).getTime() /
          1000
        );

      if (passwordChangedTime > decoded.iat) {
        return res.status(401).json({
          success: false,
          message:
            "Password changed recently. Please login again.",
        });
      }
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error("Authentication Error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};


export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization Error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};