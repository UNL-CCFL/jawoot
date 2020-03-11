<template>
  <div id="quiz_info" class="slideout_content" v-if="session.session_id != undefined">
    <h2>Session Info {{session.code}}</h2>
    <div v-if="showDelete" class="alert">
      <p>Are you sure you want to delete this session? <strong>This cannot be undone!</strong></p>
      <p>
        <button class="button button--warn" @click.prevent="deleteSession">Yes</button>
        <router-link :to="{ name: 'SessionInfo', params: {code:session.code}, query: {completed: $route.query.completed == '1' ? 1 : null} }" class="button button--inverted">Cancel</router-link>
      </p>
    </div>

    <template v-if="hasLoaded && session.session_id != undefined">
      <div class="not_complete" v-if="!this.session.completed_at">
        <h3>This session has not completed yet.</h3>
        <p><button class="button" @click.prevent="endSession">End Session Now</button></p>
      </div>
      <template v-else="">
        <percentage-bar :percentage="session.average_score" :big="true">
          <template v-slot:percentage_append>% Overall Average</template>
        </percentage-bar>

        <h3 id="session_player_count">{{session.player_count}} Total Player<template v-if="session.player_count == 0 || session.player_count > 1">s</template></h3>

        <component
          v-for="(question, index) in this.session.quiz.questions"
          :class="'question question--'+question.question_type.toLowerCase()"
          :is="question.question_type"
          :key="Math.round(Math.random()*10000)"
          :index="index"
          :model="question"
        ></component>
      </template>
    </template>
    <div class="loading" v-if="!hasLoaded">
      <i class="loading fas fa-circle-notch fa-spin"></i>Loading...
    </div>
  </div>
</template>

<script>
  import MultipleChoice from './Questions/Info/MultipleChoice.vue';
  export default {
    name: "SessionInfo",
    components: {
      MultipleChoice,
    },
    data() {
      return {
        session: {},
        quiz: false,
        hasLoaded: false,
        showDelete: false,
      }
    },
    created() {
      if (this.$route.params.code != undefined) {
        this.getSessionInfo();
      }

      this.showDelete = parseInt(this.$route.query.delete) === 1;
    },
    methods: {
      getSessionInfo() {
        let self = this;
        axios.get(window.apiURI+"/api/session/"+self.$route.params.code)
          .then(function (response) {
            self.$set(self, 'session', response.data.session);
            self.hasLoaded = true;
          },
        ).catch(error => {
          console.log("Session fetch error", error);
        });
        return false;
      },
      endSession() {
        if (this.$socket.client.connected == false) {
          let self = this;
          EventBus.$on('connectedSocketIO', function() {
            self.hasLoaded = false;
            self.$socket.client.emit('finishGame', {session_code: self.session.code});
            //give it a chance to update
            setTimeout(function() { console.log('timeout2');self.getSessionInfo(); }, 1000);
          });
          EventBus.$emit('connectSocketIO');
        }
        else {
          this.$socket.client.emit('finishGame', {session_code: this.session.code});
          //give it a chance to update
          setTimeout(function() { console.log('timeout2');self.getSessionInfo(); }, 1000);
        }
      },
      deleteSession() {
        let self = this;
        axios.delete(window.apiURI+"/api/session/"+this.session.code,
            self.quiz,
          ).then(function(response){
            EventBus.$emit('sessionDelete', self.session);
          })
          .catch(function(response){
            self.isSaving = false;
            self.hasError = true;
            self.statusMessage = "Sorry, an error occurred. Please try again or contact support if the error persists.";
          });
      },
    },
  }
</script>
