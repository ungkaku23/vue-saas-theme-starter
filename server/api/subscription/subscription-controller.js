require("dotenv").config();
const STRIPE_API = require("../../services/stripe-service");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const { generateSession } = require("../../services/auth-service");
const auth = require("../../services/auth-service");
const User = require("../../model/User");
const Subsription = require("../../model/Subscription");
const Account = require("../../model/Account");
//Check subscrption
async function checkSubscription(req, res) {
  const accountId = auth.getAccountId(req);
  const userId = auth.getUserId(req);
  const account = await Account.findOne({
    _id: accountId,
  });
  const user = await User.findOne({
    _id: userId,
  });
  if (account.subscribed === true) {
    const subscription = await Subsription.findOne({
      _id: account.subscription_id,
    });
    let membership = account.membership.find((obj) => obj.user == userId);
    const payload = generateSession(
      user,
      process.env.TOKEN_SECRET,
      membership,
      account
    );
    const state = {
      payload: payload,
      message: `You're already on ${subscription.plan_name} Plan!`,
    };
    return res.status(409).json({ state: state });
  } else {
    return res.status(200).json();
  }
}
//Get invoices
async function getInvoices(req, res) {
  const invoicesResponse = await stripe.invoices.list({
    customer: req.params.stripeCustomerId,
  });
  const invoices = invoicesResponse.data.map((invoice) => ({
    Amount: `$${(invoice["amount_paid"] / 100).toFixed(2)}`,
    //Date: invoice["created"],
    Date: new Date(invoice["created"] * 1000).toDateString(),
    Invoice: invoice["invoice_pdf"],
  }));
  if (!invoices) {
    return;
  }
  return res.status(200).json({ invoices: invoices });
}
//Get Plans & Products
async function index(req, res) {
  const products = await STRIPE_API.getProductsAndPlans((error) => {
    if (error) {
      return res.status(500).json();
    }
  });

  return res.status(200).json({ products: products });
}
// GET CONFIG (PK KEY)
function config(req, res) {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
}
// CREATE SUBSCRIPTION
async function createSubscription(req, res) {
  // Attach the payment method to the customer
  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.body.customerId,
    });
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }

  // Change the default invoice settings on the customer to the new payment method
  await stripe.customers.update(req.body.customerId, {
    invoice_settings: {
      default_payment_method: req.body.paymentMethodId,
    },
  });

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: req.body.customerId,
    items: [{ price: req.body.priceId }],
    expand: ["latest_invoice.payment_intent"],
  });
  return res.status(200).json({ subscription });
}
//RETRY NEW PM
async function retryInvoice(req, res) {
  // Set the default payment method on the customer

  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.body.customerId,
    });
    await stripe.customers.update(req.body.customerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });
  } catch (error) {
    // in case card_decline error
    return res
      .status("402")
      .send({ result: { error: { message: error.message } } });
  }

  const invoice = await stripe.invoices.retrieve(req.body.invoiceId, {
    expand: ["payment_intent"],
  });
  //res.send(invoice);
  return res.status(200).json({ invoice });
}
// VERIFY & STORE SUBSCRIPTION
async function verifySubscription(req, res) {
  const subscription = await stripe.subscriptions.retrieve(
    req.body.subscriptionId,
    {
      expand: ["customer.invoice_settings.default_payment_method"],
    }
  );
  //The minimum fields from stripe to store
  const userId = auth.getUserId(req);
  const accountId = auth.getAccountId(req);
  const sub = new Subsription({
    customer_id: subscription.customer.id,
    subscription_id: subscription.id,
    plan_name: subscription.items.data[0].price.nickname,
    current_period_end: subscription.current_period_end,
    product_id: subscription.items.data[0].price.product,
    cancel_at_period_end: subscription.cancel_at_period_end,
    user_id: userId,
    card_last4:
      subscription.customer.invoice_settings.default_payment_method.card.last4,
    card_brand:
      subscription.customer.invoice_settings.default_payment_method.card.brand,
  });
  sub.save((error, sub) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    //Update Local User Subscription State
    Account.findOneAndUpdate(
      { _id: accountId },
      {
        $set: {
          plan: subscription.items.data[0].price.nickname,
          subscription: subscription.status,
          subscribed: true,
          membership_limit: STRIPE_API.getFeaturesPlan(
            subscription.items.data[0].price.nickname
          ).membership_limit,
          subscription_id: sub._id,
        },
      },
      { new: true }
    ).exec(function(err, account) {
      if (err) {
        console.log(err);
      }
      //Get Current Membership From SubDocuments Array
      let membership = account.membership.find((obj) => obj.user == userId);
      //Get User
      User.findOne({ _id: membership.user.toString() }, (error, user) => {
        if (user) {
          const payload = generateSession(
            user,
            process.env.TOKEN_SECRET,
            membership,
            account
          );
          return res.status(200).json({ payload });
        } else {
          return res.status(404).json({ message: "User Not Found" });
        }
      });
    });
  });
}
// Retrieve Subscription Informations
async function retrieveSubscriptionInformation(req, res) {
  const stripeCustomerId = req.params.stripeCustomerId;
  const account = await Account.findOne({
    customer_id: stripeCustomerId,
  });
  const subscription = await Subsription.findOne({
    _id: account.subscription_id,
  });
  if (subscription) {
    const subscriptionInfo = {
      card_last4: subscription.card_last4,
      card_brand: subscription.card_brand,
      subscription_id: subscription.subscription_id,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      //You Can Add More Informations...
    };
    return res.status(200).json({ subscriptionInfo });
  }
}
// Cancel the subscription
async function cancelSubscription(req, res) {
  //const userId = auth.getUserId(req);
  const updateSubscription = await stripe.subscriptions.update(
    req.body.subscriptionId,
    {
      cancel_at_period_end: true,
    }
  );
  //Update Local User Subscription State
  await Subsription.findOneAndUpdate(
    { subscription_id: updateSubscription.id },
    {
      $set: {
        cancel_at_period_end: updateSubscription.cancel_at_period_end,
      },
    },
    { new: true }
  ).exec(function(err) {
    if (err) {
      console.log(err);
    }
    return res
      .status(200)
      .json({ message: "Your Subscription Has Been canceled" });
  });
}
// Reactivating canceled subscription
async function reactivateSubscription(req, res) {
  //const userId = auth.getUserId(req);
  const updateSubscription = await stripe.subscriptions.update(
    req.body.subscriptionId,
    { cancel_at_period_end: false }
  );
  //Update Local User Subscription State
  await Subsription.findOneAndUpdate(
    { subscription_id: updateSubscription.id },
    {
      $set: {
        cancel_at_period_end: updateSubscription.cancel_at_period_end,
      },
    },
    { new: true }
  ).exec(function(err) {
    if (err) {
      console.log(err);
    }
    return res
      .status(200)
      .json({ message: "Your Subscription Has Been Reactivated" });
  });
}
// Update subscription
async function updateSubscription(req, res) {
  const userId = auth.getUserId(req);
  // Set proration date to this moment:
  const proration_date = Math.floor(Date.now() / 1000);
  const subscription = await stripe.subscriptions.retrieve(
    req.body.subscriptionId
  );
  const updatedSubscription = await stripe.subscriptions.update(
    req.body.subscriptionId,
    {
      cancel_at_period_end: false,
      proration_date: proration_date,
      proration_behavior: "create_prorations",
      //proration_behavior: "none",
      items: [
        {
          id: subscription.items.data[0].id,
          price: req.body.newPriceId,
        },
      ],
    }
  );
  //Update Local Subscription State
  await Subsription.findOneAndUpdate(
    { subscription_id: updatedSubscription.id },
    {
      $set: {
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        plan_name: updatedSubscription.plan.nickname,
        current_period_end: updatedSubscription.current_period_end,
      },
    },
    { new: true }
  ).exec(function(err) {
    if (err) {
      console.log(err);
    }
  });
  const user = await User.findOne({
    _id: userId,
  });
  //Update Local User Plan
  await Account.findOneAndUpdate(
    { customer_id: req.body.stripeCustomerId },
    {
      $set: {
        plan: updatedSubscription.plan.nickname,
        subscription: updatedSubscription.status,
      },
    },
    { new: true }
  ).exec(function(err, account) {
    if (err) {
      console.log(err);
    }
    //Get Current Membership From SubDocuments Array
    let membership = account.membership.find((obj) => obj.user == userId);
    const payload = generateSession(
      user,
      process.env.TOKEN_SECRET,
      membership,
      account
    );
    return res
      .status(200)
      .json({ message: "Your Plan Has Been Updated", payload });
  });
}
module.exports = {
  config,
  index,
  createSubscription,
  retryInvoice,
  verifySubscription,
  retrieveSubscriptionInformation,
  cancelSubscription,
  reactivateSubscription,
  updateSubscription,
  getInvoices,
  checkSubscription,
};
