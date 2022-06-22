const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  subscription_id: String,
  plan_name: String,
  current_period_end: Number,
  product_id: String,
  card_last4: Number,
  card_brand: String,
  cancel_at_period_end: Boolean,
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "plan" },
});
subscriptionSchema.set("timestamps", true);

module.exports = mongoose.model("Subscription", subscriptionSchema);
