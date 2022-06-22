//CONFIG FILE FOR ALL OUR ROUTES

//Import All Routes To registerRoutes Function

const authRoutes = require("./api/auth/auth-routes");
const regRoutes = require("./api/register/register-routes");
const userRoutes = require("./api/user/user-routes");
const teamRoutes = require("./api/team/team-routes");
const invitationRoutes = require("./api/invitation/invitation-routes");
const mailRoutes = require("./api/mail/mailling-routes");
const accountRoutes = require("./api/account/account-routes");
const subscriptionRoutes = require("./api/subscription/subscription-routes");
const stripeRoutes = require("./api/subscription/subscription-webhook");
//For All Our Routes We Use "/api" Prefix (any route gonna have /api before)
function registerRoutes(app) {
  app.use("/api", authRoutes);
  app.use("/api", regRoutes);
  app.use("/api", userRoutes);
  app.use("/api", teamRoutes);
  app.use("/api", invitationRoutes);
  app.use("/api", mailRoutes);
  app.use("/api", accountRoutes);
  app.use("/api", subscriptionRoutes);
  app.use("/api", stripeRoutes);
}

module.exports.registerRoutes = registerRoutes;
