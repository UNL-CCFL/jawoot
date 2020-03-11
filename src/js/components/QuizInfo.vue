<template>
    <div id="quiz_info" class="slideout_content" v-if="quiz.quiz_id != undefined">
      <h2>Quiz Info</h2>
      <h3 v-html="quiz.title"></h3>
      <!--<percentage-ring :radius="60" :percentage="percentage" :stroke="4"></percentage-ring>-->
      <percentage-bar :percentage="averageScore" :big="true">
        <template v-slot:percentage_append>% Overall Average</template>
      </percentage-bar>

      <h4 id="quiz_attempts">Out of {{quiz.quiz_attempts}} plays</h4>

      <h3>Questions</h3>

      <component
        v-for="(question, index) in quiz.questions"
        :class="'question question--'+question.question_type.toLowerCase()"
        :is="question.question_type"
        :key="Math.round(Math.random()*10000)"
        :index="index"
        :model="question"
      ></component>
    </div>
</template>

<script>
  import MultipleChoice from './Questions/Info/MultipleChoice.vue';
  export default {
    name: "QuizInfo",
    components: {
      MultipleChoice,
    },
    data() {
      return {
        quiz: {},
        averageScore: 0.0,
      }
    },
    methods: {
      loaded() {
        let totalAttempts = 0,
          correctAttempts = 0;
        for (let index in this.quiz.questions) {
          totalAttempts += this.quiz.questions[index].total_attempts;
          correctAttempts += this.quiz.questions[index].correct_attempts;
        }
        this.averageScore =  Math.round(correctAttempts / totalAttempts * 1000)/10;
      }
    },

    created() {
      let self = this;
      if (this.$route.params.id != undefined) {
        axios.get(window.apiURI+"/api/quiz/"+this.$route.params.id)
          .then(function (response) {
            self.$set(self, 'quiz', response.data.quiz);
            self.loaded();
          },
        ).catch(error => {
          console.log("Quiz fetch error");
        });
      }
    },
  }
</script>
