<template>
  <section class="forgot-password">
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth">
          <div class="row w-100 flex-grow">
            <div class="col-xl-4 col-lg-6 mx-auto">
              <div class="auth-form-light text-left p-5 rounded shadow">
                <div class="brand-logo">
                  <router-link :to="{ name: 'landing-page' }">
                    <img src="@/assets/boostack.png" />
                  </router-link>
                </div>
                <div v-if="!infoMessage">
                  <h4>Forgot Password?</h4>
                  <h6 class="font-weight-light">
                    A password reset link will be sent to your email to reset
                    your password. If you don't get an email within a few
                    minutes, please re-try.
                  </h6>
                  <form class="pt-3" v-on:submit.prevent="onSubmit">
                    <div class="form-group">
                      <input
                        v-model="user.email"
                        type="email"
                        class="form-control form-control-lg rounded shadow-sm"
                        id="exampleInputEmail1"
                        placeholder="Enter your email"
                      />
                    </div>
                    <span v-if="this.errorMessage" class="text-danger">{{
                      errorMessage
                    }}</span>
                    <div class="form-group mt-3">
                      <button
                        type="submit"
                        class="btn btn-block btn-boostack btn-lg font-weight-medium"
                      >
                        Send me reset password instructions
                      </button>
                    </div>
                    <div class="text-center mt-4 font-weight-light">
                      Don't have an account?
                      <router-link
                        :to="{ name: 'register' }"
                        class="text-boostack"
                        >Create</router-link
                      >
                    </div>
                  </form>
                </div>
                <!-- Mail has been sent -->
                <div v-if="infoMessage">
                  <h5 class="Lead">{{ infoMessage }}</h5>
                  <div class="text-center mt-4 font-weight-light">
                    <router-link :to="{ name: 'login' }" class="text-boostack"
                      >Login</router-link
                    >
                  </div>
                  <div class="text-center">
                    <span class="small"
                      >Problems or questions? <br />
                      contact@boostack.io</span
                    >
                  </div>
                </div>
                <!-- Mail has been sent end -->
              </div>
            </div>
          </div>
        </div>
        <!-- content-wrapper ends -->
      </div>
      <!-- page-body-wrapper ends -->
    </div>
  </section>
</template>
<script>
import * as auth from "../../../services/AuthService";
export default {
  name: "resetpassword",
  data() {
    return {
      user: {
        email: "",
      },
      infoMessage: null,
      errorMessage: null,
    };
  },
  methods: {
    onSubmit: async function() {
      const user = {
        email: this.user.email,
      };
      auth
        .forgotPassword(user)
        .then((res) => (this.infoMessage = res.data.message))
        .catch(
          function(error) {
            if (error.response) {
              this.errorMessage = error.response.data.message;
            }
          }.bind(this)
        );
    },
  },
};
</script>
