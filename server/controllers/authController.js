const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

function createToken(userId) {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

function setAuthCookie(res, token) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res) {
  try {

    console.log("BODY:", req.body);
    console.log("CONTENT TYPE:", req.headers["content-type"]);

    const {
      name,
      email,
      password,
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message:
            "name, email and password are required",
        },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: {
          code: "WEAK_PASSWORD",
          message:
            "Password must contain at least 8 characters",
        },
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: "EMAIL_EXISTS",
          message:
            "An account with this email already exists",
        },
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = createToken(user._id.toString());

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      error: {
        code: "REGISTER_FAILED",
        message: "Registration failed",
      },
    });
  }
}

async function login(req, res) {
  try {
    const {
      email,
      password,
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Email and password are required",
        },
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            "Invalid email or password",
        },
      });
    }

    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordValid) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            "Invalid email or password",
        },
      });
    }

    const token =
      createToken(user._id.toString());

    setAuthCookie(res, token);

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: {
        code: "LOGIN_FAILED",
        message: "Login failed",
      },
    });
  }
}

async function logout(req, res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
}

async function me(req, res) {
  try {
    const user =
      await User.findById(
        req.user.userId
      ).select(
        "_id name email createdAt"
      );

    if (!user) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Me error:", error);

    return res.status(500).json({
      error: {
        code: "USER_FETCH_FAILED",
        message: "Unable to fetch user",
      },
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
};