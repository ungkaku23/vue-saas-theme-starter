const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const emailValidator = require("email-validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: { unique: true },
    validate: {
      validator: emailValidator.validate,
      message: (props) => `${props.value} is not valid email address!`,
    },
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  resetLink: {
    data: String,
    default: "",
  },
  username: String,
  password: String,
  imgPath: String,
  ownedAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
});
userSchema.set("timestamps", true);

// Static Methode Schema You can Use through Your App
userSchema.statics.passwordMatches = function(password, hash) {
  return bcrypt.compareSync(password, hash);
};
//Pre Save Methode Before Saving To DataBase
userSchema.pre("save", function(next) {
  this.email = this.email.toLowerCase();
  this.username = this.username.toLowerCase();
  //Encrypte The Password
  const unsafePassword = this.password;
  this.password = bcrypt.hashSync(unsafePassword);
  //Call Next To Continue Saving The User
  next();
});
module.exports = mongoose.model("User", userSchema);
