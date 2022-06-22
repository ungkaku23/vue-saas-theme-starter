const mongoose = require("mongoose");
const emailValidator = require("email-validator");

const maillingSchema = new mongoose.Schema({
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
});
maillingSchema.set("timestamps", true);

module.exports = mongoose.model("Leads", maillingSchema);
