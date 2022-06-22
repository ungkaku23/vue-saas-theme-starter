<template>
  <div>
    <div ref="card" id="card-element" class="form-control"></div>
    <div
      id="card-errors"
      role="alert"
      v-if="stripeObj.errMsg"
      class="text-danger"
    >
      {{ stripeObj.errMsg }}
      <!-- Any Stripe Elements error messages will be mounted here -->
    </div>
    <!-- LOADING STATE -->
    <div id="loading" class="card card-centered hide" v-if="stripeObj.loading">
      <div class="card-body">
        <div>
          <div class="loader"></div>
        </div>
        <h3 class="header-blue">
          Processing <br />
          your payment...
        </h3>
        <p class="helper-text">Please wait a few minutes!</p>
      </div>
    </div>
  </div>
</template>
<script>
import * as paymentService from "../../services/PaymentService";
export default {
  name: "stripeCard",
  props: ["stripeObj"],
  data() {
    return {
      stripeAPIToken: "",
      // eslint-disable-next-line no-undef
      stripe: null,
      elements: "",
      cardElement: "",
      errorCard: "",
    };
  },
  methods: {
    /*
        Includes Stripe.js dynamically
    */
    includeStripe(URL, callback) {
      let documentTag = document,
        tag = "script",
        object = documentTag.createElement(tag),
        scriptTag = documentTag.getElementsByTagName(tag)[0];
      object.src = "https://" + URL;
      if (callback) {
        object.addEventListener(
          "load",
          function(e) {
            callback(null, e);
          },
          false
        );
      }
      scriptTag.parentNode.insertBefore(object, scriptTag);
    },
    /*
    Configures Stripe by setting up the elements and 
    creating the card element.
    */
    configureStripe() {
      /* Set up styles for your Stripe Elements instance --
       * To make it match your site's design
       */
      var elementsStyles = {
        base: {
          fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
        },
      };
      //Get PK From Backend
      paymentService
        .getConfig()
        .then(
          function(response) {
            if (response) {
              //this.stripeAPIToken = response.data.publishableKey;
              // eslint-disable-next-line no-undef
              this.stripe = Stripe(response.data.publishableKey);
              this.elements = this.stripe.elements();
              this.cardElement = this.elements.create("card", {
                style: elementsStyles,
              });
              this.cardElement.mount("#card-element");
              // Add an event listener: check for error messages as we type
              this.cardElement.addEventListener("change", ({ error }) => {
                if (error) {
                  this.stripeObj.errMsg = error.message;
                } else {
                  this.stripeObj.errMsg = "";
                }
              });
            }
          }.bind(this)
        )
        .catch(function(error) {
          console.log(error);
        });
    },
  },
  mounted() {
    this.includeStripe(
      "js.stripe.com/v3/",
      function() {
        this.configureStripe();
      }.bind(this)
    );
  },
};
</script>
