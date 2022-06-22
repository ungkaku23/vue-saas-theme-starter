const User = require("../../model/User");
const Account = require("../../model/Account");
const _ = require("lodash");
const sharp = require("sharp");
const fs = require("fs");
const { generateSession } = require("../../services/auth-service");
const auth = require("../../services/auth-service");
const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
//Edit User Info
module.exports.updateUserInfo = async function(req, res) {
  var updateBlock = {};
  if (req.file) {
    const s3 = new aws.S3();
    try {
      const buffer = await sharp(req.file.path)
        .resize(300)
        //.toFile(`./static/${fileName}`);
        .toBuffer();

      const s3res = await s3
        .upload({
          Bucket: "boostack",
          Key: `${auth.getUserId(req)}.${req.file.mimetype.substr(
            req.file.mimetype.indexOf("/") + 1
          )}`,
          Body: buffer,
          ACL: "public-read",
        })
        .promise();
      console.log("s3res", s3res);
      await fs.unlink(req.file.path, function(err) {
        if (err) return console.log(err);
      });
      updateBlock.email = req.body.email;
      updateBlock.username = req.body.username;
      updateBlock.imgPath = s3res.Location;
    } catch (error) {
      return res.status(422).json({ message: error.message });
    }
  } else {
    updateBlock.email = req.body.email;
    updateBlock.username = req.body.username;
  }
  const account = await Account.findOne(
    { _id: auth.getAccountId(req) },
    (error, account) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      }
      if (!account) {
        return res.status(404).json({ message: "Account Not Found" });
      }
    }
  );
  User.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: updateBlock },
    { new: true }
  ).exec(function(error, user) {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    //if has account update name
    if (user.ownedAccount) {
      Account.findByIdAndUpdate(
        { _id: user.ownedAccount },
        { $set: { name: `${user.username}'s Account` } },
        { new: true }
      ).exec(function(error, ownedAccount) {
        if (error) {
          //return res.status(500).json({ message: error.message });
          console.log(error.message);
        }
        if (!ownedAccount) {
          console.log("Dont have an account");
        }
      });
    }
    //Get Current Membership From SubDocument Array
    let membership = account.membership.find(
      (obj) => obj.user == user._id.toString()
    );
    const payload = generateSession(
      user,
      process.env.TOKEN_SECRET,
      membership,
      account
    );
    return res
      .status(200)
      .json({ user: payload, message: "The Profile has been updated" });
  });
};
//Update User Password
module.exports.updateUserPassword = function(req, res) {
  const { oldPass, newPass } = req.body;
  User.findOne({ _id: req.params.id }, (error, user) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    const passwordsMatch = User.passwordMatches(oldPass, user.password);
    if (!passwordsMatch) {
      return res.status(401).json({
        message: "Wrong password. Please enter the correct password.",
      });
    }
    const obj = {
      password: newPass,
    };
    user = _.extend(user, obj);
    user.save((err) => {
      if (err) {
        return res.status(400).json({ message: "Update password error" });
      } else {
        return res.status(200).json({
          message: "Your Password has been changed.",
        });
      }
    });
  });
};
