const express = require("express");
const multer = require("multer");
const router = express.Router();
//Filter to upload images
//const fileFilter = require("../../utilities/fileFilter-util").imagesFilter;

//Import Controller
const controller = require("./user-controller");
const auth = require("../../services/auth-service");

const MAX_SIZE = 200000;
const upload = multer({
  dest: "./uploads/",
  /* fileFilter, */
  limits: {
    fileSize: MAX_SIZE,
  },
});
//Optionnal function to Check conditions to upload images (you have same function in front-end)
/* router.use(function(req, res, next, err) {
  if (err.code === "LIMIT_FILE_TYPES") {
    res.status(422).json({ message: "Only images are allowed" });
    return;
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    res 
      .status(422)
      .json({ message: `Too large. Max size is ${MAX_SIZE / 1000}KB` });
    return;
  }
  next();
}); */
router.put(
  "/user/:id",
  auth.requireLogin,
  upload.single("file"),
  controller.updateUserInfo
);
//Update User Password
router.put(
  "/user-password/:id",
  auth.requireLogin,
  controller.updateUserPassword
);

module.exports = router;
