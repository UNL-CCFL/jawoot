<template>
  <div id="home" :class="fade">
    <form id="join" @submit.prevent="joinSession">
      <h1>Jawoot!</h1>
      <div class="form_field">
        <label for="code">Session Code</label>
        <input id="code"
          name="code"
          type="text"
          placeholder="Session Code"
          v-model="session_code" />
      </div>
      <div class="form_field">
        <label for="name">Your Name</label>
        <input id="name"
          name="name"
          type="text"
          placeholder="Your Name"
          v-model="session_name" />
      </div>
      <button v-on:click="joinSession()">Enter</button>
      <div v-if="error" class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <span v-html="error"></span>
      </div>
    </form>
  </div>
</template>

<script>

  export default {
    name: "Home",
    data() {
      return {
        session_code: '',
        session_name: '',
        error: '',
        fade: 'redBG',
      }
    },
    sockets: {
      joinSuccess: function(session) {
        this.$emit('joinedGame', session);
        document.cookie = "socket_id="+session.socket_id;
        document.cookie = "session_code="+session.session.code;
        document.cookie = "session_player_name="+session.playerName;
        this.$router.push({name: "Play"});
      },
      joinError: function(message) {
        this.error = message;
      },
      gameNotFound: function() {
        this.error = "Sorry, we couldn't find that session.";
      },
    },
    computed: {

    },
    created() {
      this.$emit('joinedGame', false);
      EventBus.$on('homeBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'homeBGColor');

      let code = parseInt(this.$route.params.code);
      if (!isNaN(code)) {
        this.session_code = code;
      }
    },
    methods: {
      joinSession() {
        if (this.session_code != '' && this.session_name !== '') {
          this.error = '';
          let join = {
            session_code: this.session_code,
            session_name: this.session_name,
          };
          
          let socket_id_regex = /socket_id=([a-zA-Z0-9\-_]*)/ig,
            socket_id_match = socket_id_regex.exec(document.cookie),
            socket_id = socket_id_match !== null ? socket_id_match[1] : null;
          
          if (socket_id !== null) {
            join.socket_id = socket_id;
            console.log('join.socket_id',join.socket_id);
          }
          
          this.$socket.client.emit('playerJoin', join);
        }
        else {
          this.error = "You must provide a session code and&nbsp;name.";
        }

      },
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
