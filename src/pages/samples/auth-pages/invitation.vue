<template>
  <section class="invitation">
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth">
          <div class="row w-100 flex-grow">
            <div class="col-xl-4 col-lg-6 mx-auto">
              <div class="auth-form-light text-left p-5">
                <div class="brand-logo">
                  <img src="@/assets/boostack-mini.png" />
                </div>
                <div
                  v-if="expire.expired"
                  class="jumbotron pr-0 pl-0"
                  style="background:transparent !important"
                >
                  <p class="lead">
                    {{ expire.message }}
                  </p>
                  <hr class="my-4" />
                  <p>
                    Don't have account yet ?
                  </p>
                  <router-link
                    class="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                    :to="{ name: 'register' }"
                  >
                    Get Account
                  </router-link>
                </div>
                <div v-if="!expire.expired">
                  <h4>Account access</h4>
                  <h6 class="font-weight-light">
                    Choose a password for your account
                  </h6>
                  <span v-if="this.errorMessage" class="text-danger">{{
                    errorMessage
                  }}</span>
                  <form class="pt-3" @submit.prevent="handleSubmit">
                    <div class="form-group">
                      <input
                        type="text"
                        v-model="user.name"
                        class="form-control form-control-lg"
                        id="username"
                        placeholder="Username"
                        :class="{
                          'is-invalid': submitted && $v.user.name.$error,
                        }"
                        :disabled="true"
                      />
                      <div
                        v-if="submitted && !$v.user.name.required"
                        class="invalid-feedback"
                      >
                        Username is required
                      </div>
                    </div>
                    <div class="form-group">
                      <input
                        type="email"
                        v-model="user.email"
                        class="form-control form-control-lg"
                        id="exampleInputEmail1"
                        placeholder="Email"
                        :class="{
                          'is-invalid': submitted && $v.user.email.$error,
                        }"
                        :disabled="true"
                      />
                      <div
                        v-if="submitted && $v.user.email.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.user.email.required"
                          >Email is required</span
                        >
                        <span v-if="!$v.user.email.email"
                          >Email is invalid</span
                        >
                      </div>
                    </div>
                    <div class="form-group">
                      <input
                        type="password"
                        v-model="user.password"
                        class="form-control form-control-lg"
                        id="exampleInputPassword1"
                        placeholder="Password"
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
                        type="password"
                        v-model="user.confirmPassword"
                        class="form-control form-control-lg"
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
                    <div class="mb-4">
                      <div class="form-check">
                        <label class="form-check-label text-muted">
                          <input type="checkbox" class="form-check-input" />
                          I agree to all Terms & Conditions
                          <i class="input-helper"></i>
                        </label>
                      </div>
                    </div>
                    <div class="form-group mt-3">
                      <button
                        class="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                      >
                        ACCESS ACCOUNT
                      </button>
                    </div>
                    <div class="text-center mt-4 font-weight-light">
                      Already have an account?
                      <router-link :to="{ name: 'login' }" class="text-primary"
                        >Login</router-link
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
import { required, email, minLength, sameAs } from "vuelidate/lib/validators";
import * as auth from "../../../services/AuthService";
import { http } from "../../../services/HttpService";
export default {
  name: "invitation",
  data() {
    return {
      user: {
        name: null,
        email: null,
        password: "",
        confirmPassword: "",
      },
      submitted: false,
      expire: {
        expired: false,
        message: null,
      },
      errorMessage: null,
    };
  },
  validations: {
    user: {
      name: { required },
      email: { required, email },
      password: { required, minLength: minLength(6) },
      confirmPassword: { required, sameAsPassword: sameAs("password") },
    },
  },
  methods: {
    async handleSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      const user = {
        email: this.user.email,
        password: this.user.password,
        name: this.user.name,
      };
      //Register And Automaticaly Login The User
      http()
        .post(`/invitation/${this.$route.params.token}`, { info: user })
        .then(
          function(response) {
            if (response) {
              this.$swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your account Has Been Created",
                showConfirmButton: false,
                timer: 2000,
              });
              auth.setSession(response.data.user);
              this.$router.push({ name: "dashboard" });
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error.response) {
              this.errorMessage = error.response.data.message;
            }
          }.bind(this)
        );
    },
  },
  //Check Invitation State Before showing form and Prefill Email Adresse
  beforeMount() {
    const token = this.$route.params.token;
    console.log(token);
    const user = {
      token: token,
    };
    http()
      .get(`/checkstate/${user.token}`)
      .then(
        function(response) {
          if (response) {
            console.log("RESPONSE", response);
            this.user.email = response.data.invitation.email;
            this.user.name = response.data.invitation.username;
          }
        }.bind(this)
      )
      .catch(
        function(error) {
          if (error.response) {
            console.log("ERROR", error.response);
            this.expire.message = error.response.data.message;
            this.expire.expired = true;
            this.$swal.fire({
              position: "top-end",
              icon: "error",
              title: error.response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });
          }
        }.bind(this)
      );
  },
};
</script>
