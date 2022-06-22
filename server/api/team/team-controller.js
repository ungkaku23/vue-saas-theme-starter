const User = require("../../model/User");
const Account = require("../../model/Account");
const auth = require("../../services/auth-service");
module.exports.index = function(req, res) {
  User.findOne({ _id: req.params.id }, (error, user) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (!user) {
      return res.status(404).json();
    }
    const userInfo = {
      email: user.email,
      username: user.name,
    };
    return res.status(200).json({ user: userInfo });
  });
};
//Check Email Availability In DB For Registration Async Form
module.exports.checkemail = function(req, res) {
  User.findOne({ email: req.body.email.toLowerCase() }, (error, email) => {
    if (error) {
      return res.status(500).json({ error: error });
    }
    if (email) {
      return res.status(200).json({ is_exist: "yes" });
    }
    return res.status(200).json({ is_exist: "no" });
  });
};
/* Edit Member Info */
module.exports.editMemberInfo = async function(req, res) {
  const accountID = auth.getAccountId(req);
  await Account.findById({ _id: accountID }, async (error, account) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (account) {
      const member = account.membership.id(req.params.id); // returns a matching subdocument
      // individual fields can be set directly (access)
      member.access = req.body.info.role;
      //Get UserId
      const userId = member.user;
      await account.save(); // saves document with subdocuments and triggers validation
      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: req.body.info },
        (error, user) => {
          if (error) {
            return res.status(500).json({ message: error.message });
          }
          if (user) {
            return res
              .status(200)
              .json({ message: "The Profile has been updated" });
          }
        }
      );
    } else {
      return res.status(404).json({ message: "Account Not Found" });
    }
  });
};
//Delete Member
module.exports.deleteMember = function(req, res) {
  const accountID = auth.getAccountId(req);
  Account.findByIdAndUpdate(
    accountID,
    {
      $pull: {
        membership: { user: req.params.id },
      },
    },
    { new: true },
    function(err, account) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (account) {
        User.findByIdAndUpdate(
          req.params.id,
          {
            $pull: {
              accounts: accountID,
            },
          },
          { new: true },
          function(err, user) {
            if (err) {
              return res.status(500).json({ message: err.message });
            }
            //Check If User Don't Have any Account
            if (user.accounts && !user.accounts.length) {
              User.findByIdAndDelete({ _id: user._id }, function(err) {
                if (err) console.log(err.message);
              });
            }
            return res.status(200).json({ message: "User has been deleted" });
          }
        );
      }
    }
  );
};
//Get Members Account
module.exports.getMembers = async function(req, res) {
  const accountID = auth.getAccountId(req);

  await Account.findOne({ _id: accountID }, (error, account) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (!account) {
      return res.status(200).json({ message: "Account Not Found" });
    }
  })
    .populate({
      path: "membership",
      populate: {
        path: "user",
        model: "User",
        select: ["email", "username", "confirmed"],
      },
    })
    .exec(function(err, members) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      const membersOfAccount = members.membership;
      return res.status(200).json({ membersOfAccount });
    });
};
