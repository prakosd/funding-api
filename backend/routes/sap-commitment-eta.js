const express = require("express");
const SapCommitmentEtaController = require("../controllers/sap-commitment-eta");
const extractFile = require("../middleware/file");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("", SapCommitmentEtaController.getMany);
router.get("/:orderNumber", SapCommitmentEtaController.getMany);
router.get("/:orderNumber/:documentNumber", SapCommitmentEtaController.getMany);

router.put("/:orderNumber/:documentNumber/:etaDate", checkAuth, extractFile, SapCommitmentEtaController.upsertOne);
router.delete("/:orderNumber/:documentNumber", SapCommitmentEtaController.deleteOne);

module.exports = router;
