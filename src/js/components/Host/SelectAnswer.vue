<template>
  <div id="host--select_answers" class="slide slide_dark" v-if="question">
    <h1><div id="answerCountdown" v-if="howManySeconds !== false" :class="howManySeconds === 0 ? 'countdownExpired' : ''">{{howManySeconds}}</div>{{question.question}}</h1>
    <div id="host--select_answers-answers">
      <div v-for="(answer, index) in question.answers">
        <span>{{answer.answer}}</span>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: "PlayerSelectAnswer",

    props: {
      question: {
        Type: Object,
      }
    },
    data() {
      return {
        howManySeconds: false,
      }
    },
    created() {
      this.howManySeconds = this.question.time_limit;
    },
    mounted() {
      if (this.howManySeconds > 0) {
        this.answerCountdown();
      }
    },
    methods: {
      answered(answer_id) {
        console.log('answered 2', answer_id);
        this.$emit('answered', answer_id);
      },
      answerCountdown() {
        let self = this;
        setTimeout(function() {
          self.howManySeconds--;
          if (self.howManySeconds !== 0) {
            self.answerCountdown();
          }
          else if(self.howManySeconds !== 1) {
            self.gameStarted = true;
            self.countingDownToGameStart = false;
          }
        }, 1000);
      },
    },
  }
</script>
