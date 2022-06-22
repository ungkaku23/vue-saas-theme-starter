const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Subscription = require("../../model/Subscription");
const User = require("../../model/User");
const { generateSession } = require("../../services/auth-service");
//Socket IO
var io = require("../../io");
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

router.post(
  "/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    // Retrieve the event by verifying the signature using the raw body and secret.
    // If you are testing your webhook locally with the Stripe CLI you
    // can find the endpoint's secret by running `stripe listen`
    // Otherwise, find your endpoint's secret in your webhook settings in the Developer Dashboard
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
      //console.log("EVENT", event);
    } catch (err) {
      console.log(err);
      console.log(`⚠️  Webhook signature verification failed.`);
      console.log(
        `⚠️  Check the env file and enter the correct webhook secret.`
      );
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    //const dataObject = event.data.object;
    //console.log("DATA-OBJECT", dataObject);

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case "invoice.paid":
        // Used to provision services after the trial has ended.
        // The status of the invoice will show up as paid. Store the status in your
        // database to reference when a user accesses your service to avoid hitting rate limits.
        break;
      case "invoice.payment_failed":
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case "customer.subscription.deleted":
        if (event.request != null) {
          // handle a subscription cancelled by your request (FOR YOUR TESTING BY STRIPE CLI, Move in ELSE Block For Production)
          // from above.
          console.log("handle a subscription cancelled by your request!");
          const subscriptionId = event.data.object.id;
          //Delete Local Subscription Records
          await Subscription.deleteOne(
            { subscription_id: subscriptionId },
            (error) => {
              if (error) {
                return res.status(500).json();
              }
            }
          );
          const customerId = event.data.object.customer;
          //Update Local User Subscription State
          await User.findOneAndUpdate(
            { stripeCustomerId: customerId },
            {
              $set: {
                plan: "",
                subscription: "",
                subscribed: false,
              },
            },
            { new: true }
          ).exec(function(err, user) {
            if (err) {
              console.log(err);
            }
            const payload = generateSession(user, process.env.TOKEN_SECRET);
            io.emit("session", { user: payload });
          });
        } else {
          // handle subscription cancelled automatically based
          // upon your subscription settings.
          console.log("handle subscription cancelled automatically based!");
        }
        break;
      case "customer.subscription.trial_will_end":
        // Send notification to your user that the trial will end
        break;
      case "customer.subscription.updated":
        console.log("UPDATE EVENT");
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }
    //res.sendStatus(200);
    res.status(200).json({ received: true });
  }
);

module.exports = router;
