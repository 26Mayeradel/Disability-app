const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/logout", requireAuth, authController.logout);
router.get("/status", requireAuth, authController.status);
router.post("/change-credentials", requireAuth, authController.changeCredentials);

module.exports = router;
