<template>
  <div>
    <section class="password mb-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body pl-3 pr-3">
              <div class="row justify-content-center">
                <div class="col-lg-12">
                  <div class="border-bottom text-center pb-4">
                    <Breadcrumb />
                  </div>
                  <div class="col-md-4 grid-margin stretch-card">
                    <div class="card">
                      <div class="card-body pl-0 pr-0">
                        <h4 class="card-title">Password</h4>
                        <p class="card-description">
                          Change Your Password
                        </p>
                        <form
                          class="forms-sample"
                          v-on:submit.prevent="handleSubmit"
                        >
                          <b-form-group label="OLD PASSWORD" label-for="input1">
                            <b-form-input
                              autocomplete="true"
                              v-model="user.oldPassword"
                              type="password"
                              id="input5"
                              placeholder="Enter your old password"
                              :class="{
                                'is-invalid':
                                  submitted && $v.user.oldPassword.$error,
                              }"
                            ></b-form-input>
                            <div
                              v-if="submitted && $v.user.oldPassword.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.user.oldPassword.required"
                                >Old Password is required</span
                              >
                              <span v-if="!$v.user.oldPassword.minLength"
                                >Password must be at least 6 characters</span
                              >
                            </div>
                            <span v-if="errorMessage" class="text-danger">{{
                              errorMessage
                            }}</span>
                          </b-form-group>
                          <b-form-group label="NEW PASSWORD" label-for="input6">
                            <b-form-input
                              autocomplete="true"
                              v-model="user.newPassword"
                              type="password"
                              id="input2"
                              placeholder="Enter your new password"
                              :class="{
                                'is-invalid':
                                  submitted && $v.user.newPassword.$error,
                              }"
                            ></b-form-input>
                            <div
                              v-if="submitted && $v.user.newPassword.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.user.newPassword.required"
                                >New Password is required</span
                              >
                              <span v-if="!$v.user.newPassword.minLength"
                                >Password must be at least 6 characters</span
                              >
                            </div>
                          </b-form-group>
                          <button
                            type="submit"
                            class="btn btn-primary btn-icon-text"
                          >
                            Update
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import Breadcrumb from "./breadcrumb";
import { required, minLength } from "vuelidate/lib/validators";
import { http } from "../../services/HttpService";
export default {
  name: "password",
  data() {
    return {
      user: {
        oldPassword: "",
        newPassword: "",
      },
      submitted: false,
      infoMessage: null,
      errorMessage: null,
    };
  },
  validations: {
    user: {
      oldPassword: { required, minLength: minLength(6) },
      newPassword: { required, minLength: minLength(6) },
    },
  },
  components: {
    Breadcrumb,
  },
  methods: {
    handleSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.errorMessage = null;
      const userID = this.$store.state.userId;
      const pwd = {
        newPass: this.user.newPassword,
        oldPass: this.user.oldPassword,
      };
      http()
        .put(`/user-password/${userID}`, pwd)
        .then(
          function(response) {
            if (response) {
              /* Error message within form */
              //this.infoMessage = response.data.message;
              this.$swal.fire({
                position: "top-end",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 3000,
              });
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error.response) {
              this.errorMessage = error.response.data.message;
              this.$swal.fire({
                position: "top-end",
                icon: "error",
                title: error.response.data.message,
                showConfirmButton: false,
                timer: 3000,
              });
            }
          }.bind(this)
        );
    },
  },
};
</script>
