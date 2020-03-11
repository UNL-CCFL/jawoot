<template>
  <div id="host--question_result" class="slide slide_dark">
    <h1>{{question.question}}</h1>
    <div id="host--question_result_chart">
      <div class="result" v-for="(answer, index) in question.answers">
        <div class="result__total" ><i v-if="result.answers[answer.answer_id].is_correct" class="fas fa-check"></i>{{result.answers[answer.answer_id].numberAnswered}}</div>
        <div class="result__bar" :style="'height: '+(result.answers[answer.answer_id].numberAnswered/result.numberAnswered*100)+'%'"></div>
        <div class="result__symbol" :title="answer.answer"></div>
      </div>

    </div>
    <div id="host--select_answers-answers">
      <div v-for="(answer, index) in question.answers" :class="!answer.is_correct ? 'wrong_answer' : 'correct_answer' ">
        <span>{{answer.answer}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "PlayerQuestionResult",

    props: {
      result: {
        type: Object,
      },
      question: {
        type: Object,
      },
    },
    data() {
      return {
      }
    },

    computed: {
    },


    created() {
    },

    mounted() {
      console.log(this.result);
    },

    methods: {
    },
  }
</script>
