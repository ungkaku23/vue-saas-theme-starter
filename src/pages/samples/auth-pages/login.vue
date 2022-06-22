<template>
  <section class="login">
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
                <h4>Login</h4>
                <form class="pt-3" v-on:submit.prevent="handleSubmit">
                  <div class="form-group">
                    <input
                      v-model="email"
                      type="email"
                      class="form-control form-control-lg rounded shadow-sm"
                      id="exampleInputEmail1"
                      placeholder="Email"
                    />
                  </div>
                  <div class="form-group">
                    <input
                      v-model="password"
                      type="password"
                      class="form-control form-control-lg rounded shadow-sm"
                      id="exampleInputPassword1"
                      placeholder="Password"
                      autocomplete="true"
                    />
                  </div>
                  <span v-if="this.errorMessage" class="text-danger">{{
                    errorMessage
                  }}</span>
                  <div class="form-group mt-3">
                    <button
                      type="submit"
                      class="btn btn-block btn-boostack btn-lg font-weight-medium auth-form-btn"
                    >
                      SIGN IN
                    </button>
                  </div>
                  <div
                    class="my-2 d-flex justify-content-between align-items-center"
                  >
                    <!-- Use keep me logged in -->
                    <!-- <div class="form-check">
                      <label class="form-check-label text-muted">
                        <input type="checkbox" class="form-check-input" />
                        Keep me logged in
                        <i class="input-helper"></i>
                      </label>
                    </div> -->
                    <router-link
                      :to="{ name: 'forgot-password' }"
                      class="auth-link text-black"
                      >Forgot password?</router-link
                    >
                  </div>
                  <!-- Google Btn -->
                  <!-- <div class="mb-2">
                    <button
                      type="button"
                      class="btn btn-block btn-google auth-form-btn"
                    >
                      <i class=" icon-social-google mr-2"></i>Connect using
                      google
                    </button>
                  </div> -->
                  <div class="text-center mt-4 font-weight-light">
                    Not a member yet?
                    <router-link
                      :to="{ name: 'register' }"
                      class="text-boostack"
                      >Register now</router-link
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
import * as auth from "../../../services/AuthService";
import { http } from "../../../services/HttpService";
export default {
  name: "login",
  data: function() {
    return {
      email: "",
      password: "",
      errorMessage: null,
    };
  },
  methods: {
    async handleSubmit() {
      const user = {
        email: this.email,
        password: this.password,
      };
      if (this.$route.params.invitation) {
        this.loginByInvitation(this.$route.params.invitation, user);
      } else {
        this.onLogin(user);
      }
    },
    onLogin: async function(user) {
      await auth
        .login(user)
        .then(() =>
          this.$router.push(this.$route.query.redirect || { name: "dashboard" })
        )
        //this.$router.push({ name: "dashboard" });
        .catch(
          function(error) {
            if (error.response) {
              this.errorMessage = error.response.data.message;
            }
          }.bind(this)
        );
    },
    loginByInvitation: function(token, user) {
      http()
        .post(`/login-invitation/${token}`, user)
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
};
</script>
