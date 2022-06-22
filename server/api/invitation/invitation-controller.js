const Invitation = require("../../model/Invitation");
const User = require("../../model/User");
const Account = require("../../model/Account");
//const Membership = require("../../model/_membership");
const { v4: uuidv4 } = require("uuid");
const mail = require("../../services/mail-service");
//const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const { generateSession } = require("../../services/auth-service");
const auth = require("../../services/auth-service");

//Send Invitation to join team
module.exports.sentInvitation = async function(req, res) {
  const requesterEmail = auth.getEmail(req);
  if (requesterEmail == req.body.info.email) {
    return res.status(409).json({
      message: "Member with this email already exists in this account",
    });
  }
  const customerId = auth.getCustomerId(req);
  const email = req.body.info.email;
  const role = req.body.info.role;
  const senderName = req.body.info.nameSender;
  const receiverName = req.body.info.nameReceiver;
  const genToken = uuidv4();
  const account = await Account.findOne({
    customer_id: customerId,
  });
  const inviteToken = new Invitation({
    email: email,
    role: role,
    username: receiverName,
    token: genToken,
    account: account._id,
    invitedBy: senderName,
    team: account.name,
  });
  await inviteToken.save(async (error) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    //Send Email Invitation
    const emailInvitation = mail.inviteEmail(
      email,
      senderName,
      receiverName,
      genToken
    );
    await mail.mg.messages().send(emailInvitation, function(error, body) {
      console.log(body);
      if (error) {
        return res.status(405).json({
          message: error.message,
        });
      } else {
        console.log("Email Invitation Sent!");
        return res
          .status(201)
          .json({ message: "The Invitation Has Been Sent" });
      }
    });
  });
};
// Join Current Logged-in User
module.exports.index = async function(req, res) {
  //const userId = auth.getUserId(req);
  const invitation = await Invitation.findOne(
    { token: req.params.token },
    (error, invitation) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      }
      if (!invitation) {
        return res.status(401).json({
          message: "Your Invitation Has Been Expired! ⌛",
        });
      }
    }
  );
  User.findOne({ email: req.body.info.email }, (err, checkUser) => {
    if (err) {
      console.log(err.message);
    }
    if (checkUser) {
      /* Check if a duplicated member */
      let dupAccount = checkUser.accounts.find(
        (obj) => obj == invitation.account.toString()
      );
      if (dupAccount) {
        return res.status(409).json({
          message: "This is already a member of this account",
        });
      } else {
        User.findOneAndUpdate(
          { email: req.body.info.email },
          {
            $push: { accounts: invitation.account },
          },
          { new: true }
        ).exec(function(err, user) {
          if (err) {
            console.log(err);
          }
          Account.findOneAndUpdate(
            { _id: invitation.account },
            {
              $push: {
                membership: { access: invitation.role, user: user._id },
              },
            },
            { new: true }
          ).exec(function(err, account) {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: err.message });
            }
            if (!account) {
              return res.status(401).json({
                message: "Account Not Found",
              });
            }
            //Delete Invitation
            if (!err) {
              Invitation.findOneAndRemove(
                { token: req.params.token },
                (err) => {
                  if (!err) console.log("Invitation deleted");
                }
              );
            }
            //Get Current Membership From SubDocuments Array
            let membership = account.membership.find(
              (obj) => obj.user == user._id.toString()
            );
            const payload = generateSession(
              user,
              process.env.TOKEN_SECRET,
              membership,
              account
            );
            return res.status(200).json({ user: payload });
          });
        });
      }
    } else {
      return res.status(401).json({
        message: "User Not Found",
      });
    }
  });
};
// Check Invitation State And Send Information
module.exports.invitationState = function(req, res) {
  Invitation.findOne({ token: req.params.token }, (error, invitation) => {
    if (error) {
      return res.status(500).json();
    }
    if (!invitation) {
      return res.status(401).json({
        message: "Your Invitation Has Been Expired! ⌛",
      });
    }
    return res.status(200).json({ invitation: invitation });
  });
};
