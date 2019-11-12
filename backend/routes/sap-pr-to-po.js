const express = require("express");
const SapPrToPoController = require("../controllers/sap-pr-to-po");
const extractFile = require("../middleware/file");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("", SapPrToPoController.getMany);
router.get("/:orderNumber", SapPrToPoController.getMany);
router.get("/:orderNumber/:prNumber", SapPrToPoController.getMany);
router.get("/:orderNumber/:prNumber/:poNumber", SapPrToPoController.getMany);

// router.put("/:orderNumber/:prNumber/:poNumber", checkAuth, extractFile, SapPrToPoController.upsertOne);
// router.delete("/:orderNumber/:prNumber/:poNumber", SapPrToPoController.deleteOne);

module.exports = router;
