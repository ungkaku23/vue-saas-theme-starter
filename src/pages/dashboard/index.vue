<template>
  <section class="dashboard">
    <!-- Use banner if you want -->
    <!-- <div class="proBanner">
      <div>
        <span class="d-flex align-items-center purchase-popup">
          <p>
            You can toggle this banner for an annoucement for .eg
          </p>
          <a
            href="https://www.Boostack.io"
            rel="noopener noreferrer"
            target="_blank"
            class="btn btn-sm btn-boostack ml-auto"
            >Click here</a
          >
          <i class="mdi mdi-close bannerClose" @click="toggleProBanner()"></i>
        </span>
      </div>
    </div> -->
    <div v-if="!this.$store.state.confirmed">
      <b-alert show dismissible variant="warning">
        <strong>Heads up!</strong>
        Check your email for a link to confirm your email address.
        <router-link to="" v-on:click.native="init">Click here</router-link>
        if you still can't find it
      </b-alert>
    </div>
    <div class="row">
      <div class="col-md-8 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">Churn rate</h4>
            <line-chart :height="250"></line-chart>
          </div>
        </div>
      </div>

      <div class="col-md-4 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">Customer Acquisition Cost</h4>
            <div class="aligner-wrapper py-3">
              <sessiondoughnut :height="300"></sessiondoughnut>
              <div
                class="wrapper d-flex flex-column justify-content-center absolute absolute-center"
              >
                <small
                  class="d-block text-center text-muted  font-weight-semibold mb-0"
                  >CAC by Channel</small
                >
              </div>
            </div>
            <div class="wrapper mt-4 d-flex flex-wrap align-items-cente">
              <div class="d-flex">
                <span
                  class="square-indicator ml-2"
                  style="background-color:#5271ff;"
                ></span>
                <p class="mb-0 ml-2">Organic Search</p>
              </div>
              <div class="d-flex">
                <span
                  class="square-indicator ml-2"
                  style="background-color:#38b6ff;"
                ></span>
                <p class="mb-0 ml-2">Referral</p>
              </div>
              <div class="d-flex">
                <span
                  class="square-indicator ml-2"
                  style="background-color:#5ce1ec;"
                ></span>
                <p class="mb-0 ml-2">Email</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 grid-margin stretch-card">
        <div class="card quick-status-card">
          <div class="card-body">
            <h4 class="card-title">Metrics</h4>
            <div class="row">
              <div class="col-md-6">
                <radial-progress-bar
                  class="ml-auto mr-auto"
                  :diameter="125"
                  :completed-steps="44"
                  :total-steps="100"
                  innerStrokeColor="#eee"
                  startColor="#1bdbe0"
                  stopColor="#1bdbe0"
                  :strokeWidth="10"
                >
                  <p class="circle-progress-value">44</p>
                  <p class="circle-progress-label">Monthly</p>
                </radial-progress-bar>
              </div>
              <div class="col-md-6">
                <radial-progress-bar
                  class="ml-auto mr-auto"
                  :diameter="125"
                  :completed-steps="76"
                  :total-steps="100"
                  innerStrokeColor="#eee"
                  startColor="#5271ff"
                  stopColor="#5271ff"
                  :strokeWidth="10"
                >
                  <p class="circle-progress-value">76</p>
                  <p class="circle-progress-label">Annual</p>
                </radial-progress-bar>
              </div>
            </div>
            <div class="row mt-5">
              <div class="col-12">
                <div class="wrapper py-4 d-flex border-bottom">
                  <span class="icon-holder">
                    <i class="icon-wallet"></i>
                  </span>
                  <div class="ml-3">
                    <p class="mb-1">ARR</p>

                    <h6 class="mb-0">34,701.00</h6>
                  </div>
                  <div class="ml-auto">
                    <i class="icon-arrow-down-circle"></i
                    ><span class="text-muted ml-2">7.87 %</span>
                  </div>
                </div>
                <div class="wrapper py-4 d-flex">
                  <span class="icon-holder">
                    <i class="icon-basket-loaded"></i>
                  </span>
                  <div class="ml-3">
                    <p class="mb-1">MRR</p>
                    <h6 class="mb-0">$19021.00</h6>
                  </div>
                  <div class="ml-auto">
                    <i class="icon-arrow-down-circle"></i
                    ><span class="text-muted ml-2">3.57 %</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import RadialProgressBar from "vue-radial-progress";
import sessiondoughnut from "../../components/dashboard/cacdoughnut";
import lineChart from "../../components/dashboard/lineChart";
import { http } from "../../services/HttpService";

export default {
  name: "dashboard",
  components: {
    sessiondoughnut,
    RadialProgressBar,
    lineChart,
  },
  data() {
    return {
      time1: null,
      time2: null,
    };
  },
  methods: {
    toggleProBanner: () => {
      document.querySelector("body").classList.toggle("pro-banner-collapse");
    },
    ///Mail NOtif confirmation
    init: function() {
      http()
        .post("/auth/email/confirm/sent")
        .then(
          function(response) {
            if (response) {
              this.$swal.fire({
                position: "top-end",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 2000,
              });
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error) {
              this.$swal.fire({
                position: "top-end",
                icon: "error",
                title: error.response.data.message,
                showConfirmButton: false,
                timer: 3000,
              });
            }
          }.bind(this)
        );
    },
  },
};
</script>
