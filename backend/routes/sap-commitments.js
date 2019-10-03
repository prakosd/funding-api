const express = require("express");
const SapCommitmentsController = require("../controllers/sap-commitments");
const extractFile = require("../middleware/file");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("", SapCommitmentsController.getMany);

router.get("/:id", SapCommitmentsController.getOne);

router.post("", checkAuth, extractFile, SapCommitmentsController.createOne);

router.put("/:id", checkAuth, extractFile, SapCommitmentsController.updateOne);

router.put("", checkAuth, extractFile, SapCommitmentsController.updateOne);

router.patch("/:id", checkAuth, extractFile, SapCommitmentsController.patchOne);

router.delete("/:id", SapCommitmentsController.deleteOne);

router.delete("", SapCommitmentsController.deleteMany);

// router.post("", checkAuth, extractFile, PostController.createPost);

// router.put("/:id", checkAuth, extractFile, PostController.updatePost);

// router.get("", PostController.getPosts);

// router.get("/:id", PostController.getPost);

// router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
