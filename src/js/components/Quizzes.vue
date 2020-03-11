<template>
  <div id="quizzes" class="app_content">
    <h2>Quizzes</h2>
    <div id="subnav">
      <a href="#" @click.prevent='showSearch'><i class="fas fa-search"></i> Search</a>
      <router-link :to="{ name: 'QuizNew'}" class=""><i class="fas fa-newspaper" title="New Quiz"></i> New Quiz </router-link>
    </div>
    <div v-if="message != null" class="alert">
      {{message}}
    </div>
    <div id="search" v-show="isSearching">
      <div class="form_field">
        <input type="text" v-model="searchingFor" v-on:keyup="searchQuizzes" placeholder="Search users..."/>
      </div>
    </div>
    <div :class="'item_wrapper box '+($route.params.id == quiz.quiz_id ? 'selected' : '')" v-for="(quiz, index) in quizzes">
      <div class="item_details">
        <h3>{{quiz.title}}</h3>
        <span>{{quiz.questions.length}} Question<template v-if="quiz.questions.length == 0 || quiz.questions.length > 1">s</template></span>
        <span>{{quiz.quiz_attempts}} Play<template v-if="quiz.quiz_attempts == 0 || quiz.quiz_attempts > 1">s</template></span>
        <span>{{getAverageScore(index)}}% average</span>
      </div>
      <div class="item_actions">
        <router-link :to="{ name: 'QuizInfo', params: {id:quiz.quiz_id} }"><i class="fas fa-info-circle" title="Quiz Info"></i></router-link>
        <router-link :to="{ name: 'QuizEdit', params: {id:quiz.quiz_id} }"><i class="fas fa-pencil-alt" title="Edit Quiz"></i></router-link>
        <router-link :to="{ name: 'QuizEdit', params: {id:quiz.quiz_id}, query: { delete: 1 }  }"><i class="fas fa-trash-alt" title="Delete Quiz"></i></router-link>
        <a href="#" @click.prevent='newQuizSession(quiz.quiz_id)' :class="{'disabled' : quiz.questions.length == 0}"><i class="fas fa-plus-square" title="New Session"></i></a>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Quizzes",
    data() {
      return {
        quizzes: [],
        quizzesCache: {},
        fade: 'redBG',
        isSearching: false,
        searchingFor: '',
        message: null,
      }
    },
    created() {
      let self = this;
      axios.get(window.apiURI+"/api/quizzes/")
        .then(function (response) {
          self.$set(self, 'quizzes', response.data.quizzes);
          self.$set(self, 'quizzesCache', response.data.quizzes);
        },
      ).catch(error => {
        console.log("Quizzes fetch error");
      });
    },
    mounted() {
      EventBus.$on('quizUpdated', this.quizUpdated);
      EventBus.$on('quizDelete', this.quizDelete);
    },
    methods: {
      quizDelete(quiz) {
        this.$delete(this.quizzes, quiz.quiz_id);
        this.$router.push({name: "Quizzes"});
        this.message = "Successfully deleted quiz.";
        let self = this;
        setTimeout(function(){ self.message = null}, 5000);
      },
      quizUpdated(quiz) {
        this.$set(this.quizzes, quiz.quiz_id, quiz);
      },
      newQuizSession(quiz_id) {
        EventBus.$emit('connectSocketIO');
        let self = this;
        if (this.quizzes[quiz_id].questions.length > 0) {
          if (window.confirm("Press OK if you're sure you want to create a new session for this quiz")) {
            axios.post(window.apiURI+"/api/session/",
              {quiz_id: quiz_id})
              .then(function (response) {
                self.$socket.client.emit('sessionStarted', response.data.quiz_session.code, response.data.quiz_session.quiz_id);
                self.$router.push({ name: 'SessionInfo', params: {code:response.data.quiz_session.code} });
              },
            ).catch(error => {
              console.error("New session error", error);
              alert(error);
            });
          }
        }
        else {
          alert("Sorry, you need to add at least one question to start a new session for this quiz")
        }
      },
      getAverageScore(quizIndex) {
        let totalAttempts = 0,
          correctAttempts = 0;
        for (let index in this.quizzes[quizIndex].questions) {
          if (this.quizzes[quizIndex].questions[index].total_attempts != undefined) {
            totalAttempts += this.quizzes[quizIndex].questions[index].total_attempts;
            correctAttempts += this.quizzes[quizIndex].questions[index].correct_attempts;
          }
        }

        if (totalAttempts != 0 && correctAttempts != 0) {
          return Math.round(correctAttempts / totalAttempts * 1000)/10;
        }
        return "N/A";
      },
      searchQuizzes() {
        if (this.searchingFor.length > 2) {
          this.$set(this, 'quizzes', this.quizzesCache);
          let matches = {},
            searchingFor = this.searchingFor.toLowerCase();
          for (let i in this.quizzes) {
            if (this.quizzes[i].title.toLowerCase().indexOf(searchingFor) !== -1) {
              matches[this.quizzes[i].quiz_id] = this.quizzes[i];
            }
          }
          this.$set(this, 'quizzes', matches);
        }
        else {
          this.quizzes = this.quizzesCache;
        }

      },
      showSearch() {
        this.isSearching = true;
        return false;
      },
      hideSearch() {
        this.isSearching = false;
        return false;
      },
    },
  }
</script>
