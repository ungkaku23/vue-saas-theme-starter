<template>
  <div>
    <section class="join">
      <div class="container-scroller">
        <div class="container-fluid page-body-wrapper full-page-wrapper">
          <div class="content-wrapper d-flex align-items-center auth">
            <div class="row w-100 flex-grow">
              <div class="col-xl-4 col-lg-6 mx-auto">
                <div class="auth-form-light text-left p-5 rounded shadow">
                  <div class="brand-logo">
                    <img src="@/assets/boostack.png" />
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
                      class="btn btn-block btn-boostack btn-lg font-weight-medium auth-form-btn"
                      :to="{ name: 'register' }"
                    >
                      Get Account
                    </router-link>
                  </div>
                  <div
                    v-if="!expire.expired"
                    class="jumbotron pr-0 pl-0"
                    style="background:transparent !important"
                  >
                    <p class="lead">
                      Join Your Team
                    </p>
                    <p class="font-weight-bold">You were invited by</p>
                    {{ invitation.invitedBy }}
                    <hr class="my-4" />
                    <div v-if="errorMessage">
                      <span class="text-danger">{{ errorMessage }}</span>
                    </div>
                    <br />
                    <router-link
                      v-bind:class="{
                        isDisabled:
                          this.$store.state.email == invitation.invitedBy,
                      }"
                      class="btn btn-block btn-boostack btn-lg font-weight-medium auth-form-btn"
                      to="#"
                      v-on:click.native="handleJoin"
                    >
                      {{
                        this.$store.state.isLoggedIn
                          ? `Join ${this.invitation.team} as ${this.$store.state.email}`
                          : `Signup to join ${this.invitation.team}`
                      }}
                    </router-link>
                    <br />
                    <p v-if="this.$store.state.isLoggedIn">
                      <a href="#" v-on:click.prevent="logout()"
                        >Logout to join with another user</a
                      >
                    </p>
                    <p v-if="!this.$store.state.isLoggedIn">
                      <a href="#" v-on:click.prevent="logout()"
                        >Join with existing account</a
                      >
                    </p>
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
  </div>
</template>
<script>
import { http } from "../../../services/HttpService";
import * as auth from "../../../services/AuthService";
export default {
  name: "join-team",
  data() {
    return {
      invitation: {
        email: null,
        invitedBy: null,
        team: null,
        role: null,
        username: null,
      },
      token: null,
      expire: {
        expired: false,
        message: null,
      },
      errorMessage: null,
    };
  },
  methods: {
    handleJoin: function() {
      if (this.$store.state.isLoggedIn) {
        const user = {
          email: this.$store.state.email,
          existingUser: true,
        };
        http()
          .post(`/invitation/${this.$route.params.token}`, { info: user })
          .then(
            function(response) {
              if (response) {
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
      } else {
        const invitation = this.$route.params.token;
        this.$router.push({ name: "register", params: { invitation } });
      }
    },
    logout: function() {
      const invitation = this.$route.params.token;
      auth.logout();
      this.$router.push({ name: "login", params: { invitation } });
    },
  },
  beforeMount() {
    http()
      .get(`/checkstate/${this.$route.params.token}`)
      .then(
        function(response) {
          if (response) {
            console.log("RESPONSE", response);
            this.invitation.invitedBy = response.data.invitation.invitedBy;
            this.invitation.email = response.data.invitation.email;
            this.invitation.team = response.data.invitation.team;
            this.invitation.role = response.data.invitation.role;
            this.invitation.username = response.data.invitation.username;
          }
        }.bind(this)
      )
      .catch(
        function(error) {
          if (error.response) {
            console.log("ERROR", error.response);
            this.expire.message = error.response.data.message;
            this.expire.expired = true;
          }
        }.bind(this)
      );
  },
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
