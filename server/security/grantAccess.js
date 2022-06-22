const permission = require("../security/permissions");

//Permission by ROLES
function grantRole(role) {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.status(401).json({
        message: "Not Allowed To Access!",
      });
    }
    next();
  };
}

function grantView(req, res, next) {
  /* console.log("Requester:", req.user, "REQUEST:", req.params); */
  if (!permission.canView(req.user, req.params)) {
    return res.status(401).json({
      message: "You don't have enough permission to perform this action",
    });
  }
  next();
}

function grantUpdate(req, res, next) {
  if (permission.updateOwn(req.user, req.body.info)) {
    return res.status(409).json({
      message: "Can't update your own profile!",
    });
  }
  if (!permission.canUpdate(req.user, req.body.info)) {
    return res.status(401).json({
      message: "You don't have enough permission to perform this action",
    });
  }
  next();
}

function grantDelete(req, res, next) {
  if (permission.deleteOwn(req.user, req.params)) {
    return res.status(409).json({
      message: "Can't delete your own profile!",
    });
  }
  if (!permission.canDelete(req.user, req.params)) {
    return res.status(401).json({
      message: "You don't have enough permission to perform this action",
    });
  }
  next();
}

module.exports = {
  grantView,
  grantUpdate,
  grantDelete,
  grantRole,
};
