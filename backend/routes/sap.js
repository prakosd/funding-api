const express = require("express");
const SapController = require("../controllers/sap");
const router = express.Router();

// router.get("/:year/simple", SapController.getSimple);
// router.get("/:year/full", SapController.getFull);
// router.get("/:year/full/:orderNumber", SapController.getFull);
// router.get("/:year/sum", SapController.getSum);
// router.get("/:year/sum/:orderNumber", SapController.getSum);

router.get("", SapController.getFullV1);
router.get("/V1", SapController.getFullV1);
router.get("/V2", SapController.getFullV2);



module.exports = router;
