<template>
  <div id="quiz_form" class="slideout_content">
    <form @submit.prevent="saveQuiz">
      <h2 v-if="quiz.quiz_id == 0">New Quiz</h2>
      <h2 v-else>Edit Quiz</h2>

      <div v-if="showDelete" class="alert">
        <p>Are you sure you want to delete this quiz? <strong>This cannot be undone!</strong></p>
        <p>
          <button class="button button--warn" @click.prevent="deleteQuiz">Yes</button>
          <router-link :to="{ name: 'QuizEdit', params: {quiz_id:quiz.quiz_id} }" class="button button--inverted">Cancel</router-link>
        </p>
      </div>

      <div class="form_field">
        <label for="quiz_title" class="quiz_title">Quiz Title</label>
        <input
          id="quiz_title"
          name="quiz_title"
          v-validate="'required'"
          data-vv-as="quiz title"
          :class="{'has_error': errors.has('quiz_title')}"
          type="text"
          v-model="quiz.title">
        <span class="form_field_error">{{ errors.first("quiz_title") }}</span>

      </div>

      <h3>Questions</h3>

      <draggable
        :group="{ name: 'questions', pull: false, }"
        handle=".move"
        :class=""
        :list="quiz.questions"
        @update="draggableUpdate"
        @change="draggableChange">
        <template v-for="(question, index) in quiz.questions">
        <component
          :class="'question question--'+question.question_type.toLowerCase()"
          :is="question.question_type"
          :key="question.question_id"
          :index="index"
          :model="question"
          v-on:removedAnswer="removedAnswer"
          v-on:removedQuestion="removedQuestion"
        ></component>
      </template>
      </draggable>

      <p><button @click.prevent="addQuestion" class="add_question button--inverted"><i class="fas fa-plus"></i>Add Question</button></p>
      <div class="form_controls">
        <button v-on:click="saveQuiz" class="save_quiz" v-if="quiz.quiz_id == 0">Create Quiz</button>
        <button v-on:click="saveQuiz" class="save_quiz" v-else>Update Quiz</button>
        <i v-if="isSaving" class="is_saving fas fa-circle-notch fa-spin"></i>
        <span v-if="statusMessage" :class="{has_error: hasError}" v-html="statusMessage"></span>
      </div>
    </form>
  </div>
</template>

<script>
  import MultipleChoice from './Questions/Form/MultipleChoice.vue';
  import draggable from "./DraggableAndVeeValidate.vue";
  export default {
    name: "Quiz",
    components: {
      MultipleChoice,
      draggable,
    },
    data() {
      return {
        isSaving: false,
        statusMessage: null,
        hasError: false,
        showDelete: false,
        removedAnswers: [],
        removedQuestions: [],
        quiz: {
          quiz_id: 0,
          title: '',
          questions: [{
              question_id: 0,
              question_type: 'MultipleChoice',
              question: '',
              answers: [{answer_id: 0, answer: '', answer_order: 0}],
            }],
        },
      }
    },
    created() {
      let self = this;
      if (this.$route.params.id != undefined) {
        axios.get(window.apiURI+"/api/quiz/"+this.$route.params.id)
          .then(function (response) {
            self.$set(self, 'quiz', response.data.quiz);
          },
        ).catch(error => {
          console.error("Quiz fetch error");

        });
      }
      this.showDelete = parseInt(this.$route.query.delete) === 1 && this.$route.params.id != undefined;
    },
    methods: {
      deleteQuiz() {
        let self = this;
        axios.delete(window.apiURI+"/api/quiz/"+this.quiz.quiz_id,
            self.quiz,
          ).then(function(response){
            EventBus.$emit('quizDelete', self.quiz);
          })
          .catch(function(response){
            self.isSaving = false;
            self.hasError = true;
            self.statusMessage = "Sorry, an error occurred. Please try again or contact support if the error persists.";
          });
      },
      saveQuiz() {
        let self = this;
        this.quiz.removedAnswers = this.removedAnswers;
        this.quiz.removedQuestions = this.removedQuestions;
        this.$validator.validate().then(valid => {
          if (valid && !this.isSaving) {
            this.isSaving = true;
            setTimeout(function() {
              axios.post(window.apiURI+"/api/quiz/"+(self.quiz.quiz_id != 0 ? self.quiz.quiz_id : ''),
                  self.quiz,
                ).then(function(response){
                  self.isSaving = false;
                  self.statusMessage = "Quiz was successfully saved!";
                  setTimeout(function(){
                    self.statusMessage = null;
                  }, 3500);
                  self.$set(self, 'quiz', response.data.quiz);
                  EventBus.$emit('quizUpdated', self.quiz);
                })
                .catch(function(response){
                  self.isSaving = false;
                  self.hasError = true;
                  self.statusMessage = "Sorry, an error occurred. Please try again or contact support if the error persists.";
                  console.log("!!!!!!!",response);
                });
            }, 500)
          }
          else if(!this.isSaving) {
            self.isSaving = false;
            self.hasError = true;
            self.statusMessage = "Please fix the errors above and try submitting again.";
          }
        });
      },
      removedAnswer(id) {
        this.removedAnswers.push(id);
      },
      removedQuestion(index) {
        this.removedQuestions.push(this.quiz.questions[index].question_id);
        if (this.quiz.questions.length == 1) {
          this.quiz.questions[0].question = '';
          this.quiz.questions[0].question_id = 0;
        }
        else {
          this.quiz.questions.splice(index, 1);
        }
        this.updateOrders();
      },
      addQuestion() {
        let id = Math.round(Math.random()*-10000);
        this.quiz.questions.push({
          question_id: id,
          question_type: 'MultipleChoice',
          question: '',
          answers: [{answer_id: 0, answer: '', answer_order: 0},{answer_id: -1, answer: '', answer_order: 1}],
        });
      },
      draggableUpdate() {
        this.updateOrders();
      },
      updateOrders() {
        let order = 0;
        for ( let i in this.quiz.questions) {
          this.quiz.questions[i].question_order = order;
          order++;
        }
      },
      draggableChange() {
      },
    },
  }
</script>
