<template>
  <div id="host">
    <loading v-if="!isConnected"></loading>

    <template v-else-if="isConnected">
      <div id="host_header">
        <h1>{{session.title}}</h1>
        <div id="joinWith">Join with code: {{session.code}}</div>
        <h2>Jawoot!</h2>
      </div>

      <host-game-waiting v-if="gameStatus == 'waitingOnGameToStart'"
        v-on:startGame="startGame"
        :canStartGame="canStartGame"
        :players="this.players"></host-game-waiting>


      <host-get-ready v-else-if="gameStatus == 'getReady'"></host-get-ready>
      <host-question-countdown v-else-if="gameStatus == 'questionCountdown'" :question="currentQuestion"></host-question-countdown>
      <host-select-answer v-else-if="gameStatus == 'selectAnswer'" :question="currentQuestion"></host-select-answer>
      <host-question-result v-else-if="gameStatus == 'currentResult'" :question="currentQuestion" :result="currentResult[currentQuestion.question_order]"></host-question-result>
      <host-scoreboard v-else-if="gameStatus == 'scoreboard'" :scoreboard="currentResult"></host-scoreboard>
      <host-overall-results v-else-if="gameStatus == 'overallResults'" :quiz="quiz" :results="overallResults"></host-overall-results>

      <div id="session_controls" v-if="gameStarted && session.session_id > 0">
        <button v-on:click="finishGame" class="finish_game" :disabled="!gameStarted || gameFinished">Finish Game</button>
        <button v-on:click="next" :disabled="!canNextQuestion" class="next_question">Next</button>
      </div>
    </template>

    <connection-error v-else-if="ioConnectionError"></connection-error>

    <div v-else>
      <div id="host_header">
        <h2>Jawoot!</h2>
      </div>
      <div id="host--join_error" class="join_error slide yellowBG">
        <h1><div>Sorry,</div> we could not find that&nbsp;session.</h1>
        <router-link :to="{ name: 'home', params: {} }" class="button"><i class="fas fa-home"></i>&nbsp;Home</router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import Loading from "./Loading.vue";
  import ConnectionError from "./ConnectionError.vue";
  import HostGameWaiting from "./Host/GameWaiting.vue";
  import HostGetReady from "./Host/GetReady.vue";
  import HostQuestionCountdown from "./Host/QuestionCountdown.vue";
  import HostSelectAnswer from "./Host/SelectAnswer.vue";
  import HostQuestionResult from "./Host/QuestionResult.vue";
  import HostScoreboard from "./Host/Scoreboard.vue";
  import HostOverallResults from "./Host/OverallResults.vue";
  export default {
    name: "Host",
    components: {
      'loading': Loading,
      'connection-error': ConnectionError,
      'host-game-waiting': HostGameWaiting,
      'host-get-ready': HostGetReady,
      'host-question-countdown': HostQuestionCountdown,
      'host-select-answer': HostSelectAnswer,
      'host-question-result': HostQuestionResult,
      'host-scoreboard': HostScoreboard,
      'host-overall-results': HostOverallResults,
    },
    data() {
      return {
        gameStatus: 'waitingOnGameToStart',
        overallResults: {},
        currentQuestion: false,
        currentResult: false,
        joinError: false,
        ioConnected: false,
        ioConnectionError: false,
        session: {
          session_id: 0,
        },

        players: {},
        gameStarted: false,
        gameFinished: false,
        currentResults: false,
        allResults: false,
        quiz: false,
      }
    },
    sockets: {
      connect() {
        this.ioConnected = true;
      },

      disconnect() {
        this.ioConnected = false;
      },

      players(data) {
        console.log('players', data);
        this.players = data;
      },
      startGame() {
        this.gameStarted = true;
      },
      getReady() {
        this.gameStatus = 'getReady';
      },
      questionCountdown(question) {
        this.gameStatus = 'questionCountdown';
        this.currentQuestion = question;
      },
      selectAnswer() {
        this.gameStatus = 'selectAnswer';
      },
      currentResult(result) {
        this.gameStatus = 'currentResult';
        this.currentResult = result;
      },
      scoreboard(scoreboard) {
        this.gameStatus = 'scoreboard';
        this.currentResult = scoreboard;
        console.log(scoreboard);
      },
      overallResults(results) {
        this.gameStatus = 'overallResults';
        this.overallResults = results;
      },
      gameStarted() {
        this.gameStarted = true;
      },
      gameStartError(error) {
        this.gameStarted = false;
        this.joinError = true;
        console.log(error);
      },
      nextQuestion(question) {
        this.currentQuestion = question;
      },
      joinError() {
        this.joinError = true;
      },
      error(error) {
        if (error == 'Authentication error') {
          console.log('ioconnecterr');
          this.ioConnectionError = true;
        }
      }
    },
    computed: {
      isConnected() {
        if (this.$socket.client.connected) {
          this.ioConnected = true;
          //seems to be a race condition where we're not seeing the connect event
        }
        return this.ioConnected && this.quiz != false && !this.ioConnectionError;
      },
      canStartGame() {
        return Object.keys(this.players).length == 0 || this.gameStarted != false;
      },
      canNextQuestion() {
        //need to check for current question result
        return this.gameStarted && !this.gameFinished
           && (this.gameStatus == 'currentResult' || this.gameStatus == 'scoreboard')
           && this.quiz.questions != undefined
           && this.currentQuestion.question_order+1 < this.quiz.questions.length;
      },
    },
    created() {
      console.log(this.$route.meta, this.ioConnected);
      let self = this;
      if (this.$route.params.code != undefined) {
        axios.get(window.apiURI+"/api/session/"+this.$route.params.code)
          .then(function (response) {
            self.$set(self, 'session', response.data.session);
            self.$socket.client.emit('hostJoin', {session_code: self.session.code});
            self.getQuiz();
          },
        ).catch(error => {
          console.log("Session fetch error", error);
        });
      }
    },
    methods: {
      getQuiz() {
        let self = this;
        axios.get(window.apiURI+"/api/quiz/"+this.session.quiz_id)
          .then(function (response) {
            self.$set(self, 'quiz', response.data.quiz);
          },
        ).catch(error => {
          console.log("Session fetch error");
        });
      },
      startGame() {
        this.$socket.client.emit('startGame', {session_code: this.session.code})
      },
      next() {
        switch (this.gameStatus) {
          case 'scoreboard':
              this.nextQuestion();
            break;
          case 'currentResult':
              this.scoreboard();
            break;
        }
      },
      nextQuestion() {
        this.$socket.client.emit('nextQuestion', {session_code: this.session.code});
      },
      scoreboard() {
        this.$socket.client.emit('scoreboard', {session_code: this.session.code});
      },
      finishGame() {
        this.gameFinished = true;
        this.$socket.client.emit('finishGame', {session_code: this.session.code});
      },
    },
  }
</script>
