import Vue from "vue";
import Vuex from "vuex";
import * as auth from "../services/AuthService";

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    isLoggedIn: false,
    //apiUrl: `${window.location.protocol}//${window.location.hostname}:3001/api`,
    apiUrl: `${process.env.VUE_APP_API_URL}/api`,
    username: null,
    userId: null,
    email: null,
    role: null,
    confirmed: null,
    roles: ["admin", "user"],
    subscribed: null,
    plan: null,
    stripeCustomerId: null,
    accountId: null,
    imgProfile: null,
  },
  mutations: {
    authenticate(state) {
      state.isLoggedIn = auth.isLoggedIn();
      if (state.isLoggedIn) {
        state.accountId = auth.getAccountId();
        state.username = auth.getUsername();
        state.userId = auth.getUserId();
        state.email = auth.getEmail();
        state.role = auth.getUserRole();
        state.confirmed = auth.getEmailState();
        state.subscribed = auth.getSubStatus();
        state.plan = auth.getUserPlan();
        state.stripeCustomerId = auth.getCustomerId();
        state.imgProfile = auth.getImgProfile();
      } else {
        state.accountId = null;
        state.userId = null;
        state.username = null;
        state.email = null;
        state.role = null;
        state.confirmed = null;
        state.subscription = null;
        state.plan = null;
        state.stripeCustomerId = null;
        state.imgProfile = null;
      }
    },
    confirmEmail(state) {
      state.isLoggedIn = auth.isLoggedIn();
      if (state.isLoggedIn) {
        const initConfirm = localStorage.getItem("confirmed");
        if (initConfirm) {
          state.confirmed = true;
        } else {
          state.confirmed = auth.getEmailState();
        }
      } else {
        state.confirmed = null;
      }
    },
  },
  actions: {
    authenticate(context) {
      context.commit("authenticate");
    },
    confirmEmail(context) {
      context.commit("confirmEmail");
    },
  },
});
