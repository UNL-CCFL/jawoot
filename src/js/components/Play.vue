<template>
  <div id="player">
    <template v-if="!joinError">
      <div id="player_header">
        <h2>{{playerName}}</h2>
        <div id="player_score" v-if="gameStarted">{{playerScore}}</div>
        <div id="session_code" v-else>Code: {{session.code}}</div>
      </div>
      <player-game-waiting v-if="gameStatus == 'waitingOnGameToStart'" :players="this.players"></player-game-waiting>
      <player-get-ready v-else-if="gameStatus == 'getReady'"></player-get-ready>
      <player-question-countdown v-else-if="gameStatus == 'questionCountdown'" :questionNumber="(currentQuestion.question_order+1)" :question="currentQuestion"></player-question-countdown>
      <player-select-answer v-else-if="gameStatus == 'selectAnswer'" :question="currentQuestion" v-on:answered="answered"></player-select-answer>
      <player-waiting-on-answers v-else-if="gameStatus == 'waitingOnAnswers'"></player-waiting-on-answers>
      <player-question-result v-else-if="gameStatus == 'currentResult'" :result="currentResult"></player-question-result>
      <player-overall-results v-else-if="gameStatus == 'overallResults'" :results="overallResults" :playerID="playerID"></player-overall-results>
      <div v-else-if="gameStatus == 'gameStartedAndFinished'" id="player--game_finished"  class="join_error slide blueBG">
        <h1><div>Sorry,</div> this game has&nbsp;ended.</h1>
      </div>
    </template>
    <div v-else>
      <div id="player_header">
        <h2>Jawoot!</h2>
      </div>
      <div id="player--join_error" class="join_error slide yellowBG">
        <h1><div>Sorry,</div> we could not find that&nbsp;session.</h1>
        <router-link :to="{ name: 'home', params: {} }" class="button"><i class="fas fa-home"></i>&nbsp;Home</router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import PlayerGameWaiting from "./Player/GameWaiting.vue";
  import PlayerGetReady from "./Player/GetReady.vue";
  import PlayerQuestionCountdown from "./Player/QuestionCountdown.vue";
  import PlayerSelectAnswer from "./Player/SelectAnswer.vue";
  import PlayerWaitingOnAnswers from "./Player/WaitingOnAnswers.vue";
  import PlayerQuestionResult from "./Player/QuestionResult.vue";
  import PlayerOverallResults from "./Player/OverallResults.vue";
  export default {
    name: "Game",
    components: {
      'player-game-waiting': PlayerGameWaiting,
      'player-get-ready': PlayerGetReady,
      'player-question-countdown': PlayerQuestionCountdown,
      'player-select-answer': PlayerSelectAnswer,
      'player-waiting-on-answers': PlayerWaitingOnAnswers,
      'player-question-result': PlayerQuestionResult,
      'player-overall-results': PlayerOverallResults,
    },
    data() {
      return {
        gameStatus: 'waitingOnGameToStart',
        overallResults: {},
        playerName: 'Default',
        playerID: '',
        gameStarted: false,
        playerScore: 0,
        overallResults: [],

        session: '',
        players: {},
        gameFinished: false,
        joinError: false,
        waitingOnGameToStart: true,
        countingDownToGameStart: false,
        howManySeconds: 5,
        currentQuestion: false,
        currentResults: false,
        hasAnswered: {},

        timeLeft: 0,
        hasTimeLimit: false,
        timeIsUp: false,
      }
    },
    computed: {
      seconds() {
        if (this.howManySeconds > 1) {
          return 'seconds';
        }
        return 'second';
      },
      canAnswerQuestion() {
        return this.currentQuestion
          && this.hasAnswered[this.currentQuestion.question_id] == 0
          && !this.timeIsUp
      },
      hasAnsweredQuestion() {
        return this.hasAnswered[this.currentQuestion.question_id] !== undefined
          && this.hasAnswered[this.currentQuestion.question_id] != 0
      },
      didNotAnswerQueston() {
        return this.timeIsUp
          && this.hasAnswered[this.currentQuestion.question_id] == 0
      },
    },
    props: {
      activeSession: {Type: Object},
    },
    created() {

      let socket_id_regex = /socket_id=([a-zA-Z0-9\-_]*)/ig,
        socket_id_match = socket_id_regex.exec(document.cookie),
        socket_id = socket_id_match !== null ? socket_id_match[1] : null;

      let session_code_regex = /session_code=([a-zA-Z0-9]*)/ig,
        session_code_match = session_code_regex.exec(document.cookie),
        session_code = session_code_match !== null ? session_code_match[1] : null;

      let session_player_name_regex = /session_player_name=([a-zA-Z0-9]*)/ig,
        session_player_name_match = session_player_name_regex.exec(document.cookie),
        session_player_name = session_player_name_match !== null ? session_player_name_match[1] : null;

      this.session = this.activeSession;

      if (!this.session && socket_id !== null && session_code !== null && session_player_name !== null) {
        let join = {
          session_code: session_code,
          session_name: session_player_name,
          socket_id: socket_id,
        };
        this.$socket.client.emit('playerJoin', join);
      }
      else if (!this.session && window.session_id == undefined) {
        window.location = "/";
        return;
        let join = {
            session_code: 333444,
            session_name: 'Fake '+Math.round(Math.random() * (9999 - 999) + 999),
            session_id: window.session_id,
          };
        this.$socket.client.emit('playerJoin', join);
      }
      let self = this;
      window.onbeforeunload = function(){
        self.$socket.client.emit("playerLeave", {session_code: self.session.code, session_id: window.session_id});
      }
    },
    mounted() {
      //detect when device sleeps, if last time is more than SLEEPTIME device
      //has slept or tab lost focus. refresh page to get user back in game
      var SLEEPTIME = 5000;
      var lastTime = (new Date()).getTime();
      setInterval(function() {
        var currentTime = (new Date()).getTime();
        if (currentTime > (lastTime + SLEEPTIME + 2000)) {
          window.location.reload();
        }
        lastTime = currentTime;
      }, SLEEPTIME);
    },
    beforeDestroy() {
      this.$socket.client.emit("playerLeave", {session_code: this.session.code});
    },
    sockets: {
      joinSuccess(data) {
        this.session = data.session;
        this.playerName = data.playerName;
        this.playerID = data.socket_id;

        document.cookie = "socket_id="+data.socket_id;
        document.cookie = "session_code="+data.session.code;
        document.cookie = "session_player_name="+data.playerName;
      },
      joinError(data) {
        this.joinError = data;
      },
      players(data) {
        console.log('this.players',data);
        this.players = data;
      },
      getReady() {
        this.gameStatus = 'getReady';
      },
      gameStarted() {
        this.gameStarted = true;
      },
      questionCountdown(question) {
        this.gameStarted = true;
        this.gameStatus = 'questionCountdown';
        this.currentQuestion = question;
      },
      currentResult(result) {
        this.gameStatus = 'currentResult';
        this.currentResult = result;
        console.log('currentQuestion', this.currentQuestion)
        console.log('cr', result);
        this.playerScore += result.points;
      },
      selectAnswer() {
        this.gameStatus = 'selectAnswer';
      },
      waitingOnAnswers() {
        this.gameStatus = 'waitingOnAnswers';
      },
      nextQuestion(question) {
        this.gameStatus = 'questionCountdown';
        this.currentQuestion = question;
      },
      overallResults(results) {
        this.gameStatus = 'overallResults';
        this.overallResults = results;
      },
      gameStartedAndFinished() {
        this.gameStatus = 'gameStartedAndFinished';
      },
    },
    methods: {
      answered(answer_id) {
        this.hasAnswered[this.currentQuestion.question_id] = answer_id;
        this.$socket.client.emit('playerAnswered', {question_index: this.currentQuestion.question_order, answer_id: answer_id, session_id: window.session_id});
      },
      countdown() {
        let self = this;
        this.countingDownToGameStart = true;
        setSLEEPTIME(function() {
          self.howManySeconds--;
          if (self.howManySeconds !== 0) {
            self.countdown();
          }
          else if(self.howManySeconds !== 1) {
            self.gameStarted = true;
            self.countingDownToGameStart = false;
          }
        }, 1000);
      },

      timerCountdown() {
        let self = this;
        setSLEEPTIME(function() {
          self.timeLeft--;
          if (self.timeLeft > 0) {
            self.timerCountdown();
          }
          else if(self.timeLeft <= 0) {
            self.timeIsUp = true;
          }
        }, 1000);
      },
    },
  }
</script>
