<template>
  <div id="player--select_answers" v-if="question">
    <h2>{{question.question}}</h2>
    <div id="player--select_answers-answers" :class="elemClass">
      <button v-for="(answer, index) in question.answers"
        v-on:click="answered(answer.answer_id)"
        :title="answer.answer"
        v-html="answer.answer"
        >
      </button>
    </div>
    <div id="answerCountdown" v-if="howManySeconds">{{howManySeconds}}</div>
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
        howManySeconds: 0,
      }
    },
    computed: {
      elemClass() {
        let elemClass = !this.howManySeconds ? 'nocountdown': '';

        elemClass += " answers"+this.question.answers.length;
        return elemClass;
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
