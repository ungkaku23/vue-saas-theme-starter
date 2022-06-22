const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const history = require("connect-history-api-fallback");
const helmet = require("helmet");
require("dotenv").config();

// Function For Setting Environments
module.exports.setEnvironment = function(app) {
  //Check Where Environement We Are In And Set The Good One
  if (process.env.NODE_ENV != "production") {
    setDevEnv(app);
  } else {
    setProdEnv(app);
  }
};

//Setting Development Environment
function setDevEnv(app) {
  console.log("setting DEVELOPMENT environment");
  //Make sure Env Variable is Always Set
  process.env.NODE_ENV = "development";
  //DB URL FOR DEV ENV
  process.env.DB_URL = process.env.DEVELOPMENT_DB_DSN;
  //app.use(bodyParser.json());
  // Use JSON parser for all non-webhook routes.
  app.use((req, res, next) => {
    if (req.originalUrl === "/api/stripe-webhook") {
      next();
    } else {
      bodyParser.json()(req, res, next);
    }
  });
  // Token Secret To Sign With
  process.env.TOKEN_SECRET = process.env.TOKEN_SECRET_DEV;
  //MORGAN Logs All Of Our Requests For API Wich Is Good For Debugging
  app.use(morgan("dev"));
  //CORS Allow Any Request From VueJS Client
  app.use(cors());
}

//Setting Production Environment
function setProdEnv(app) {
  console.log("setting PRODUCTION environment");
  process.env.NODE_ENV = "production";
  //DB URL FOR PROD ENV
  process.env.DB_URL = process.env.PRODUCTION_DB_DSN;
  // Token Secret To Sign With
  process.env.TOKEN_SECRET = process.env.TOKEN_SECRET_PROD;
  //app.use(bodyParser.json());
  //Force Redirect https
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https")
      res.redirect(`https://${req.header("host")}${req.url}`);
    else next();
  });
  // Use JSON parser for all non-webhook routes.
  app.use((req, res, next) => {
    if (req.originalUrl === "/api/stripe-webhook") {
      next();
    } else {
      bodyParser.json()(req, res, next);
    }
  });
  app.use(
    express.static(path.resolve(__dirname, "../../dist"), {
      maxAge: "1y",
      etag: false,
    })
  );
  app.use(history());
  // This disables the `contentSecurityPolicy` middleware but keeps the rest.
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  console.log("setting PRODUCTION environment");
}
