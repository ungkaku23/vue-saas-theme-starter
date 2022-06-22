const express = require("express");
const router = express.Router();
//Import Controller
const controller = require("./auth-controller.js");

//END POINTS FOR AUTH ROUTES
//Login
router.post("/auth", controller.index);
//Forgot Password
router.put("/forgot-password", controller.forgotPassword);
//Reset Password
router.put("/reset-password", controller.resetPassword);
//Account Confirmation
router.get("/auth/email/confirm/:token", controller.confirmAccount);
//Login By Invitation
router.post("/login-invitation/:token", controller.loginInvitation);

module.exports = router;
