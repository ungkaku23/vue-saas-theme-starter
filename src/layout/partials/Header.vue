<template>
  <b-navbar
    id="template-header"
    class="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row"
    toggleable="false"
  >
    <div class="text-center navbar-brand-wrapper d-flex align-items-center">
      <a class="navbar-brand brand-logo" href="/">
        <img src="@/assets/boostack.png" alt="logo" class="logo-dark" />
        <img src="" alt="logo-light" class="logo-light" />
      </a>
      <a class="navbar-brand brand-logo-mini" href="/"
        ><img src="@/assets/boostack-mini.png" alt="logo"
      /></a>
      <button
        class="navbar-toggler navbar-toggler align-self-center"
        type="button"
        data-toggle="minimize"
        @click="toggleSidebar()"
      >
        <span class="icon-menu"></span>
      </button>
    </div>
    <div class="navbar-menu-wrapper d-flex align-items-center ml-auto ml-lg-0">
      <!-- <h5 class="mb-0 font-weight-medium d-none d-lg-flex">
        {{ this.currentAccountName }}
      </h5> -->
      <ul class="navbar-nav navbar-nav-right">
        <b-nav-item-dropdown
          right
          class="preview-list user-dropdown navbar-dropdown ml-3"
        >
          <template slot="button-content" class="p-0 m-0">
            <div class="nav-link count-indicator message-dropdown p-0 m-0 ml-1">
              <img
                class="img-xs rounded-circle ml-2"
                :src="profileImgPath()"
                alt="Profile image"
              />
              <span class="font-weight-normal">
                {{
                  this.$store.state.username
                    ? this.$store.state.username
                    : "User"
                }}</span
              >
            </div>
          </template>
          <b-dropdown-item>
            <div class="dropdown-header text-center mx-auto d-block">
              <img
                class="img-md rounded-circle"
                :src="profileImgPath()"
                alt="Profile image"
                width="80px"
              />
              <p class="mb-1 mt-2">
                <!-- {{
                  this.$store.state.username
                    ? this.$store.state.username
                    : "User"
                }} -->
                <i class="dropdown-item-icon ti-briefcase text-dark"></i>
                {{ this.currentAccountName }}
              </p>
              <p class="font-weight-light text-muted mb-0">
                {{ this.$store.state.email }}
              </p>
            </div>
          </b-dropdown-item>
          <b-dropdown-item v-for="(tenant, idx) in tenants" :key="idx">
            <router-link
              v-on:click.native="onSwitchTenant(tenant)"
              to="#"
              class="preview-item d-flex align-items-center"
            >
              <i class="dropdown-item-icon ti-briefcase text-dark"></i>
              {{ tenant.name }}
            </router-link>
          </b-dropdown-item>
          <b-dropdown-item>
            <router-link
              :to="{ name: 'account' }"
              class="preview-item d-flex align-items-center"
            >
              <i class="dropdown-item-icon icon-user text-dark"></i> Profile
            </router-link>
          </b-dropdown-item>
          <b-dropdown-item v-on:click.prevent="logout()">
            <a class="preview-item d-flex align-items-center">
              <i class="dropdown-item-icon icon-power text-dark"></i>Sign Out
            </a>
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </ul>
      <button
        class="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
        type="button"
        @click="toggleMobileSidebar()"
      >
        <span class="icon-menu"></span>
      </button>
    </div>
  </b-navbar>
</template>

<script>
import * as auth from "../../services/AuthService";
import { http } from "../../services/HttpService";
export default {
  name: "app-header",
  data() {
    return {
      tenants: [],
      currentAccountName: null,
      imgProfile: this.$store.state.imgProfile,
    };
  },
  methods: {
    onSwitchTenant: function(tenant) {
      this.$bvModal.show("modal-1");

      auth
        .switchTenant(tenant._id, this.$store.state.userId)
        .then(
          async function(response) {
            if (response) {
              await auth.setSession(response.data.user);
              await this.$store.dispatch("authenticate"),
                await this.$store.dispatch("confirmEmail"),
                this.$router.go(this.$router.currentRoute);
              this.$bvModal.hide("modal-1");
            }
          }.bind(this)
        )
        .catch(function(error) {
          console.log(error.message);
        });
    },
    logout: function() {
      auth.logout();
      //const path = "/";
      //if (this.$route.path !== path) {
      this.$router.push({ name: "login" });
      //}
    },
    profileImgPath: function() {
      if (this.imgProfile) {
        return this.imgProfile;
      } else {
        return require("@/assets/images/faces/placeholder-avatar.jpg");
      }
    },
    toggleSidebar: () => {
      document.querySelector("body").classList.toggle("sidebar-icon-only");
    },
    toggleMobileSidebar: () => {
      document.querySelector("#sidebar").classList.toggle("active");
    },
  },
  beforeMount() {
    http()
      .get("/accounts")
      .then(
        function(response) {
          if (response) {
            this.tenants = response.data.tenants.accounts;
            let currentAccount = this.tenants.find(
              (obj) => obj._id == this.$store.state.accountId
            );
            this.currentAccountName = currentAccount.name;
          }
        }.bind(this)
      )
      .catch(function(error) {
        console.log(error.message);
      });
  },
};
</script>
