<template>
  <section class="main-view">
    <div class="container-scroller">
      <Header />
      <div class="container-fluid page-body-wrapper">
        <Sidebar />
        <div class="main-panel">
          <b-modal id="modal-1" title="Switching Account" :hide-footer="true">
            <b-spinner label="Loading..."></b-spinner>
            <p class="my-4">Please wait to load your account data...</p>
          </b-modal>
          <div class="content-wrapper">
            <router-view></router-view>
          </div>
          <!-- content wrapper ends -->
          <Footer />
        </div>
        <!-- main panel ends -->
      </div>
      <!-- page-body-wrapper ends -->
    </div>
  </section>
</template>

<script>
import Header from "./partials/Header";
import Sidebar from "./partials/Sidebar";
import Footer from "./partials/Footer";
export default {
  name: "layout",
  components: {
    Header,
    Sidebar,
    Footer,
  },
};
</script>
