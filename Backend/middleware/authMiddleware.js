const jwt = require("jsonwebtoken");

const COOKIE_NAME = "dbs_auth";

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "غير مصرح بالدخول، يرجى تسجيل الدخول" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: "انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى" });
  }
}

module.exports = { requireAuth, COOKIE_NAME };
