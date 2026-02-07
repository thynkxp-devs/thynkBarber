const { asyncHandler } = require("../utils/asyncHandler");
const { requireFields } = require("../utils/validators");
const { loginWithUsernamePassword } = require("../services/adminService");

const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ["username", "password"]);
  const { username, password } = req.body;

  const admin = await loginWithUsernamePassword(username, password);

  req.session.adminId = admin._id.toString();
  req.session.adminUsername = admin.username;

  res.json({ ok: true, redirectTo: "/dashboard.html" });
});

const me = asyncHandler(async (req, res) => {
  if (!req.session?.adminId) return res.status(401).json({ ok: false });
  res.json({ ok: true, username: req.session.adminUsername || "admin" });
});

const logout = asyncHandler(async (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, redirectTo: "/login.html" });
  });
});

module.exports = { login, me, logout };
