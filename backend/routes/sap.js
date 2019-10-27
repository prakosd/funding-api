const express = require("express");
const SapEasController = require("../controllers/sap");
const router = express.Router();

router.get("", SapEasController.getMany);

module.exports = router;
