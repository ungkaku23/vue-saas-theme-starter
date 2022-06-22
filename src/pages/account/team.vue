<template>
  <div>
    <section class="users-table mb-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body pl-3 pr-3">
              <div class="row justify-content-center">
                <div class="col-lg-12">
                  <div class="border-bottom text-center pb-4">
                    <Breadcrumb />
                  </div>
                  <!-- TABLE -->
                  <div class="col-md-12 grid-margin stretch-card">
                    <div class="card">
                      <div class="card-body pl-0 pr-0">
                        <h4 class="card-title">Manage Members</h4>
                        <div class="container">
                          <button
                            type="button"
                            :disabled="this.$store.state.role == 'user'"
                            class="btn btn-primary btn-icon-text pull-right"
                            @click="openAddModal"
                          >
                            <i class="mdi mdi-account-multiple-plus"></i>
                            Invite a Member
                          </button>
                          <table>
                            <thead>
                              <input
                                v-model="searchQuery"
                                class="form-control float-right mb-1"
                                id="tableSearch"
                                type="text"
                                placeholder="Search"
                              />
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(item, index) in filteredRows.slice(
                                  pageStart,
                                  pageStart + countOfPage
                                )"
                                :key="`user-${index}`"
                              >
                                <td class="d-none">{{ item._id }}</td>
                                <td>{{ item.user.username }}</td>
                                <td>{{ item.user.email }}</td>
                                <td>
                                  <span class="badge badge-info">
                                    {{ item.access }}</span
                                  >
                                </td>
                                <td>
                                  <a
                                    @click="openEditModal(item)"
                                    class="edit"
                                    href="#"
                                    title="edit"
                                    data-toggle="tooltip"
                                  >
                                    <i class="mdi mdi-table-edit"></i>
                                  </a>
                                  <a
                                    href="#"
                                    class="delete"
                                    title="Delete"
                                    data-toggle="tooltip"
                                    @click="openDeleteModal(item)"
                                    ><i class="mdi mdi-delete-forever"></i
                                  ></a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <nav aria-label="Page navigation example">
                            <ul class="pagination justify-content-center">
                              <li
                                class="page-item"
                                v-bind:class="{ disabled: currPage === 1 }"
                                @click.prevent="setPage(currPage - 1)"
                              >
                                <a class="page-link" href="">Prev</a>
                              </li>
                              <li
                                class="page-item"
                                v-for="n in totalPage"
                                :key="n"
                                v-bind:class="{ active: currPage === n }"
                                @click.prevent="setPage(n)"
                              >
                                <a class="page-link" href="">{{ n }}</a>
                              </li>
                              <li
                                class="page-item"
                                v-bind:class="{
                                  disabled: currPage === totalPage,
                                }"
                                @click.prevent="setPage(currPage + 1)"
                              >
                                <a class="page-link" href="">Next</a>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="spinner-border text-primary"
                    role="status"
                    v-if="loadingTable"
                  >
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- ADD MEMBER MODAL -->
    <div v-if="addModal.myModal" class="users-modal">
      <transition name="model">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <span>Sending Invite Email</span>
                  <button
                    type="button"
                    class="close"
                    @click="addModal.myModal = false"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <span v-if="addModal.errorMessage" class="text-danger">{{
                    addModal.errorMessage
                  }}</span>
                  <form class="custom-form" v-on:submit.prevent="addUser">
                    <div class="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="addModal.name"
                        :class="{
                          'is-invalid': submitted && $v.addModal.name.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.addModal.name.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.addModal.name.required"
                          >Name is required</span
                        >
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Email</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="addModal.email"
                        :class="{
                          'is-invalid': submitted && $v.addModal.email.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.addModal.email.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.addModal.email.required"
                          >Email is required</span
                        >
                        <span v-if="!$v.addModal.email.email"
                          >Email is invalid</span
                        >
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="role">Role:</label>
                      <select
                        class="form-control"
                        id="roles"
                        name="roles"
                        v-model="addModal.role"
                        :class="{
                          'is-invalid': submitted && $v.addModal.role.$error,
                        }"
                      >
                        <option
                          v-for="item in addModal.roles"
                          :value="item"
                          v-bind:key="item"
                          >{{ item }}</option
                        >
                      </select>
                      <div
                        v-if="submitted && $v.addModal.role.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.addModal.role.required"
                          >Role is required</span
                        >
                      </div>
                    </div>
                    <br />
                    <div class="form-group" align="center">
                      <input
                        v-if="!loading"
                        type="submit"
                        class="btn btn-outline-success btn-icon-text"
                        v-model="addModal.actionButton"
                      />
                      <div v-if="loading">
                        <span
                          class="spinner-grow spinner-grow-sm btn-outline-success"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- END MEMBER USER MODAL -->
    <!-- EDIT MEMBER MODAL -->
    <div v-if="editModal.myModal" class="users-modal">
      <transition name="model">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <span>Update User</span>
                  <button
                    type="button"
                    class="close"
                    @click="editModal.myModal = false"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <span v-if="editModal.errorMessage" class="text-danger">{{
                    editModal.errorMessage
                  }}</span>
                  <form class="custom-form" v-on:submit.prevent="editUser">
                    <div class="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editModal.name"
                        :class="{
                          'is-invalid': submitted && $v.editModal.name.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.editModal.name.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.editModal.name.required"
                          >Name is required</span
                        >
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Email</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editModal.email"
                        :class="{
                          'is-invalid': submitted && $v.editModal.email.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.editModal.email.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.editModal.email.required"
                          >Email is required</span
                        >
                        <span v-if="!$v.editModal.email.email"
                          >Email is invalid</span
                        >
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="role">Role:</label>
                      <select
                        class="form-control"
                        id="roles"
                        name="roles"
                        v-model="editModal.role"
                      >
                        <option
                          v-for="item in editModal.roles"
                          :value="item"
                          v-bind:key="item"
                          >{{ item }}</option
                        >
                      </select>
                    </div>
                    <br />
                    <div align="center" v-if="!loading">
                      <input
                        type="submit"
                        class="btn btn-outline-success btn-icon-text"
                        v-model="editModal.actionButton"
                      />
                      <div v-if="loading">
                        <span
                          class="spinner-grow spinner-grow-sm btn-outline-success"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- END EDIT MEMBER MODAL -->
    <!-- DELETE MEMBER MODAL -->
    <div v-if="deleteModal.myModal" class="users-modal">
      <transition name="model">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <span>Delete User</span>
                  <button
                    type="button"
                    class="close"
                    @click="deleteModal.myModal = false"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <span v-if="deleteModal.errorMessage" class="text-danger">{{
                    deleteModal.errorMessage
                  }}</span>
                  <form class="custom-form" v-on:submit.prevent="deleteUser">
                    <div>
                      <span
                        >Are you sure you want to delete
                        {{ deleteModal.name }}</span
                      >
                    </div>
                    <br />
                    <div align="center">
                      <input
                        type="submit"
                        class="btn btn-outline-danger btn-icon-text"
                        v-model="deleteModal.actionButton"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- END DELETE MEMBER MODAL -->
  </div>
</template>
<script>
import Breadcrumb from "./breadcrumb";
import { http } from "../../services/HttpService";
import { required, email } from "vuelidate/lib/validators";
export default {
  name: "team",
  components: {
    Breadcrumb,
  },
  data() {
    return {
      users: [],
      searchQuery: "",
      countOfPage: 8,
      currPage: 1,
      loading: false,
      loadingTable: false,
      addModal: {
        myModal: false,
        actionButton: "Send Invitation",
        email: null,
        name: null,
        role: null,
        roles: this.$store.state.roles,
        errorMessage: null,
      },
      editModal: {
        myModal: false,
        actionButton: "Update",
        id: null,
        userId: null,
        email: null,
        name: null,
        role: null,
        roles: this.$store.state.roles,
        errorMessage: null,
      },
      deleteModal: {
        myModal: false,
        id: null,
        name: null,
        actionButton: "Delete User",
        errorMessage: null,
      },
      submitted: false,
    };
  },
  validations: {
    addModal: {
      email: { required, email },
      name: { required },
      role: { required },
    },
    editModal: {
      email: { required, email },
      name: { required },
    },
  },
  methods: {
    openEditModal: function(item) {
      this.editModal.errorMessage = false;
      this.editModal.myModal = true;
      this.editModal.id = item._id;
      this.editModal.userId = item.user._id;
      this.editModal.name = item.user.username;
      this.editModal.email = item.user.email;
      this.editModal.role = item.access;
    },
    openAddModal: function() {
      this.addModal.errorMessage = false;
      this.addModal.myModal = true;
    },
    openDeleteModal: function(item) {
      this.deleteModal.errorMessage = false;
      this.deleteModal.myModal = true;
      this.deleteModal.id = item.user._id;
      this.deleteModal.name = item.username;
    },
    //Edit Users Function
    editUser: function() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.editModal.$touch();
      if (this.$v.editModal.$invalid) {
        return;
      }
      this.loading = true;
      const userId = this.editModal.id;
      const user = {
        username: this.editModal.name,
        role: this.editModal.role,
        email: this.editModal.email,
        id: this.editModal.userId,
      };
      /* Set Member */
      http()
        .put(`/member/${userId}`, { info: user })
        .then(
          function(response) {
            if (response) {
              this.$swal.fire({
                position: "top-end",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 2000,
              });
              this.loading = false;
              this.editModal.myModal = false;
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error.response) {
              this.editModal.errorMessage = error.response.data.message;
              this.$swal.fire({
                position: "top-end",
                icon: "error",
                title: error.response.data.message,
                showConfirmButton: false,
                timer: 2000,
              });
              this.loading = false;
            }
          }.bind(this)
        );
    },
    //Invite Member
    addUser: function() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.addModal.$touch();
      if (this.$v.addModal.$invalid) {
        return;
      }
      const user = {
        nameSender: this.$store.state.email,
        nameReceiver: this.addModal.name,
        email: this.addModal.email,
        role: this.addModal.role,
      };
      this.loading = true;
      http()
        .post("/invite/", { info: user })
        .then(
          function(response) {
            if (response) {
              this.$swal.fire({
                position: "top-end",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 2000,
              });
              this.loading = false;
              this.addModal.myModal = false;
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error.response) {
              this.addModal.errorMessage = error.response.data.message;
              this.$swal.fire({
                position: "top-end",
                icon: "error",
                title: error.response.data.message,
                showConfirmButton: false,
                timer: 2000,
              });
              this.loading = false;
            }
          }.bind(this)
        );
    },
    //Delete Member
    deleteUser: function() {
      const userId = this.deleteModal.id;
      http()
        .delete(`/member/${userId}`)
        .then(
          function(response) {
            if (response) {
              this.$swal.fire({
                position: "top-end",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 2000,
              });
              this.deleteModal.myModal = false;
              const index = this.users.findIndex((item) => item._id === userId);
              if (~index)
                // if the user exists in array
                this.users.splice(index, 1); //delete the user
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            if (error.response) {
              this.deleteModal.errorMessage = error.response.data.message;
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
    //Pagination Table
    setPage: function(idx) {
      if (idx <= 0 || idx > this.totalPage) {
        return;
      }
      this.currPage = idx;
    },
  },
  //Fetch Members From API
  beforeMount() {
    this.loadingTable = true;
    http()
      .get("/members")
      .then(
        function(response) {
          if (response) {
            this.users = response.data.membersOfAccount;
          }
          this.loadingTable = false;
        }.bind(this)
      )
      .catch(function(error) {
        console.log(error);
      });
  },
  /* Handling table rows */
  computed: {
    filteredRows() {
      return this.users.filter((row) => {
        const name = row.user.username.toString().toLowerCase();
        const email = row.user.email.toLowerCase();
        const searchTerm = this.searchQuery.toLowerCase();

        return email.includes(searchTerm) || name.includes(searchTerm);
      });
    },
    //Pagination
    pageStart: function() {
      return (this.currPage - 1) * this.countOfPage;
    },
    totalPage: function() {
      return Math.ceil(this.filteredRows.length / this.countOfPage);
    },
  },
};
</script>
