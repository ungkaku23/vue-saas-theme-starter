const mongoose = require("mongoose");

require("./Membership");

const accountSchema = new mongoose.Schema({
  name: String,
  membership: [mongoose.model("Membership").schema],
  customer_id: String,
  subscribed: {
    type: Boolean,
    default: false,
  },
  plan: String,
  subscription: String,
  membership_limit: Number,
  features: [
    {
      type: String,
    },
  ],
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },
});

module.exports = mongoose.model("Account", accountSchema);
