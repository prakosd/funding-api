const express = require("express");
const SapEasController = require("../controllers/sap-eas");
const extractFile = require("../middleware/file");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("", SapEasController.getMany);

router.get("/:id", SapEasController.getOne);

router.post("", checkAuth, extractFile, SapEasController.createOne);

router.put("/:id", checkAuth, extractFile, SapEasController.upsertOne);

router.put("", checkAuth, extractFile, SapEasController.upsertOne);

router.patch("/:id", checkAuth, extractFile, SapEasController.patchOne);

router.delete("/:id", SapEasController.deleteOne);

router.delete("", SapEasController.deleteMany);

// router.post("", checkAuth, extractFile, PostController.createPost);

// router.put("/:id", checkAuth, extractFile, PostController.updatePost);

// router.get("", PostController.getPosts);

// router.get("/:id", PostController.getPost);

// router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
