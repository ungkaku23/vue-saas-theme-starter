const auth = require("../../services/auth-service");
const User = require("../../model/User");
const Account = require("../../model/Account");
const mail = require("../../services/mail-service");
const Leads = require("../../model/Leads");
//Resent Email Confirmation
module.exports.sentConfirmEmail = async function(req, res) {
  const userId = auth.getUserId(req);
  const user = await User.findOne({ _id: userId }, (err, user) => {
    if (!user) {
      return res.status(404).json({
        message:
          "User with this email does not exists. Please create your account.",
      });
    }
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
  const account = await Account.findOne(
    { _id: auth.getAccountId(req) },
    (error, account) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      }
      if (!account) {
        return;
      }
    }
  );
  //Get Current Membership From SubDocuments Array
  let membership = account.membership.find(
    (obj) => obj.user == user._id.toString()
  );
  //Email Verification
  const emailConfirmation = mail.confirmEmail(user, membership, account);
  await mail.mg.messages().send(emailConfirmation, function(error, body) {
    console.log(body);
    if (error) {
      return res.status(405).json({
        message: error.message,
      });
    } else {
      return res.status(200).json({
        message: "Confirmation email has been sent, please check your inbox",
      });
    }
  });
};
//Landing page subscribtion leads
module.exports.optIn = async function(req, res) {
  const optIn = new Leads({
    email: req.body.email,
  });
  await optIn.save(async (error) => {
    if (error) {
      // Mongoose Error Code 11000 means validation failure (username taken)
      if (error.code === 11000) {
        return res.status(403).json({
          message: `${req.body.email}is already subscribed to boostack list`,
        });
      }
      return res.status(500).json({ message: error.message });
    }
    return res.status(200).json({ message: "Thank you for subscribing!" });
  });
};
