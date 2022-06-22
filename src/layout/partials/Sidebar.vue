<template>
  <section class="app-sidebar">
    <nav class="sidebar sidebar-offcanvas" id="sidebar">
      <ul class="nav">
        <li class="nav-item navbar-brand-mini-wrapper">
          <a class="nav-link navbar-brand brand-logo-mini" href="#"
            ><img
              src="@/assets/boostack-mini-white.png"
              alt="logo"
              height="30px"
          /></a>
        </li>
        <li class="nav-item nav-profile">
          <a href="#" class="nav-link">
            <div class="profile-image">
              <img
                class="img-xs rounded-circle"
                :src="profileImgPath()"
                alt="profile image"
              />
              <!-- <div class="dot-indicator bg-success"></div> -->
            </div>
            <div class="text-wrapper">
              <p class="profile-name">
                {{
                  this.$store.state.username
                    ? this.$store.state.username
                    : "User"
                }}
              </p>
              <p class="designation">{{ this.$store.state.role }}</p>
            </div>
          </a>
        </li>
        <li class="nav-item nav-category">
          <span class="nav-link">Dashboard</span>
        </li>
        <li class="nav-item" v-on:click="collapseAll">
          <router-link
            class="nav-link"
            :to="{ name: 'dashboard' }"
            @click.native="sidebarInlineButtonClick"
          >
            <span class="menu-title">Dashboard</span>
            <i class="ti-eye menu-icon"></i>
          </router-link>
        </li>
        <li class="nav-item nav-category">
          <span class="nav-link">Account</span>
        </li>
        <li class="nav-item">
          <span class="nav-link" v-b-toggle="'ui-basic'">
            <span class="menu-title">Profile</span>
            <i class="ti-user menu-icon"></i>
          </span>
          <b-collapse accordion="sidebar-accordion" id="ui-basic">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <router-link
                  class="nav-link"
                  :to="{ name: 'account' }"
                  @click.native="sidebarInlineButtonClick"
                  >Personal Information</router-link
                >
              </li>
              <li class="nav-item">
                <router-link
                  class="nav-link"
                  :to="{ name: 'password' }"
                  @click.native="sidebarInlineButtonClick"
                  >Edit Password</router-link
                >
              </li>
            </ul>
          </b-collapse>
        </li>
        <li class="nav-item">
          <span class="nav-link" v-b-toggle="'charts-dropdown'">
            <span class="menu-title">Team</span>
            <i class="ti-basketball menu-icon"></i>
          </span>
          <b-collapse accordion="sidebar-accordion" id="charts-dropdown">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <router-link
                  class="nav-link"
                  :to="{ name: 'team' }"
                  @click.native="sidebarInlineButtonClick"
                  >Team</router-link
                >
              </li>
            </ul>
          </b-collapse>
        </li>
        <li class="nav-item">
          <span class="nav-link" v-b-toggle="'table-dropdown'">
            <span class="menu-title">Billing</span>
            <i class="ti-wallet menu-icon"></i>
          </span>
          <b-collapse accordion="sidebar-accordion" id="table-dropdown">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <router-link
                  class="nav-link"
                  :to="{ name: 'billing' }"
                  @click.native="sidebarInlineButtonClick"
                  >Billing Information</router-link
                >
              </li>
            </ul>
          </b-collapse>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script>
export default {
  name: "sidebar",
  data() {
    return {
      collapses: [{ show: false }, { show: false }, { show: false }],
      imgProfile: this.$store.state.imgProfile,
    };
  },

  methods: {
    sidebarInlineButtonClick() {
      document.querySelector("#sidebar").classList.toggle("active");
    },
    collapseAll() {
      var exp_element = document.getElementsByClassName("show");
      if (exp_element.length > 0) {
        var elm_id = exp_element[0].id;
        this.$root.$emit("bv::toggle::collapse", elm_id);
      }
    },
    profileImgPath: function() {
      if (this.imgProfile) {
        return this.imgProfile;
      } else {
        return require("@/assets/images/faces/placeholder-avatar.jpg");
      }
    },
  },
  mounted() {
    const body = document.querySelector("body");
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    document.querySelectorAll(".sidebar .nav-item").forEach(function(el) {
      el.addEventListener("mouseover", function() {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.add("hover-open");
        }
      });
      el.addEventListener("mouseout", function() {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.remove("hover-open");
        }
      });
    });
  },
};
</script>
