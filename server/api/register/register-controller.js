const StringUtil = require("../../utilities/string-util");
const User = require("../../model/User");
const Account = require("../../model/Account");
const Invitation = require("../../model/Invitation");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const { generateSession } = require("../../services/auth-service");
const mail = require("../../services/mail-service");
// Register
module.exports.index = async function(req, res) {
  const validation = validateIndex(req.body);
  //No Valid Request
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }
  const user = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
  });
  await user.save(async (error, user) => {
    if (error) {
      if (error.code === 11000) {
        return res.status(403).json({ message: "Username is already taken" });
      }
      return res.status(500).json({ message: error.message });
    }
    const customer = await stripe.customers.create({
      email: req.body.email,
    });
    const account = new Account({
      name: `${user.username}'s Account`,
      customer_id: customer.id,
      membership: [{ access: "owner", user: user._id }],
    });
    account.save(async (error, account) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      }
      const update = {
        $set: { ownedAccount: account._id },
        $push: { accounts: account._id },
      };
      User.findOneAndUpdate({ _id: user._id }, update, { new: true }).exec(
        async function(err, user) {
          //Get Current Membership From SubDocuments Array
          let membership = account.membership.find(
            (obj) => obj.user == user._id.toString()
          );
          //Send Email Verification
          const emailConfirmation = mail.confirmEmail(
            user,
            membership,
            account
          );
          await mail.mg
            .messages()
            .send(emailConfirmation, function(error, body) {
              console.log(body);
              if (error) {
                console.log(error.message);
              } else {
                console.log("Email confirmation sent!");
              }
            });
          const payload = generateSession(
            user,
            process.env.TOKEN_SECRET,
            membership,
            account
          );
          return res.status(200).json({ user: payload });
        }
      );
    });
  });
};
/* Register by invitation */
module.exports.registerInvitation = async function(req, res) {
  const invitation = await Invitation.findOne(
    { token: req.params.token },
    (error, invite) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
      }
      if (!invite) {
        return res
          .status(404)
          .json({ message: "Your Invitation Has Been Expired! ⌛" });
      }
    }
  );
  const validation = validateIndex(req.body);
  //No Valid Request
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }
  const user = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    confirmed: true,
    accounts: invitation.account,
  });
  await user.save(async (error, user) => {
    if (error) {
      // Mongoose Error Code 11000 means validation failure (username taken)
      if (error.code === 11000) {
        return res.status(403).json({ message: "Username is already taken" });
      }
      return res.status(500).json({ message: error.message });
    }
    //Adjust function to create Own Account on creation if you want
    /* const customer = await stripe.customers.create({
      email: req.body.email,
    });
    const ownAccount = new Account({
      name: `${user.username}'s Team`,
      customer_id: customer.id,
      membership: [{ access: "owner", user: user._id }],
    });
    ownAccount.save(async (error, ownAccount) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      }
      console.log("ownAccount", ownAccount);
    }); */
    //Push New Member into Invited Account
    Account.findOneAndUpdate(
      { _id: invitation.account },
      {
        $push: { membership: { access: invitation.role, user: user._id } },
      },
      { new: true }
    ).exec(function(err, account) {
      //Delete Invitation
      if (!err) {
        Invitation.findOneAndRemove({ token: req.params.token }, (err) => {
          if (!err) console.log("Invitation deleted");
        });
      }
      //Get Current Membership From SubDocuments Array
      let membership = account.membership.find(
        (obj) => obj.user == user._id.toString()
      );
      //Gen & sent token
      const payload = generateSession(
        user,
        process.env.TOKEN_SECRET,
        membership,
        account
      );
      return res.status(200).json({ user: payload });
    });
  });
};
//Validate Request From FrontEnd (Username & Password)
function validateIndex(body) {
  let errors = "";
  if (StringUtil.isEmpty(body.email)) {
    errors += "Email is required.";
  }
  if (StringUtil.isEmpty(body.password)) {
    errors += "Password is required.";
  }
  if (StringUtil.isEmpty(body.username)) {
    errors += "Username is required.";
  }
  //I return An Object
  return {
    isValid: StringUtil.isEmpty(errors),
    message: errors,
  };
}
