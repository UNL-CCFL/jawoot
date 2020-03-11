<template>
  <div class="question_render">
    <ul class="form_fields ">
      <button v-for="(answer, index) in question.answers" v-on:click="answerQuestion(answer.answer_id)">
        {{answer.answer}}
      </button>
    </ul>
  </div>
</template>
<script>
  import QuizQuestion from "../QuizQuestion.vue";
  export default {
    extends: QuizQuestion,
    data() {
      return {
        selected: {},
        question: null,
        response: {},
      }
    },
    mounted() {
    },
    methods: {
      answerQuestion(answer_id) {
        this.$emit('answered', answer_id);
      }
    },
  }
</script>
