const express = require("express");
const SapController = require("../controllers/sap");
const router = express.Router();

router.get("", SapController.getManyV1);
router.get("/V1", SapController.getManyV1);

router.get("/V2", SapController.getManyV2);

module.exports = router;
