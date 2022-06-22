import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import BootstrapVue from "bootstrap-vue";
import VueSweetalert2 from "vue-sweetalert2";
import VueScrollTo from "vue-scrollto";
import store from "./store";
import Vuelidate from "vuelidate";
Vue.use(Vuelidate);
Vue.use(BootstrapVue);
Vue.use(VueSweetalert2);
Vue.use(VueScrollTo);

Vue.config.productionTip = process.env.NODE_ENV === "production";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
