const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message:
            "Authentication required",
        },
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: "INVALID_SESSION",
        message:
          "Session is invalid or expired",
      },
    });
  }
}

module.exports = {
  requireAuth,
};