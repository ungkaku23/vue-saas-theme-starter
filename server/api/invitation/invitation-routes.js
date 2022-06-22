const express = require("express");
const router = express.Router();
//Import Controller
const controller = require("./invitation-controller");

//END POINTS FOR INVITATION WORKFLOW
router.post("/invite", controller.sentInvitation);

router.post("/invitation/:token", controller.index);

router.get("/checkstate/:token", controller.invitationState);

module.exports = router;
