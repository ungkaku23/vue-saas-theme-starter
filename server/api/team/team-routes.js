const express = require("express");
const router = express.Router();
//Import Controller
const controller = require("./team-controller");
const auth = require("../../services/auth-service");
//const role = require("../../security/roles");
const grantAccess = require("../../security/grantAccess");
//CHECK EMAIL IF EXIST ASYNCROUNYSLY FROM REGISTER FORM
router.post("/user/checkemail/", controller.checkemail);
//END POINTS FOR AUTH ROUTES
//Get member
router.get(
  "/member/:id",
  auth.requireLogin,
  grantAccess.grantView,
  controller.index
);
//Edit member
router.put(
  "/member/:id",
  auth.requireLogin,
  grantAccess.grantUpdate,
  controller.editMemberInfo
);
//Delete member
router.delete(
  "/member/:id",
  auth.requireLogin,
  grantAccess.grantDelete,
  controller.deleteMember
);
//Get all members
router.get(
  "/members",
  auth.requireLogin,
  /* grantAccess.grantRole([role.OWNER, role.ADMIN]), */
  controller.getMembers
);
module.exports = router;
