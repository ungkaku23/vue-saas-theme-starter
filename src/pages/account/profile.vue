<template>
  <div>
    <section class="profile mb-4">
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
                        <h4 class="card-title">Profile</h4>
                        <p class="card-description">
                          Edit Your Informations
                        </p>
                        <form
                          enctype="multipart/form-data"
                          class="forms-sample"
                          v-on:submit.prevent="onSubmit"
                        >
                          <div class="image-profile">
                            <img
                              :src="profileImgPath()"
                              class="rounded-circle z-depth-1-half avatar-pic
                            mb-2"
                              alt="example placeholder avatar"
                              width="80px"
                            />
                            <b-form-file
                              @change="onFileChange"
                              v-model="selectedFile"
                              type="file"
                              class="btn btn-mdb-color btn-rounded p-0 mb-4"
                            />
                          </div>
                          <b-form-group label="Name" label-for="input5">
                            <b-form-input
                              v-model="username"
                              type="text"
                              id="input5"
                              placeholder="Name"
                              :class="{
                                'is-invalid': submitted && $v.username.$error,
                              }"
                            ></b-form-input>
                          </b-form-group>
                          <b-form-group
                            label="Email address"
                            label-for="input6"
                          >
                            <b-form-input
                              :disabled="true"
                              v-model="email"
                              type="email"
                              id="input6"
                              placeholder="Email"
                            ></b-form-input>
                          </b-form-group>
                          <button
                            type="submit"
                            class="btn btn-primary btn-icon-text"
                          >
                            Save
                          </button>
                          <div>
                            <span v-if="errorMessage" class="text-danger">{{
                              errorMessage
                            }}</span>
                          </div>
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
import Breadcrumb from "../account/breadcrumb";
import { http } from "../../services/HttpService";
import * as auth from "../../services/AuthService";
import { maxLength, required } from "vuelidate/lib/validators";
export default {
  name: "account",
  components: {
    Breadcrumb,
  },
  data() {
    return {
      imgProfile: this.$store.state.imgProfile,
      selectedFile: null,
      selectedFileUrl: null,
      username: this.$store.state.username,
      email: this.$store.state.email,
      errorMessage: null,
      infoMessage: null,
      submitted: false,
    };
  },
  validations: {
    username: { minLength: maxLength(15), required },
  },
  methods: {
    onSubmit: async function() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      let data = new FormData();
      const file = this.selectedFile;
      /* If user want to update img */
      if (file) {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        const MAX_SIZE = 200000;
        const tooLarge = file.size > MAX_SIZE;
        if (allowedTypes.includes(file.type) && !tooLarge) {
          this.selectedFile = file;
          this.errorMessage = null;
        } else {
          this.errorMessage = tooLarge
            ? `Too large. Max size is ${MAX_SIZE / 1000}kb`
            : "Only images are allowed";
          return;
        }
        data.append("file", file, file.name);
        data.append("username", this.username);
        data.append("email", this.email);
        /* Update use info */
      } else {
        data.append("username", this.username);
        data.append("email", this.email);
      }

      const userId = this.$store.state.userId;

      await http()
        .put(`/user/${userId}`, data)
        .then(
          function(response) {
            if (response) {
              auth.updateSession(response.data.user);
              this.$swal.fire({
                position: "top-end",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 2000,
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
                timer: 2000,
              });
            }
          }.bind(this)
        );
    },
    /* Show choosen file  */
    onFileChange(e) {
      const file = e.target.files[0];
      this.selectedFile = file;
      this.selectedFileUrl = URL.createObjectURL(file);
    },
    /* Default avatar if no img */
    profileImgPath: function() {
      if (this.imgProfile) {
        return this.imgProfile;
      } else {
        return require("@/assets/images/faces/placeholder-avatar.jpg");
      }
    },
  },
};
</script>
