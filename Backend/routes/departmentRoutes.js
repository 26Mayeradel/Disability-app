const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { requireAuth } = require("../middleware/authMiddleware");

router.use(requireAuth);

router.get("/departments", departmentController.getAll);
router.get("/departments/:id", departmentController.getById);
router.get("/dashboard", departmentController.getDashboard);

module.exports = router;
