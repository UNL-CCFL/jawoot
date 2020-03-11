<template>
  <div id="user_form" class="slideout_content">
    <form @submit.prevent="saveUser">
      <h2 v-if="user.user_id == 0">New User</h2>
      <h2 v-else-if="showDelete">Delete User</h2>
      <h2 v-else>Edit User</h2>

      <div v-if="showDelete" class="alert">
        <p>Are you sure you want to delete this user? <strong>This cannot be undone!</strong></p>
        <p>
          <button class="button button--warn" @click.prevent="deleteUser">Yes</button>
          <router-link :to="{ name: 'UserEdit', params: {user_id:user.user_id} }" class="button button--inverted">Cancel</router-link>
        </p>
      </div>
      <div class="form_field">
        <label for="user_full_name" class="user_full_name">User's Full Name</label>
        <input
          id="user_full_name"
          v-validate="'required'"
          data-vv-as="user's full name"
          type="text"
          name="user_full_name"
          :class="{'has_error': errors.has('user_full_name')}"
          v-model="user.full_name">
        <span class="form_field_error">{{ errors.first("user_full_name") }}</span>
      </div>

      <div class="form_field">
        <label for="user_username" class="user_username">Username</label>
        <input id="user_username"
          v-validate="'required|alpha_num'"
          data-vv-as="username"
          type="text"
          name="user_username"
          :class="{'has_error': errors.has('username')}"
          v-model="user.username">
        <span class="form_field_error">{{ errors.first('username') }}</span>
      </div>

      <template v-if="isChangingPassword">
        <div class="form_field">
          <label for="user_password1" class="user_password">New Password</label>
          <input
            id="user_password1"
            type="password"
            name="password"
            v-validate="'required|min:8'"
            :class="{'has_error': errors.has('password')}"
            placeholder="Password must be at least 8 characters long"
            ref="password"
            v-model="user.password">
            <span class="form_field_error">{{ errors.first("password") }}</span>
        </div>
        <div class="form_field">
          <label for="user_password_confirm" class="user_password">New Password Again</label>
          <input
            id="user_password_confirm"
            type="password"
            v-validate="'required|confirmed:password'"
            data-vv-as="password"
            name="password_confirm"
            placeholder="The password, again"
            :class="{'has_error': errors.has('password_confirm')}"
            v-model="user.password_confirm">
            <span class="form_field_error">{{ errors.first("password_confirm") }}</span>
        </div>
        <button v-if="user.user_id > 0" v-on:click="changingPassword = false" class="button button--inverted">Cancel Changing Password</button>
      </template>
      <template v-else>
        <p><button v-on:click="changingPassword = true" class="button button--inverted">Change Password</button></p>
      </template>

      <div class="form_controls">
        <button v-on:click="saveUser" class="save_quiz" v-if="user.user_id == 0">Create User</button>
        <button v-on:click="saveUser" class="save_quiz" v-else>Update User</button>
        <i v-if="isSaving" class="is_saving fas fa-circle-notch fa-spin"></i>
        <span v-if="statusMessage" :class="{has_error: hasError}" v-html="statusMessage"></span>
      </div>
      <div v-if="errorMessages.length" class="error_messages">
        <ul v-for="(error) in errorMessages">
          <li>{{error}}</li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script>
  export default {
    name: "User",
    data() {
      return {
        isSaving: false,
        isDeleting: false,
        showDelete: false,
        statusMessage: null,
        errorMessages: [],
        hasError: false,
        changingPassword: false,
        user: {
          user_id: 0,
          full_name: '',
          username: '',
        },
      }
    },
    computed: {
      isChangingPassword() {
        return this.changingPassword || this.user.user_id === 0;
      }
    },
    created() {
      let self = this;
      if (this.$route.params.user_id != undefined) {
        axios.get(window.apiURI+"/api/user/"+this.$route.params.user_id)
          .then(function (response) {
            self.$set(self, 'user', response.data.user);
          },
        ).catch(error => {
          console.error("User fetch error");
        });
      }

      this.showDelete = parseInt(this.$route.query.delete) === 1 && this.user_id !== 0;
    },
    methods: {
      deleteUser() {
        let self = this;
        axios.delete(window.apiURI+"/api/user/"+this.user.user_id,
            self.user,
          ).then(function(response){
            EventBus.$emit('userDelete', self.user);
          })
          .catch(function(response){
            self.isSaving = false;
            self.hasError = true;
            self.statusMessage = "Sorry, an error occurred. Please try again or contact support if the error persists.";
          });
      },
      saveUser() {
        let self = this;
        this.$validator.validate().then(valid => {
          if (valid && !this.isSaving) {
            this.isSaving = true;
            setTimeout(function() {
              axios.post(window.apiURI+"/api/user/"+(self.user.user_id != 0 ? self.user.user_id : ''),
                  self.user,
                ).then(function(response){
                  self.isSaving = false;
                  if (response.data.hasError === true) {
                    self.statusMessage = "Sorry, some errors occurred while trying to save: ";
                    self.errorMessages = response.data.messages;
                  }
                  else {
                    self.statusMessage = "User was successfully saved!";
                    setTimeout(function(){
                      self.statusMessage = null;
                    }, 3500)
                    EventBus.$emit('userUpdate', response.data.user);
                    self.$set(self, 'user', response.data.user);
                  }
                })
                .catch(function(response){
                  self.isSaving = false;
                  self.hasError = true;
                  self.statusMessage = "Sorry, an error occurred. Please try again or contact support if the error persists.";
                });
            }, 500)
          }
          else if(!this.isSaving) {
            self.isSaving = false;
            self.hasError = true;
            self.statusMessage = "Please fix the errors above and try submitting again.";
          }
        });
        return false;
      },
    },
  }
</script>
