<template>
  <div>
    <section class="pricing-table ">
      <div class="row pb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body p-2">
              <div class="container text-center">
                <h4 class="mb-3 mt-5">Start up your SaaS today</h4>
                <p class="w-75 mx-auto mb-5">
                  Select an option that's fitting your needs most
                </p>
                <div class="row pricing-table justify-content-md-center">
                  <div
                    class="col-md-4 grid-margin stretch-card pricing-card"
                    v-for="(item, index) in plans"
                    v-bind:key="index"
                  >
                    <div
                      class="card border pricing-card-body"
                      v-bind:class="{
                        'border-success': item === activePlan,
                      }"
                    >
                      <div class="text-center pricing-card-head">
                        <h3
                          v-bind:class="{
                            'text-success': item === activePlan,
                          }"
                        >
                          {{ item.nickname }}
                        </h3>
                        <p>For Business</p>
                        <h1 class="font-weight-normal mb-4">
                          {{ item.amount }}
                        </h1>
                      </div>
                      <!-- FEATURES -->
                      <ul
                        class="list-unstyled plan-features"
                        v-for="feature in item.features"
                        v-bind:key="feature"
                      >
                        <li>{{ feature }}</li>
                      </ul>
                      <!-- FEATURES -->
                      <div class="wrapper">
                        <button
                          @click.prevent="toggleSelected(item)"
                          v-bind:class="{
                            'btn-success': item === activePlan,
                          }"
                          class="btn btn-outline-success btn-block"
                        >
                          {{ item === activePlan ? "Selected" : "Select" }}
                        </button>
                      </div>
                      <p class="mt-3 mb-0 plan-cost text-gray">
                        Per month Billed monthly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div id="payment-form" class="flex justify-center">
                <div
                  class="col-xl-4 col-lg-8 mx-auto inline-block border rounded"
                >
                  <div class="font-bold text-xl mb-2">
                    Enter your card details. <br />Your subscription will start
                    now.
                  </div>
                  <p class="text-gray-700 text-base">
                    → Total due now
                    <span id="total-due-now" class="font-weight-bold">{{
                      activePlan ? activePlan.amount : "$0"
                    }}</span>
                  </p>
                  <p id="price-selected" class="text-gray-700 text-base mb-4">
                    → Subscribing to
                    <span id="priceId" class="font-weight-bold">{{
                      activePlan ? activePlan.nickname : "Choose a Plan"
                    }}</span>
                  </p>

                  <div class="w-full">
                    <form id="payment-form" @submit.prevent="upgradePlan()">
                      <div class="flex flex-wrap -mx-3 mb-3">
                        <div class="w-full mb-0">
                          <label
                            class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                            for="grid-first-name"
                          >
                            Card
                          </label>
                          <StripeCard
                            ref="stripeComponent"
                            v-bind:stripeObj="stripeObj"
                          ></StripeCard>
                        </div>
                        <!-- TEST Card -->
                        <b-card
                          bg-variant="light"
                          header="TEST CARD"
                          class="text-center border"
                          no-body
                        >
                          <b-card-text
                            ><span
                              ><strong>Card Number:</strong> 4242 4242 4242
                              4242</span
                            ><br />
                            <span><strong>Exp: </strong>12/23</span>&nbsp;
                            <span><strong>CVC: </strong>444</span>&nbsp;
                            <span><strong>ZIP: </strong>22222</span>
                          </b-card-text>
                        </b-card>
                      </div>
                      <div class="form-group mt-3">
                        <button
                          :disabled="!activePlan"
                          type="submit"
                          class="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                        >
                          SUBSCRIBE
                          <span
                            v-if="stripeObj.loading"
                            class="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        </button>
                      </div>
                    </form>
                  </div>
                  <span v-if="errorMessage" class="text-danger">{{
                    errorMessage
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import * as paymentService from "../../../services/PaymentService";
import StripeCard from "../../../components/stripe/stripeCard";
import * as auth from "../../../services/AuthService";
export default {
  name: "upgrade",
  components: {
    StripeCard,
  },
  data() {
    return {
      plans: null,
      isHidden: true,
      activePlan: null,
      errorMessage: null,
      stripeObj: {
        plan: null,
        loading: false,
        error: "",
        success: "",
        errMsg: "",
        subscribing: null,
      },
    };
  },
  beforeCreate: function findPlans() {
    paymentService
      .getPlans()
      .then((response) => {
        this.plans = response.data.products[0].plans;
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    toggleSelected: function(item) {
      this.activePlan = item;
      this.stripeObj.plan = item;
    },
    async upgradePlan() {
      if (auth.getSubStatus()) {
        this.errorMessage = `You're already subscribed to ${auth.getUserPlan()} plan`;
        return;
      }
      const user = {
        email: this.$store.state.email,
        name: this.$store.state.username,
        plan: this.stripeObj.plan.formatted,
      };
      paymentService.handleSubmit(
        this.stripeObj,
        this.$refs.stripeComponent,
        user
      );
    },
  },
};
</script>
