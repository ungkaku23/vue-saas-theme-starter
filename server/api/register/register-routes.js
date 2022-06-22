const express = require("express");
const router = express.Router();
const controller = require("./register-controller");

//END POINTS FOR REGISTER ROUTES
router.post("/register/", controller.index);
router.post("/register-invitation/:token", controller.registerInvitation);

module.exports = router;
