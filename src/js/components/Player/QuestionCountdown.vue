<template>
  <div id="player--question_countdown" :class="'slide '+fade ">
    <div>
      <h2 id="countdown">{{howManySeconds}}</h2>
      <h1 id="question">{{question.question}}</h1>
    </div>
  </div>
</template>

<script>
  export default {
    name: "PlayerQuestionCountDown",
    data() {
      return {
        howManySeconds: 5,
        fade: 'redBG',
      }
    },
    computed: {
    },
    props: {
      questionNumber: {
        type: Number,
      },
      question: {
        type: Object,
      }
    },
    created() {
    },
    mounted() {
      this.countdown();
    },
    methods: {
      countdown() {
        let self = this;
        setTimeout(function() {
          self.howManySeconds--;
          if (self.howManySeconds > 0) {
            self.countdown();
          }
        }, 1000);
      }
    },
  }
</script>
