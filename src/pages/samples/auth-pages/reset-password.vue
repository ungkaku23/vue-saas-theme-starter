<template>
  <section class="reset">
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth ">
          <div class="row w-100 flex-grow">
            <div class="col-xl-4 col-lg-6 mx-auto">
              <div class="auth-form-light text-left p-5 rounded shadow-sm">
                <div class="brand-logo">
                  <img src="@/assets/boostack.png" />
                </div>
                <div
                  v-if="success"
                  class="jumbotron"
                  style="background:transparent !important"
                >
                  <p class="lead">
                    {{ infoMessage }}
                  </p>
                  <hr class="my-4" />
                  <p>
                    Continue to your account.
                  </p>
                  <router-link
                    class="btn btn-block btn-boostack btn-lg font-weight-medium auth-form-btn"
                    :to="{ name: 'login' }"
                  >
                    Login
                  </router-link>
                </div>
                <div v-if="!success">
                  <h4>Reset Yout password</h4>
                  <h6 class="font-weight-light">let's get started!</h6>
                  <form class="pt-3" v-on:submit.prevent="handleSubmit">
                    <div v-if="errorMessage" class="ml-2">
                      <div class="alert alert-danger">{{ errorMessage }}</div>
                    </div>
                    <div class="form-group">
                      <input
                        v-model="user.password"
                        type="password"
                        class="form-control form-control-lg rounded shadow-sm"
                        id="exampleInputPassword1"
                        placeholder="New Password"
                        :class="{
                          'is-invalid': submitted && $v.user.password.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.user.password.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.user.password.required"
                          >Password is required</span
                        >
                        <span v-if="!$v.user.password.minLength"
                          >Password must be at least 6 characters</span
                        >
                      </div>
                    </div>
                    <div class="form-group">
                      <input
                        v-model="user.confirmPassword"
                        type="password"
                        class="form-control form-control-lg rounded shadow-sm"
                        id="exampleInputPassword2"
                        placeholder="Confirm Password"
                        :class="{
                          'is-invalid':
                            submitted && $v.user.confirmPassword.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.user.confirmPassword.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.user.confirmPassword.required"
                          >Confirm Password is required</span
                        >
                        <span
                          v-else-if="!$v.user.confirmPassword.sameAsPassword"
                          >Passwords must match</span
                        >
                      </div>
                    </div>
                    <div class="form-group mt-3">
                      <button
                        type="submit"
                        class="btn btn-block btn-boostack btn-lg font-weight-medium auth-form-btn"
                      >
                        SUBMIT
                      </button>
                    </div>
                    <div class="text-center mt-4 font-weight-light">
                      <router-link :to="{ name: 'login' }" class="text-boostack"
                        >Sign in existing account</router-link
                      >
                    </div>
                  </form>
                </div>
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
import { required, minLength, sameAs } from "vuelidate/lib/validators";
import * as auth from "../../../services/AuthService";
export default {
  name: "reset-password",
  data() {
    return {
      user: {
        password: "",
        confirmPassword: "",
      },
      submitted: false,
      infoMessage: "",
      errorMessage: "",
      success: null,
    };
  },
  validations: {
    user: {
      password: { required, minLength: minLength(6) },
      confirmPassword: { required, sameAsPassword: sameAs("password") },
    },
  },
  methods: {
    handleSubmit: function() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      const token = this.$route.params.token;
      const user = {
        resetLink: token,
        newPass: this.user.password,
      };
      auth
        .resetPassword(user)
        .then(
          function(response) {
            if (response) {
              this.infoMessage = response.data.message;
              this.success = true;
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error.response) {
              this.errorMessage = error.response.data.message;
              this.success = false;
            }
          }.bind(this)
        );
    },
  },
};
</script>
