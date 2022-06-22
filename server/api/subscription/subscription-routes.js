const express = require("express");
const router = express.Router();
const controller = require("./subscription-controller");

// GET CONFIG (PK KEY)
router.get("/config", controller.config);

//Get Plans & Products
router.get("/plans", controller.index);

// Check Subscription account
router.get("/check-subscription", controller.checkSubscription);

// Create Subscription
router.post("/create-subscription", controller.createSubscription);

//Retry new payment method and assigns it
router.post("/retry-invoice", controller.retryInvoice);

//Verify subscription Status
router.post("/verify-subscription", controller.verifySubscription);

//Retrieve subscription information
router.get(
  "/retrieve-subscription-information/:stripeCustomerId",
  controller.retrieveSubscriptionInformation
);
//Cancel subscription
router.put("/cancel-subscription", controller.cancelSubscription);

//Reactivate subscription
router.put("/reactivate-subscription", controller.reactivateSubscription);

//Update subscription
router.put("/update-subscription", controller.updateSubscription);

//Get invoices
router.get("/get-invoices/:stripeCustomerId", controller.getInvoices);

module.exports = router;
