const express = require("express");
const router = express.Router();
//Import Controller
const controller = require("./account-controller");
const auth = require("../../services/auth-service");

router.get("/accounts", auth.requireLogin, controller.getAccounts);

router.get(
  "/switch-account/:tenantId/:userId",
  auth.requireLogin,
  controller.switchAccount
);

module.exports = router;
