const User = require("../../model/User");
const Account = require("../../model/Account");
const { generateSession } = require("../../services/auth-service");
const auth = require("../../services/auth-service");
//Get Tenants
module.exports.getAccounts = async function(req, res) {
  const userId = auth.getUserId(req);

  await User.findOne({ _id: userId }, (error, user) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (!user) {
      return;
    }
  })
    .select(["_id", "username", "email"])
    .populate({
      path: "accounts",
      model: "Account",
      select: [
        "name",
        "customer_id",
        "subscribed",
        "subscription",
        "plan",
        "membership",
      ],
    })
    .exec(function(err, accounts) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(200).json({ tenants: accounts });
    });
};
/* Switch between accounts */
module.exports.switchAccount = async function(req, res) {
  console.log("req.params", req.params);

  const user = await User.findOne({ _id: req.params.userId }, (error, user) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
    if (!user) {
      return res.status(500).json({ message: "User Not Found" });
    }
  });
  const account = await Account.findOne(
    { _id: req.params.tenantId },
    (error, account) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
      }
      if (!account) {
        return res.status(500).json({ message: "Account Not Found" });
      }
    }
  );
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
};
