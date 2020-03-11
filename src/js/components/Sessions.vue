<template>
  <div id="sessions" class="app_content">
    <h2>Sessions</h2>
    <div id="subnav">
      <router-link v-if="activeOnly" :to="{ name: 'Sessions', query: {completed: 1}}"><i class="fas fa-chalkboard"></i> Completed Sessions</router-link>
      <router-link v-else :to="{ name: 'Sessions', query: {completed: 0}}"><i class="fas fa-chalkboard"></i> Active Sessions</router-link>
    </div>
    <div v-if="message != null" class="alert">
      {{message}}
    </div>
    <template v-if="sessions.length > 0">
      <div :class="'item_wrapper box '+($route.params.code == session.code ? 'selected' : '')"

          v-for="(session, index) in sessions">
        <div class="item_details">
          <h3>{{session.title}}</h3>
          <span>Code: <router-link :to="{ name: 'Play', params: {code:session.code} }">{{session.code}}</router-link></span>
        </div>
        <div class="item_actions">
          <router-link :to="{ name: 'SessionInfo', params: {code:session.code}, query: {completed: $route.query.completed == '1' ? 1 : null} }" class=""><i class="fas fa-info-circle" title="Quiz Info"></i></router-link>
          <router-link :to="{ name: 'SessionInfo', params: {code:session.code}, query: { delete: 1, completed: $route.query.completed == '1' ? 1 : null }  }"><i class="fas fa-trash-alt" title="Delete Session"></i></router-link>
          <router-link :to="{ name: 'HostControl', params: {code:session.code}, query: {completed: $route.query.completed == '1' ? 1 : null} }"><i class="fas fa-chalkboard-teacher"></i></router-link>
        </div>
      </div>
    </template>
    <div v-else>
      No {{this.activeOnly ? 'active' : 'completed'}} sessions were found.
    </div>
  </div>
</template>

<script>
  export default {
    name: "Sessions",
    data() {
      return {
        sessions: [],
        activeOnly: 1,
        message: null,
      }
    },
    sockets: {
      sessions(data) {
        this.sessions = data;
      },
    },
    watch: {
      '$route' () {
        if (parseInt(this.$route.query.completed) === 1) {
          this.activeOnly = 0;
        }
        else {
          this.activeOnly = 1;
        }
        this.fetchSessions();
      }
    },
    created() {
      if (parseInt(this.$route.query.completed) === 1) {
        this.activeOnly = 0;
      }
      else {
        this.activeOnly = 1;
      }
      this.fetchSessions();
      EventBus.$on('sessionDelete', this.sessionDelete);
    },
    methods: {
      fetchSessions() {
        let self = this;
        axios.get(window.apiURI+"/api/sessions/?active="+this.activeOnly)
          .then(function (response) {
            self.$set(self, 'sessions', response.data.sessions);
          },
        ).catch(error => {
          console.log("sessions fetch error");
        });
      },
      sessionDelete(session) {
        for (let i in this.sessions) {
          if (this.sessions[i].session_id == session.session_id) {
            this.$delete(this.sessions, i);
            break;
          }
        }

        this.$router.push({name: "Sessions", query: {completed: this.$route.query.completed == '1' ? 1 : null}});
        this.message = "Successfully deleted session.";
        let self = this;
        setTimeout(function(){ self.message = null}, 5000);
      },
    },
  }
</script>
