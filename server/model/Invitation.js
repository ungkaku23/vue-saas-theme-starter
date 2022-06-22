const mongoose = require("mongoose");

const invitatonSchema = new mongoose.Schema({
  token: String,
  email: String,
  username: String,
  invitedBy: String,
  team: String,
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "owner"],
  },
  createdAt: { type: Date, expires: "3d", default: Date.now }, // expires in 3 days /* https://docs.mongodb.com/manual/core/index-ttl/ */
});

module.exports = mongoose.model("Invitation", invitatonSchema);
