//Import dotenv Module
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const { generateJWT } = require("../services/auth-service");
//const jwt = require("jsonwebtoken");
//MAILGUN
const mailgun = require("mailgun-js");
const DOMAIN = process.env.MAILGUN_DOMAIN;
module.exports.mg = mailgun({
  apiKey: process.env.API_KEY_MAILGUN,
  domain: DOMAIN,
  from_who: process.env.FROM_WHO,
});
//RESET PASSWORD TEMPLATE
function resetPassword(user, token) {
  const filePath = path.join(
    __dirname,
    "../../public/emails/forgot-password.html"
  );
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const resetUrl = `${process.env.CLIENT_URL}/auth/resetpassword/${token}`;
  const replacements = {
    urlReset: resetUrl,
  };
  const htmlToSend = template(replacements);
  const data = {
    from: process.env.FROM_WHO_MAIL,
    to: user.email,
    subject: `Hi ${user.username}, [BOOSTACK] Please reset your password.`,
    html: htmlToSend,
  };
  return data;
}
module.exports.resetPassword = resetPassword;
//EMAIL CONFIRMATION TEMPLATE
function confirmEmail(user, membership, account) {
  const token = generateJWT(
    user,
    process.env.TOKEN_SECRET,
    membership,
    account,
    { expiresIn: "3d" }
  );
  /* const token = jwt.sign({ user: user }, process.env.TOKEN_SECRET, {
    expiresIn: "3d",
  }); */
  const filePath = path.join(
    __dirname,
    "../../public/emails/email-confirmation.html"
  );
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const confirmationUrl = `${process.env.CLIENT_URL}/auth/emailconfirmation/${token}`;
  const replacements = {
    urlConfirmation: confirmationUrl,
  };
  const htmlToSend = template(replacements);
  const data = {
    from: process.env.FROM_WHO_MAIL,
    to: user.email,
    subject: `Hi ${user.username}, Please Verify Your [Boostack] Account`,
    html: htmlToSend,
  };
  return data;
}
module.exports.confirmEmail = confirmEmail;

// INVITATION EMAIL
function inviteEmail(email, senderName, receiverName, token) {
  const filePath = path.join(
    __dirname,
    "../../public/emails/email-invitation.html"
  );
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const invitationUrl = `${process.env.CLIENT_URL}/join-team/${token}`;
  const replacements = {
    urlInvitation: invitationUrl,
    senderName: senderName,
  };
  const htmlToSend = template(replacements);
  const data = {
    from: process.env.FROM_WHO_MAIL,
    to: email,
    subject: `Hi ${receiverName}, [Boostack] You Received Invitation`,
    html: htmlToSend,
  };
  return data;
}
module.exports.inviteEmail = inviteEmail;
