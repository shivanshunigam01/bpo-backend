const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/call.controller");

router.post("/start", auth, ctrl.start);
router.post("/hangup", auth, ctrl.hangup);
router.get("/status/:callId", auth, ctrl.status);

module.exports = router;
