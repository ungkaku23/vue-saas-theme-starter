<template>
  <section class="register">
    <div class="container-fluid">
      <div class="row btn-boostack-color">
        <b-navbar variant="faded">
          <b-navbar-brand href="/">
            <img
              src="@/assets/boostack-white.png"
              alt="boostack.io"
              class="navbar-logo"
              width="100px"
            />
          </b-navbar-brand>
        </b-navbar>
      </div>
    </div>
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
                <h4>Welcome to Boostack</h4>
                <h6 class="font-weight-light">
                  Let's make your SaaS awesome!
                </h6>
                <form class="pt-3" @submit.prevent="handleSubmit">
                  <div class="form-group">
                    <input
                      type="text"
                      v-model="user.username"
                      class="form-control form-control-lg rounded shadow-sm"
                      id="username"
                      placeholder="Username"
                      :class="{
                        'is-invalid': submitted && $v.user.username.$error,
                      }"
                    />
                    <div
                      v-if="submitted && !$v.user.username.required"
                      class="invalid-feedback"
                    >
                      Username is required
                    </div>
                  </div>
                  <div class="form-group">
                    <input
                      type="email"
                      v-model="user.email"
                      class="form-control form-control-lg rounded shadow-sm"
                      id="exampleInputEmail1"
                      placeholder="Email"
                      :class="{
                        'is-invalid': submitted && $v.user.email.$error,
                      }"
                      v-on:keyup="check"
                    />
                    <span class="text-danger" v-if="!email_availability"
                      >An account with this email address already exists. Please
                      login to continue.</span
                    >
                    <div
                      v-if="submitted && $v.user.email.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.user.email.required"
                        >Email is required</span
                      >
                      <span v-if="!$v.user.email.email">Email is invalid</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <input
                      type="password"
                      v-model="user.password"
                      class="form-control form-control-lg rounded shadow-sm"
                      id="exampleInputPassword1"
                      placeholder="Password"
                      autocomplete="true"
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
                      class="form-control form-control-lg rounded shadow-sm"
                      id="exampleInputPassword2"
                      placeholder="Confirm Password"
                      autocomplete="true"
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
                      <span v-else-if="!$v.user.confirmPassword.sameAsPassword"
                        >Passwords must match</span
                      >
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="form-check">
                      <label class="form-check-label text-muted">
                        <input type="checkbox" class="form-check-input" />
                        By signing up, I agree to Boostack's Terms of service
                        <i class="input-helper"></i>
                      </label>
                    </div>
                  </div>
                  <div class="form-group mt-3">
                    <button
                      :disabled="!email_availability"
                      class="btn btn-block btn-boostack btn-lg font-weight-medium auth-form-btn"
                    >
                      SIGN UP
                    </button>
                  </div>
                  <div class="text-center mt-4 font-weight-light">
                    Already registered?
                    <router-link :to="{ name: 'login' }" class="text-boostack"
                      >Login</router-link
                    >
                  </div>
                </form>
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
  name: "register",
  data() {
    return {
      user: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        stripe_id: "",
        stripe_subscription_id: "",
      },
      email_availability: true,
      submitted: false,
      invitation: null,
    };
  },
  validations: {
    user: {
      username: { required },
      email: { required, email },
      password: { required, minLength: minLength(6) },
      confirmPassword: { required, sameAsPassword: sameAs("password") },
    },
  },
  methods: {
    //Check Email Availability Async
    check: function() {
      var email = this.user.email.trim();
      if (email.length > 2) {
        http()
          .post("/user/checkemail/", {
            email: email,
          })
          .then(
            function(response) {
              if (response.data.is_exist === "no") {
                this.email_availability = true;
                this.is_disable = false;
              } else {
                this.email_availability = false;
                this.is_disable = true;
              }
            }.bind(this)
          )
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    //Register Here
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
        username: this.user.username,
      };
      if (this.$route.params.invitation) {
        this.registerByInvitation(this.$route.params.invitation, user);
      } else {
        this.register(user);
      }
    },
    register: function(user) {
      //Register And Automaticaly Login The User
      auth
        .registerUser(user)
        .then(
          function(response) {
            if (response) {
              auth.setSession(response.data.user);
              this.$router.push({ name: "dashboard" });
            }
          }.bind(this)
        )
        .catch(function(error) {
          console.log(error);
        });
    },
    registerByInvitation: function(token, user) {
      http()
        .post(`/register-invitation/${token}`, user)
        .then(
          function(response) {
            if (response) {
              auth.setSession(response.data.user);
              this.$router.push({ name: "dashboard" });
            }
          }.bind(this)
        )
        .catch(function(error) {
          console.log(error);
        });
    },
  },
  //Check Invitation State Before showing form and Prefill Email Adresse
  beforeMount() {
    const invitation = this.$route.params.invitation;
    if (!invitation) {
      return;
    }
    const user = {
      token: invitation,
    };
    http()
      .get(`/checkstate/${user.token}`)
      .then(
        function(response) {
          if (response) {
            this.user.email = response.data.invitation.email;
          }
        }.bind(this)
      )
      .catch(
        function(error) {
          if (error.response) {
            console.log("ERROR", error.response);
          }
        }.bind(this)
      );
  },
};
</script>
