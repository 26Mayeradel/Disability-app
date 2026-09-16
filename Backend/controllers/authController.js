const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const adminModel = require("../models/adminModel");
const { COOKIE_NAME } = require("../middleware/authMiddleware");

const SALT_ROUNDS = 10;

function issueToken(admin, res) {
  const token = jwt.sign(
    { sub: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  });
}

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "يرجى إدخال اسم المستخدم وكلمة المرور" });
  }

  const admin = await adminModel.getAdmin();
  if (!admin) {
    return res.status(401).json({ message: "لا يوجد حساب مسؤول. يرجى إعداد النظام أولاً" });
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);
  if (admin.username.toLowerCase() !== String(username).toLowerCase() || !passwordMatches) {
    return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }

  issueToken(admin, res);
  res.json({ message: "تم تسجيل الدخول بنجاح" });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "تم تسجيل الخروج" });
});

const status = asyncHandler(async (req, res) => {
  res.json({ username: req.admin.username });
});

const changeCredentials = asyncHandler(async (req, res) => {
  const { currentPassword, newUsername, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: "يرجى إدخال كلمة المرور الحالية" });
  }
  if (!newUsername || !String(newUsername).trim()) {
    return res.status(400).json({ message: "يرجى إدخال اسم المستخدم الجديد" });
  }
  if (!newPassword) {
    return res.status(400).json({ message: "برجاء إدخال كلمة مرور جديدة" });
  }
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "كلمتا المرور غير متطابقتين" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل" });
  }

  const admin = await adminModel.getAdmin();
  const currentMatches = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!currentMatches) {
    return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await adminModel.updateAdmin(admin.id, String(newUsername).trim(), newHash);

  // Old sessions relied on the old username being valid; force a fresh login.
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "تم تغيير بيانات الدخول بنجاح، يرجى تسجيل الدخول مرة أخرى" });
});

module.exports = { login, logout, status, changeCredentials };
