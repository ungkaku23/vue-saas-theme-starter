import { http } from "../services/HttpService";
import store from "../store/index";
import * as auth from "../services/AuthService";
import router from "../router/index";
//Manage Payment Authentication
function handlePaymentThatRequiresCustomerAction({
  subscription,
  invoice,
  priceId,
  paymentMethodId,
  stripe,
  stripeObj,
  isRetry,
}) {
  if (subscription && subscription.status === "active") {
    // subscription is active, no customer actions required.
    stripeObj.loading = false;
    return { subscription, priceId, paymentMethodId, stripeObj };
  }

  // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
  // If it's a retry, the payment intent will be on the invoice itself.
  const paymentIntent = invoice
    ? invoice.payment_intent
    : subscription.latest_invoice.payment_intent;

  if (
    paymentIntent.status === "requires_action" ||
    (isRetry === true && paymentIntent.status === "requires_payment_method")
  ) {
    return stripe
      .confirmCardPayment(paymentIntent.client_secret, {
        payment_method: paymentMethodId,
      })
      .then((result) => {
        if (result.error) {
          stripeObj.errMsg = result.error.message;
          stripeObj.loading = false;
          // start code flow to handle updating the payment details
          // Display error message in your UI.
          // The card was declined (i.e. insufficient funds, card has expired, etc)
          throw result;
        } else {
          if (result.paymentIntent.status === "succeeded") {
            stripeObj.loading = false;
            // There's a risk of the customer closing the window before callback
            // execution. To handle this case, set up a webhook endpoint and
            // listen to invoice.payment_succeeded. This webhook endpoint
            // returns an Invoice.
            return {
              priceId: priceId,
              subscription: subscription,
              invoice: invoice,
              paymentMethodId: paymentMethodId,
              stripeObj,
            };
          }
        }
      })
      .catch((error) => {
        stripeObj.errMsg = error.error.message;
        stripeObj.loading = false;
      });
  } else {
    // No customer action needed
    return { subscription, priceId, paymentMethodId, stripeObj };
  }
}
//Catch the error, let your customer know their card was declined, and return them to the payment form to try a different card.
function handleRequiresPaymentMethod({
  subscription,
  paymentMethodId,
  priceId,
  stripeObj,
}) {
  if (subscription.status === "active") {
    stripeObj.loading = false;
    // subscription is active, no customer actions required.
    return { subscription, priceId, paymentMethodId, stripeObj };
  } else if (
    subscription.latest_invoice.payment_intent.status ===
    "requires_payment_method"
  ) {
    // Using localStorage to store the state of the retry here
    // (feel free to replace with what you prefer)
    // Store the latest invoice ID and status
    localStorage.setItem("latestInvoiceId", subscription.latest_invoice.id);
    localStorage.setItem(
      "latestInvoicePaymentIntentStatus",
      subscription.latest_invoice.payment_intent.status
    );
    stripeObj.errMsg = "Your card was declined, try a different card.";
    stripeObj.loading = false;
    throw new Error("Your card was declined, try a different card.");
  } else {
    stripeObj.loading = false;
    return { subscription, priceId, paymentMethodId, stripeObj };
  }
}
//Attach the new card to the customer and update the invoice setting.
function retryInvoiceWithNewPaymentMethod({
  customerId,
  paymentMethodId,
  invoiceId,
  priceId,
  stripe,
  stripeObj,
}) {
  return (
    http()
      .post("/retry-invoice", {
        customerId: customerId,
        paymentMethodId: paymentMethodId,
        invoiceId: invoiceId,
      })
      .then((response) => {
        return response;
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          // The card had an error when trying to attach it to a customer.
          throw result;
        }
        return result;
      })
      // Normalize the result to contain the object returned by Stripe.
      // Add the additional details we need.
      .then((result) => {
        return {
          // Use the Stripe 'object' property on the
          // returned result to understand what object is returned.
          subscription: result.data.subscription,
          invoice: result.data.invoice,
          paymentMethodId: paymentMethodId,
          priceId: priceId,
          stripe,
          stripeObj,
          isRetry: true,
        };
      })
      // Some payment methods require a customer to be on session
      // to complete the payment process. Check the status of the
      // payment intent to handle these actions.
      .then(handlePaymentThatRequiresCustomerAction)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        //displayError(error);
        console.log(
          "An error has happened. Display the failure to the user here.",
          error
        );
      })
  );
}
//Provision Access To Your Service
function onSubscriptionComplete(result) {
  // Payment was successful.
  // Payment was successful. Provision access to your service.
  // Remove invoice from localstorage because payment is now complete.
  // clearCache();
  if (result && !result.subscription) {
    const subscription = { id: result.invoice.subscription };
    result.subscription = subscription;
    window.localStorage.removeItem("latestInvoiceId");
    window.localStorage.removeItem("latestInvoicePaymentIntentStatus");
  }
  if (result.subscription.status === "active") {
    // Change your UI to show a success message to your customer.
    // Call your backend to grant access to your service based on
    // `result.subscription.items.data[0].price.product` the customer subscribed to.
  }
  setAccountInformation(result);
  // Change your UI to show a success message to your customer.
  // onSubscriptionSampleDemoComplete(result);
  // Call your backend to grant access to your service based on
  // the product your customer subscribed to.
  // Get the product by using result.subscription.price.product
}
//Save the payment details and Create Subscription
export function createSubscription({
  customerId,
  paymentMethodId,
  user,
  stripe,
  stripeObj,
}) {
  const plan = JSON.parse(user.plan);
  return (
    http()
      .post("/create-subscription", {
        customerId: customerId,
        paymentMethodId: paymentMethodId,
        priceId: plan.id,
      })
      .then((response) => {
        return response;
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          this.$swal.fire({
            position: "top-end",
            icon: "error",
            title: result.error.message,
            showConfirmButton: false,
            timer: 2000,
          });
          // The card had an error when trying to attach it to a customer
          throw result;
        }
        return result;
      })
      // Normalize the result to contain the object returned
      // by Stripe. Add the addional details we need.
      .then((result) => {
        return {
          // Use the Stripe 'object' property on the
          // returned result to understand what object is returned.
          subscription: result.data.subscription,
          paymentMethodId: paymentMethodId,
          priceId: plan.id,
          stripe: stripe,
          stripeObj: stripeObj,
        };
      })
      // Some payment methods require a customer to do additional
      // authentication with their financial institution.
      // Eg: 2FA for cards.
      .then(handlePaymentThatRequiresCustomerAction)
      // If attaching this card to a Customer object succeeds,
      // but attempts to charge the customer fail. You will
      // get a requires_payment_method error.
      .then(handleRequiresPaymentMethod)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        //setErrorToDisplay(error.message || error.error.decline_code);
        stripeObj.loading = false;
        console.log("CATCH ERROR (createSubscription)", error);
      })
  );
}
export async function handleSubmit(stripeObj, stripeComponent, user) {
  stripeObj.errMsg = null;
  stripeObj.subscribing = true;
  stripeObj.loading = true;
  // Get a reference to a mounted CardElement. Elements knows how
  // to find your CardElement because there can only ever be one of
  // each type of element.
  const cardElement = stripeComponent.cardElement;
  const stripe = stripeComponent.stripe;
  const customerId = store.state.stripeCustomerId;
  //const customerId = "cus_ITxVHWKQTU1FXS";

  // Get current user
  const currentUser = auth.getUserObj();
  // If User Have Previous Subscription
  if (currentUser.plan) {
    this.$swal.fire({
      position: "top-end",
      icon: "info",
      title: `Your Are Already on ${currentUser.plan} Plan`,
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }

  // If a previous payment was attempted, get the lastest invoice
  const latestInvoicePaymentIntentStatus = localStorage.getItem(
    "latestInvoicePaymentIntentStatus"
  );

  // Use your card Element with other Stripe.js APIs
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: "card",
    card: cardElement,
  });

  if (error) {
    stripeObj.subscribing = false;
    stripeObj.loading = false;
    return;
  }
  const paymentMethodId = paymentMethod.id;
  if (latestInvoicePaymentIntentStatus === "requires_payment_method") {
    // Update the payment method and retry invoice payment
    const invoiceId = localStorage.getItem("latestInvoiceId");
    retryInvoiceWithNewPaymentMethod({
      customerId,
      paymentMethodId: paymentMethodId,
      invoiceId: invoiceId,
      stripe,
      stripeObj,
    });
    return;
  }

  // Create the subscription
  createSubscription({
    customerId,
    paymentMethodId: paymentMethodId,
    user,
    stripe,
    stripeObj,
  });
}
//Refresh Token And Grant Access
export async function setAccountInformation(result) {
  var subscriptionId = result.subscription.id;
  if (!subscriptionId) {
    subscriptionId = result.invoice.subscription;
  }
  await http()
    .post("/verify-subscription", {
      subscriptionId: subscriptionId,
    })
    .then((response) => {
      if (response.data.payload) {
        auth.setSession(response.data.payload);
        router.push({ name: "billing" });
      }
    });
}
// Get Subscription Information
export async function getSubscriptionInformation(stripeCustomerId) {
  return await http().get(
    `/retrieve-subscription-information/${stripeCustomerId}`
  );
}
//Cancel the subscription
export async function cancelSubscription(subscriptionId) {
  return await http().put("/cancel-subscription", {
    subscriptionId: subscriptionId,
  });
}
//Reactivate subscription
export async function reactivateSubscription(subscriptionId) {
  return await http().put("/reactivate-subscription", {
    subscriptionId: subscriptionId,
  });
}
//Update Subscription
export async function updateSubscription(
  priceId,
  subscriptionId,
  stripeCustomerId
) {
  return await http().put("/update-subscription", {
    subscriptionId: subscriptionId,
    newPriceId: priceId,
    stripeCustomerId: stripeCustomerId,
  });
}
//Get Config (PK KEY)
export async function getConfig() {
  return http().get("/config");
}
//Get Plans & Products
export function getPlans() {
  return http().get("/plans");
}

//Get Invoices
export function getInvoices(customerId) {
  return http().get(`/get-invoices/${customerId}`);
}
//Converting the Stripe epoch timestamp to ISO 8601
export function secondsToISOString(seconds) {
  const date = new Date(seconds * 1000);
  return date.toISOString().substring(0, 10);
}
