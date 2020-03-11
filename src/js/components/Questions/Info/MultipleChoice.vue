<template>
  <div class="question_info">
    <h4 v-html="question.question"></h4>

    <percentage-bar :percentage="percentageCorrect" :delayCount="(index+1.5)">
      <template v-slot:percentage_append>%
        <template v-if="question.total_attempts">Correct</template>
        <template v-else>No responses</template>
      </template>
    </percentage-bar>

    <div id="question_info__attempts_breakdown">Correct Attempts: {{question.correct_attempts}} / {{question.total_attempts}}</div>

    <ul class="answers">
      <div class="answer" v-for="(answer, index) in question.answers">
        <span class="answer_text">
          <i class="fas fa-check-circle" v-if="question.answers[index].is_correct"></i>
          <i class="fas fa-circle" v-else></i>
          {{answer.answer}}
        </span>
        <span class="answer_count">
          {{answer.selected_count}} time<template v-if="answer.selected_count == 0 || answer.selected_count > 1">s</template>
        </span>
      </div>
    </ul>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        percentage: 0.0,
        question: Object,
      }
    },
    props: {
      model: Object,
      index: Number,
    },
    created() {
      this.question = this.$set(this, 'question', this.model);
    },
    computed: {
      percentageCorrect() {
        if (this.question.total_attempts) {
          return Math.round((this.question.correct_attempts / this.question.total_attempts) * 1000) / 10;
        }
        else {
          return 0;
        }
      },
    },
    methods: {
      answerQuestion(answer_id) {
        this.$emit('answered', answer_id);
      }
    },
  }
</script>
