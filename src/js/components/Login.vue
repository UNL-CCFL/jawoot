<template>
  <div id="home" :class="fade">
    <form id="join" @submit.prevent="login">
      <h1>Jawoot!</h1>
      <div class="form_field">
        <label for="username">Username</label>
        <input id="username"
          name="username"
          type="text"
          placeholder="Admin username"
          v-model="username"  />
      </div>
      <div class="form_field">
        <label for="name">Password</label>
        <input id="password"
          name="password"
          type="password"
          placeholder="Admin Password"
          v-model="password" />
      </div>
      <button>Login</button>
      <div v-if="error" class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <span v-html="error"></span>
      </div>
    </form>
  </div>
</template>

<script>

  export default {
    name: "Login",
    data() {
      return {
        username: '',
        password: '',
        error: '',
        fade: 'blueBG',
      }
    },
  
    methods: {
      login() {
        let self = this;
        if (this.username != '' && this.password !== '') {
          axios.post(window.apiURI+"/login/",
          {username: this.username, password: this.password},
          {withCredentials: true}
            )
            .then(function (response) {
              window.user = response.data.user;
              //self.$router.push('quizzes')
              //need it to reconnect to socket.io for auth so hard redirect
              window.location = "/quizzes";
            },
          ).catch(error => {
            this.error = "Invalid username or password provided.";
          });
        }
        else {
          this.error = "You must provide a username and&nbsp;password.";
        }

      },
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
