<template>
  <div id="app">
    <div id="sidebar" v-if="hasNav">
      <router-link :to="{ name: '', params: {} }" id="homeLink">J!</router-link>
      <nav>
        <router-link :to="{ name: 'Quizzes', params: {} }"><i class="fas fa-newspaper"></i></router-link>
        <router-link :to="{ name: 'Sessions', params: {} }"><i class="fas fa-chalkboard"></i></router-link>
        <router-link :to="{ name: 'Users', params: {} }"><i class="fas fa-users-cog"></i></router-link>
      </nav>
    </div>
    <div v-if="authCheckComplete" id="app_content" v-bind:class="{hasNav : hasNav}">
      <router-view v-on:joinedGame="joinedGame"
        v-bind:activeSession="activeSession"></router-view>
      <div id="app_content--slideout" v-if="hasSlideout" :key="$route.fullPath">
        <router-link id="app_content--slideout_close" class="fas fa-times" :to="{ name: this.$route.matched[0].components.default.name, params: {} }"></router-link>
        <router-view name="slideout"></router-view>
      </div>
    </div>
    <connecting v-else-if="!connectionError"></connecting>
    <connection-error v-else></connection-error>
  </div>
</template>

<script>
  import { EventBus } from '../eventbus.js';
  import VueSocketIOExt from 'vue-socket.io-extended';
  import io from 'socket.io-client';
  import Connecting from './Connecting.vue';
  import ConnectionError from "./ConnectionError.vue";
  import Vue from 'vue';
  export default {
    name: 'app',
    components: {
      'connecting': Connecting,
      'connection-error': ConnectionError,
    },
    data() {
      return {
        ioConnected: false,
        activeSession: false,
        connectionError: false,
        fade: 'blueBG',
        authCheckComplete: false,
      }
    },
    computed: {
      hasNav() {
        return this.$route.meta.needsNav != undefined;
      },
      hasSlideout() {
        return this.$route.matched[0].components.slideout != undefined;
      },
      isConnected() {
        return this.ioConnected && this.authCheckComplete;
      }
    },
    sockets: {
      connect() {
        this.ioConnected = true;
      },
      reconnect() {
        this.ioConnected = true;
      },
      disconnect() {
        this.ioConnected = false;
      },
      error() {

      }
    },
    watch: {
      '$route' (to, from) {
        window.scrollTo(0,0);
        if (this.$route.meta.needsSocketIO === true && !this.ioConnected) {
          this.connectSocketIO();
        }
      }
    },
    created() {
      EventBus.$on('getBGColor', this.getBGColor)
      this.startSession();
    },
    mounted() {
      EventBus.$on('connectSocketIO', this.connectSocketIO)
    },
    methods: {
      joinedGame(session) {
        this.activeSession = session.session;
      },
      getBGColor(listener) {
        let fades = ['blueBG', 'greenBG', 'redBG', 'yellowBG'],
          color = (Math.floor(Math.random() * fades.length));
        EventBus.$emit(listener, fades[color]);
      },
      startSession() {
        let self = this;
        axios({ method: "GET", "url": window.apiURI+"/session"}).then(response => {
          window.axios.defaults.headers.common['X-CSRF-TOKEN'] = response.data.csrf_token;
          self.validateUser();
        }).catch(error => {
          self.connectionError = true;
          console.error('startSession error', error);
        });
      },
      validateUser() {
        let self = this;
        axios({ method: "POST", "url": window.apiURI+"/session"}).then(response => {
          window.user = response.data.user;
          self.authCheckComplete = true;
          if (self.$route.name == 'Login') {
            self.$router.push('quizzes');
            return;
          }

          self.connectSocketIOAdmin(true);
        }).catch(error => {
          console.error("Validate user error", error);
          window.user = false;
          self.authCheckComplete = true;
          self.connectSocketIOUser(true);
        });
      },
      connectSocketIO(onRouteMetaOnly) {
        if (!this.ioConnected && onRouteMetaOnly != true) {
          if (window.user) {
            this.connectSocketIOAdmin();
          }
          else {
            self.connectSocketIOUser();
          }
        }
      },
      connectSocketIOAdmin(onRouteMetaOnly) {
        try {
          if (!this.ioConnected && onRouteMetaOnly != true) {
            this.$socket.client.io.uri += "?token="+window.user.token;
            this.$socket.client.open();
            EventBus.$emit('connectedSocketIO');
          }
        }
        catch (error) {
          console.error("io admin connect error", error)
        }
      },
      connectSocketIOUser() {
        if (!this.ioConnected) {
          this.$socket.client.open();
          EventBus.$emit('connectedSocketIO');
        }
      },
    }
  }
</script>
