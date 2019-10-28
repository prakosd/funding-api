const express = require("express");
const SapController = require("../controllers/sap");
// const extractFile = require("../middleware/file");
// const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("", SapController.getMany);
module.exports = router;
