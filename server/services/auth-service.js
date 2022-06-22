const jwt = require("jsonwebtoken");

//Generate JSON Web Token Function
function generateJWT(user, secretKey, membership, account, expireIn) {
  const tokenData = {
    email: user.email,
    confirmed: user.confirmed,
    id: user._id,
    username: user.username,
    role: membership.access,
    subscribed: account.subscribed,
    stripeCustomerId: account.customer_id,
    accountId: account._id,
    imgPath: user.imgPath,
  };
  return jwt.sign({ user: tokenData }, secretKey, expireIn);
}
module.exports.generateJWT = generateJWT;
//Attach Subscription Info to JWT if Active Subscription Else Sent only Token
function generateSession(user, secretKey, membership, account, expireIn) {
  const token = generateJWT(user, secretKey, membership, account, expireIn);
  var payload;
  /* No Subsciprtion for this user */
  if (
    account.plan == "" ||
    account.subscription == "" ||
    !account.subscription
  ) {
    payload = {
      token: token,
    };
    /* Subscription exist for this user */
  } else {
    payload = {
      token: token,
      plan: account.plan,
      subscription: account.subscription,
    };
  }
  return payload;
}
module.exports.generateSession = generateSession;

//Function To Decode The Token And Access User Data Inside The Token
function decodeToken(req, secretKey) {
  //Grab The Token From The Header
  const session = req.headers.authorization || req.headers["authorization"];
  if (!session) {
    return null;
  }
  const parseSession = JSON.parse(session);
  const token = parseSession.token;
  //If Not Token Return Null
  if (!token) {
    return null;
  }
  //Dectypt Token
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
}
// Function To Attach To Any Routes That We Want To User To Be LoggedIn To Access
async function requireLogin(req, res, next) {
  try {
    const token = decodeToken(req, process.env.TOKEN_SECRET);
    if (!token) {
      return res.status(401).json({ message: "You must be logged IN" });
    }
    //Get user info from decoded token
    const user = token.user;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
module.exports.requireLogin = requireLogin;

//Grab User Data
function getUsername(req) {
  const token = decodeToken(req, process.env.TOKEN_SECRET);
  if (!token) {
    return null;
  }
  return token.user.username;
}
module.exports.getUsername = getUsername;

function getUserId(req) {
  const token = decodeToken(req, process.env.TOKEN_SECRET);
  if (!token) {
    return null;
  }
  return token.user.id;
}
module.exports.getUserId = getUserId;

function getCustomerId(req) {
  const token = decodeToken(req, process.env.TOKEN_SECRET);
  if (!token) {
    return null;
  }
  return token.user.stripeCustomerId;
}
module.exports.getCustomerId = getCustomerId;

function getAccountId(req) {
  const token = decodeToken(req, process.env.TOKEN_SECRET);
  if (!token) {
    return null;
  }
  return token.user.accountId;
}
module.exports.getAccountId = getAccountId;

function getEmail(req) {
  const token = decodeToken(req, process.env.TOKEN_SECRET);
  if (!token) {
    return null;
  }
  return token.user.email;
}
module.exports.getEmail = getEmail;
