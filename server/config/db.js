const mongoose = require("mongoose");

module.exports.connectToDB = function() {
  mongoose.connect(
    process.env.DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    (error) => {
      if (error) {
        console.log("Unable to connect to database");
        throw error;
      } else {
        console.log("Connected to MongoDB!");
      }
    }
  );
};
