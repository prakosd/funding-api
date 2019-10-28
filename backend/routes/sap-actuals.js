const express = require("express");
const SapActualsController = require("../controllers/sap-actuals");
const extractFile = require("../middleware/file");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("", SapActualsController.getMany);

router.get("/:id", SapActualsController.getOne);

router.post("", checkAuth, extractFile, SapActualsController.createOne);

router.put("/:id", checkAuth, extractFile, SapActualsController.upsertOne);

router.put("", checkAuth, extractFile, SapActualsController.upsertOne);

router.patch("/:id", checkAuth, extractFile, SapActualsController.patchOne);

router.delete("/:id", SapActualsController.deleteOne);

router.delete("", SapActualsController.deleteMany);

// router.post("", checkAuth, extractFile, PostController.createPost);

// router.put("/:id", checkAuth, extractFile, PostController.updatePost);

// router.get("", PostController.getPosts);

// router.get("/:id", PostController.getPost);

// router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
