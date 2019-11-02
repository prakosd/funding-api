const express = require("express");
const SapController = require("../controllers/sap");
const router = express.Router();

router.get("", SapController.getMany);

module.exports = router;
