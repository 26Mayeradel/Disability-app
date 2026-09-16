const express = require("express");
const router = express.Router();
const beneficiaryController = require("../controllers/beneficiaryController");
const { requireAuth } = require("../middleware/authMiddleware");

router.use(requireAuth);

router.get("/departments/:departmentId/beneficiaries", beneficiaryController.getByDepartment);
router.get("/beneficiaries/:id", beneficiaryController.getById);
router.post("/beneficiaries", beneficiaryController.create);
router.put("/beneficiaries/:id", beneficiaryController.update);
router.delete("/beneficiaries/:id", beneficiaryController.remove);

module.exports = router;
