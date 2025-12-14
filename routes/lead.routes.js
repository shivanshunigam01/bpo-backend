const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/lead.controller");

router.get("/", auth, ctrl.list);
router.post("/", auth, ctrl.create);
router.get("/:id", auth, ctrl.get);
router.patch("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

router.post("/import/file", auth, upload.single("file"), ctrl.importFile);
router.get("/export/file", auth, ctrl.exportFile);

module.exports = router;
