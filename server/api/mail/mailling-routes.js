const express = require("express");
const router = express.Router();

const controller = require("./mailing-controller");

//Resend email confirmation
router.post("/auth/email/confirm/sent", controller.sentConfirmEmail);

//Opt-in Landing Page
router.post("/opt-in", controller.optIn);

module.exports = router;
