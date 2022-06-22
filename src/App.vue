<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  components: {},
  //Before Create Check Authenticate State
  beforeCreate: function() {
    this.$store.dispatch("authenticate");
    this.$store.dispatch("confirmEmail");
  },
};
</script>

<style lang="scss">
@import "../node_modules/@mdi/font/css/materialdesignicons.min.css";
@import "../node_modules/font-awesome/css/font-awesome.min.css";
@import "../node_modules/simple-line-icons/css/simple-line-icons.css";
@import "../node_modules/ti-icons/css/themify-icons.css";
@import "../node_modules/sweetalert2/dist/sweetalert2.min.css";
@import "./assets/scss/style";
</style>
