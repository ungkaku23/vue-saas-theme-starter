<template>
  <div>
    <section class="billing mb-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body pl-3 pr-3">
              <div class="row justify-content-center">
                <div class="col-lg-12">
                  <div class="border-bottom text-center pb-4">
                    <Breadcrumb />
                  </div>
                  <div class="col-md-6 grid-margin stretch-card">
                    <div class="card">
                      <div class="card-body pl-0 pr-0">
                        <h4 class="card-title">Manage Your Subscription</h4>
                        <p class="card-description">
                          Subscription Informations
                        </p>
                        <div class="inline-block border p-4 rounded">
                          <!-- If Sub Canceled -->
                          <div
                            v-if="subscriptionInfo.cancel_at_period_end"
                            class="canceled"
                          >
                            <span class="row font-weight-light"
                              >Your plan will remain active until your billing
                              ends on:
                              <span class="font-weight-bold">{{
                                subscriptionInfo.current_period_end
                              }}</span></span
                            >
                            <a
                              href="#"
                              @click="handleModalContent()"
                              class="row"
                              >Reactivate subscription</a
                            >
                            <hr class="my-4" />
                          </div>
                          <!-- If Sub Canceled end -->
                          <div class="row p-2" v-if="this.$store.state.subscribed">
                            <span class="col-sm-6">Current plan</span>
                            <span class="col-sm-6 font-weight-bold">{{
                              subscriptionInfo.plan
                            }}</span>
                          </div>
                          <div class="row" v-if="!this.$store.state.subscribed">
                            <span class="col-sm-8 p-2">Please Subscribe to a plan in order to update your payment information.</span>
                            <button type="button" v-bind:class="{ 'isDisabled' : this.$store.state.role == 'user'}" class="btn btn btn-fw btn-primary m-2" @click="onUpgrade">View Plans</button>
                          </div>
                          <!-- Card Info -->
                          <div
                            class="row p-2"
                            v-if="this.$store.state.subscribed"
                          >
                            <span class="col-sm-6">Card Ending in </span>
                            <span class="col-sm-6 font-weight-bold"
                              ><span>{{ subscriptionInfo.card_brand }}</span
                              >&bull;&bull;&bull;&bull;{{
                                subscriptionInfo.card_last4
                              }}</span
                            >
                          </div>
                          <!-- Card Info end --> 
                          <div
                            class="row p-2"
                            v-if="this.$store.state.subscribed"
                          >
                            <router-link to="" class="card-link" 
                            v-on:click.native="update.open = true" 
                            v-bind:class="{ 'isDisabled' : this.$store.state.role == 'user'}">
                            Change plan</router-link>

                            <router-link to="" class="card-link" 
                            v-on:click.native="handleModalContent" 
                            v-if="!subscriptionInfo.cancel_at_period_end" 
                            v-bind:class="{ 'isDisabled' : this.$store.state.role == 'user'}">
                            Cancel subscription</router-link>
                          </div>
                        </div>
                        <!-- Update Form -->
                        <div class="w-full pt-4" v-if="update.open">
                            <button type="button" class="close" @click="update.open = false">
                            <span aria-hidden="true">&times;</span>
                            </button>
                            <h5 class="card-title">Update Your Subscription</h5>
                          <form
                            id="payment-form"
                            @submit.prevent="updateSubscription"
                          >
                            <div class="flex flex-wrap -mx-3 mb-3">
                              <div class="w-full px-3 mb-0">
                                <label
                                  class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                  for="grid-first-name"
                                >
                                  Plans
                                </label>
                                <div class="form-group">
                                    <select class="form-control" id="plans" name="plans" v-model="update.newPlan">
                                    <!-- <option value="free" selected>Free</option> -->
                                    <option v-for="item in plans" :value="item" v-bind:key="item.nickname"
                                        >{{ item.nickname }}({{ item.amount }}/{{ item.interval }})
                                        <option value="hidden" v-if="!isHidden">{{ item.formatted }}</option>
                                    </option>
                                    </select> 
                                </div>
                              </div>
                            </div>
                            <div class="form-group mt-3">
                              <button
                                :disabled="!update.newPlan"
                                type="submit"
                                class="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                              >
                                UPDATE PLAN
                              </button>
                            </div>
                          </form>
                        </div>
                        <!-- Update Form End -->
                      </div>
                    </div>
                  </div>
                  <div v-if="subscriptionInfo.invoices && this.$store.state.role !== 'user'"  class="col-md-12">
                  <h6 class="card-title">Invoices</h6>
                    <div class="col-md-8 grid-margin stretch-card">
                      <b-table :items="subscriptionInfo.invoices" id="table-list" responsive>
                        <template v-slot:cell(Invoice)="data">
                          <b-link :href="data.value" class="btn btn-outline-boostack btn-icon-text" role="button" ><i class="icon-doc btn-icon-append"></i>Download</b-link>
                        </template>
                      </b-table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
        <!-- DELETE USER MODAL -->
    <div v-if="modal.open" class="users-modal">
      <transition name="model">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <span>{{modal.title}}</span>
                  <button
                    type="button"
                    class="close"
                    @click="modal.open = false"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <form class="custom-form" v-on:submit.prevent="handleModalfunction">
                    <div>
                      <span><span>{{modal.body}}</span>
                      {{ subscriptionInfo.plan }} Plan?</span>
                    </div>
                    <br />
                    <div align="center">
                      <input
                        type="submit"
                        class="btn btn-outline-primary btn-icon-text"
                        v-model="modal.actionButton"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- END DELETE USER MODAL -->
  </div>
</template>
<script>
import Breadcrumb from "../account/breadcrumb";
import * as paymentService from "../../services/PaymentService";
import * as auth from "../../services/AuthService";
import { http } from "../../services/HttpService";
//import store from "../../store/index";
export default {
  name: "billing",
  components: {
    Breadcrumb,
  },
  data() {
    return {
      plans: null,
      isHidden: true,
      subscriptionInfo: {
        plan: null,
        card_last4: null,
        card_brand: null,
        current_period_end: null,
        cancel_at_period_end: null,
        subscription_id: null,
        invoices: null
      },
      modal: {
        open: false,
        actionButton: "",
        title: "",
        body: "",
      },
      update: {
        open: false,
        newPlan: null,
      },
    };
  },
  methods: {
    handleModalContent(){
     var subscriptionState = this.subscriptionInfo.cancel_at_period_end
     if(subscriptionState === true){
       this.modal.actionButton = "Reactivate Subscription"
       this.modal.title = "Activate Subscriprion"
       this.modal.body = "Are you sure you want to reactivate"
       this.modal.open = true
     }else{
       this.modal.actionButton = "Cancel Subscription"
       this.modal.title = "Cancel Subscriprion"
       this.modal.body = "Are you sure you want to cancel"
       this.modal.open = true
     }
   },
    handleModalfunction(){
     var subscriptionState = this.subscriptionInfo.cancel_at_period_end
     if(subscriptionState === true){
       this.reactivateSubscription()
     }else{
       this.cancelSubscription()
     }
   },
    showSubscriptionInformation() {
      const stripeCustomerId = this.$store.state.stripeCustomerId;
      paymentService.getSubscriptionInformation(stripeCustomerId).then(
        function(response) {
          if (response) {
            this.subscriptionInfo.subscription_id =
              response.data.subscriptionInfo.subscription_id;
            this.subscriptionInfo.plan = this.$store.state.plan;
            this.subscriptionInfo.card_last4 =
              response.data.subscriptionInfo.card_last4;
            this.subscriptionInfo.card_brand = response.data.subscriptionInfo.card_brand.toUpperCase();
            this.subscriptionInfo.current_period_end = paymentService.secondsToISOString(
              response.data.subscriptionInfo.current_period_end
            );
            this.subscriptionInfo.cancel_at_period_end =
              response.data.subscriptionInfo.cancel_at_period_end;
          }
        }.bind(this)
      );
    },
    cancelSubscription() {
      this.modal.open = false;
      paymentService
        .cancelSubscription(this.subscriptionInfo.subscription_id)
        .then((response) => {
          return response;
        })
        .then((cancelSubscriptionResponse) => {
          //auth.setToken(cancelSubscriptionResponse.data.payload)
          // Display to the user that the subscription has been cancelled.
          this.$router.go(0)
          this.$swal.fire({
            position: "top-end",
            icon: "success",
            title: cancelSubscriptionResponse.data.message,
            showConfirmButton: false,
            timer: 2000,
          });
          console.log(cancelSubscriptionResponse.data.message);
        });
    },
    reactivateSubscription() {
      this.modal.open = false
      paymentService.reactivateSubscription(this.subscriptionInfo.subscription_id).then((response) => {
        return response;
      }) 
      .then((reactivateSubscriptionResponse) => {
        //auth.setToken(reactivateSubscriptionResponse.data.payload)
        // Display to the user that the subscription has been cancelled.
        this.$router.go(0)
        this.$swal.fire({
          position: "top-end",
          icon: "success",
          title: reactivateSubscriptionResponse.data.message,
          showConfirmButton: false,
          timer: 2000,
        });
      });
    },
    updateSubscription() {
      const newPrice = JSON.parse(this.update.newPlan.formatted);
      if(newPrice.nickname === this.$store.state.plan){
        this.$swal.fire({
                position: "top-end",
                icon: "info",
                title: `You are already on ${newPrice.nickname} plan.`,
                showConfirmButton: false,
                timer: 2000,
        });
        return;
      }  
      const subscriptionId = this.subscriptionInfo.subscription_id
      const stripeCustomerId = this.$store.state.stripeCustomerId;
      paymentService.updateSubscription(newPrice.id, subscriptionId,stripeCustomerId).then((response) => {
        return response;
      }) 
      .then((updateSubscriptionResponse) => {
        auth.setSession(updateSubscriptionResponse.data.payload)
        // Display to the user that the subscription has been updated.
        this.$router.go(0)
        this.$swal.fire({
          position: "top-end",
          icon: "success",
          title: updateSubscriptionResponse.data.message,
          showConfirmButton: false,
          timer: 2000,
        });
      }); 
    },
    onUpgrade() {
      http()
        .get("/check-subscription")
        .then(
          function(response) {
            if (response.status === 200) {
              this.$router.push({name: 'upgrade'}); 
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error.response) {
              auth.updateSession(error.response.data.state.payload);
              this.$swal.fire({
                position: "top-end", 
                icon: "error",
                title: error.response.data.state.message,
                showConfirmButton: false,
                timer: 2000,
              });
            }
          }.bind(this)
        );
    }
  },
  mounted: function() {
    if(this.$store.state.subscribed){
      this.showSubscriptionInformation();
    }
  },
  beforeCreate: function() {
    paymentService
      .getPlans()
      .then(
        function(response) {
          if (response) {
            this.plans = response.data.products[0].plans;
          }
        }.bind(this)
      )
      .catch(function(error) {
        console.log(error);
      });
  },
  beforeMount: function(){
      const cusId = auth.getCustomerId()
      if(!cusId){
        return
      }
      paymentService.getInvoices(cusId).then(
        function(response){
          if (response.data.invoices.length > 0) {
            // the array is defined and has at least one element
            this.subscriptionInfo.invoices = response.data.invoices
          }
        }.bind(this)
      )
  }
};
</script>
<style>
.isDisabled {
  color: currentColor;
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.5;
  text-decoration: none;
}
</style>
