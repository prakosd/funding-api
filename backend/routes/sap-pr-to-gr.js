const express = require("express");
const SapPrToGrController = require("../controllers/sap-pr-to-gr");
const extractFile = require("../middleware/file");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("", SapPrToGrController.getMany);
router.get("/:orderNumber", SapPrToGrController.getMany);
router.get("/:orderNumber/:prNumber", SapPrToGrController.getMany);
router.get("/:orderNumber/:prNumber/:grNumber", SapPrToGrController.getMany);

router.put("/:orderNumber/:prNumber/:grNumber", checkAuth, extractFile, SapPrToGrController.upsertOne);
router.delete("/:orderNumber/:prNumber/:grNumber", SapPrToGrController.deleteOne);

module.exports = router;
