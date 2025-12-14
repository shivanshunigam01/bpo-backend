const { verifyToken } = require("../helpers/jwt");

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing Authorization Bearer token" });
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/Expired token" });
  }
}

module.exports = auth;
