<template>
  <div>
    <div class="iq-card">
      <div class="iq-card-body p-0">
        <div class="iq-edit-list">
          <ul class="iq-edit-profile d-flex nav nav-pills">
            <li class="col-md-3 p-0">
              <router-link
                class="nav-link"
                :to="{ name: 'account' }"
                exact-active-class="exact-active"
              >
                Personal Information
              </router-link>
            </li>
            <li class="col-md-3 p-0">
              <router-link
                class="nav-link"
                :to="{ name: 'password' }"
                exact-active-class="exact-active"
                >Change Password</router-link
              >
            </li>
            <!-- Hide Team for user role if you want -->
            <!-- v-if="!(role === 'user')" -->
            <li class="col-md-3 p-0">
              <router-link
                class="nav-link"
                :to="{ name: 'team' }"
                exact-active-class="exact-active"
                >Team</router-link
              >
            </li>
            <li class="col-md-3 p-0">
              <router-link
                class="nav-link"
                :to="{ name: 'billing' }"
                exact-active-class="exact-active"
                >Billing</router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.iq-card .exact-active {
  color: #5271ff;
  border: solid 1px #5271ff;
}
</style>
<script>
export default {
  name: "breadcrumb",
  data() {
    return {
      role: this.$store.state.role,
    };
  },
  methods: {},
  components: {},
};
</script>
