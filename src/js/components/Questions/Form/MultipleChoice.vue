<template>
  <div :class="'question '+(isEditing ? 'question--editing' : '')" v-if="question != null">
    <template v-if="isEditing">

      <h4><i class="fa fa-grip-lines move" title="Reorder Question"></i>Multiple Choice Answer Question</h4>
      <div class="question_wrapper">
        <div class="form_field">
          <label :for="'question_text'+question.question_id">Question Text</label>
          <input
            :id="'question_text'+question.question_id"
            :name="'question_text'+question.question_id"
            v-validate.disable="'required'"
            data-vv-as="question"
            :class="{'has_error': errors.has('question_text'+question.question_id)}"
            type="text"
            v-model="question.question">
            <span class="form_field_error">{{ errors.first('question_text'+question.question_id) }}</span>
        </div>
        <div class="form_field">
          <label for="question_time_limit">Time Limit</label>
          <select
            name="question_time_limit"
            id="question_time_limit"
            data-vv-as="time limit"
            v-validate.disable="'required'"
            v-model="question.time_limit">
            <option value="0">No Limit</option>
            <option value="20">20 Seconds</option>
            <option value="40">40 Seconds</option>
            <option value="60">1 Minute</option>
          </select>
          <span class="form_field_error">{{ errors.first('question_time_limit') }}</span>
        </div>

        <h4>Answers</h4>

        <draggable
          :group="{ name: 'answers', pull: false, }"
          handle=".fa-grip-lines"
          :class="'answers'"
          :list="question.answers"
          @update="draggableUpdate"
          @change="draggableChange">

          <div v-for="(answer, index) in question.answers" class="answer form_field">
            <label class="answer_label" :for="'answer_text'+answer.answer_id">
              <i class="fa fa-grip-lines move" title="Reorder Answer"></i>
              Answer {{index+1}}
            </label>
            <button class="remove_answer button button--inverted"
                v-if="question.answers.length > 2"
                v-on:click="removeAnswer(index)">
              <i class="fa fa-times delete"
              title="Remove Answer"></i>Remove Answer
            </button>
            <input
              :id="'answer_text'+answer.answer_id"
              :name="'answer_text'+answer.answer_id"
              v-validate.disable="'required'"
              data-vv-as="answer"
              :class="{'has_error': errors.has('answer_text'+answer.answer_id)}"
              type="text"
              v-model="question.answers[index].answer">
            <div class="form_field_error">{{ errors.first('answer_text'+answer.answer_id) }}</div>
            <label :id="'answer_is_correct'+answer.answer_id" class="answer_is_correct">
              <input type="radio"
                :name="'answer_is_correct['+question.question_id+']'"
                :id="'answer_is_correct'+answer.answer_id"
                data-vv-as="answer is correct"
                :data-vv-name="'answer_is_correct'+question.question_id"
                v-validate="'required'"
                value='true'
                :class="{'has_error': errors.has('answer_is_correct'+question.question_id)}"
                v-on:change="correctAnswerUpdate(index)"
                v-model="question.answers[index].is_correct">
              <span>
                <i class="fas fa-check-circle" v-if="question.answers[index].is_correct"></i>
                <i class="fas fa-circle" v-else></i>
                Is Correct
              </span>
            </label>
            <div class="form_field_error">{{ errors.first('answer_is_correct'+question.question_id) }}</div>
          </div>
        </draggable>
        <div class="form_field">
          <button @click.prevent="addAnswer"
            class="add_answer button--inverted"
            :disabled="question.answers.length >= 4"
            ><i class="fas fa-plus"></i> Add Answer</button>
        </div>
      </div>
    </template>

    <template v-else>
      <i class="fa fa-grip-lines move" title="Reorder Question"></i>
      <span class="question_title">
        {{question.question}}
      </span>
      <div class="question_actions">
        <i class="fa fa-times delete"
          title="Remove Question"
          v-on:click="removeQuestion(question.question_id)"></i>
        <i class="fas fa-pencil-alt edit"
          title="Edit Question"
          v-on:click="isEditing = !isEditing;"></i>
      </div>
    </template>
  </div>
</template>
<script>
  import draggable from "../../DraggableAndVeeValidate.vue";
  export default {
    inject: {
      $validator: '$validator',
    },
    components: {
      draggable,
    },
    data() {
      return {
        isEditing: false,
        question: {
          title: '',
          answers: [
            {answer: '', answer_order: 0, is_correct: true,},
            {answer: '', answer_order: 1, is_correct: false,},
          ],
        },
        answers_deleted: [],
      }
    },
    props: ['model'],
    mounted() {
    },
    created() {
      this.$set(this, 'question', this.model);
      if (this.question.question_id <= 0) {
        this.isEditing = true;
      }
      this.updateOrders();
    },
    methods: {
      removeAnswer(index) {
        if (this.question.answers.length == 2) {
          this.$emit('removedAnswer', this.question.answers[index].answer_id);
          this.question.answers[index].answer = '';
          this.question.answers[index].answer_id = 0;
        }
        else {
          this.$emit('removedAnswer', this.question.answers[index].answer_id);
          this.question.answers.splice(index, 1);
        }
        this.updateOrders();
      },
      addAnswer() {
        if (this.question.answers.length < 4) {
          this.question.answers.push({answer_id: 0, answer: '', answer_order: 0});
        }
        this.updateOrders();
      },
      correctAnswerUpdate(index) {
        for ( let i in this.question.answers) {
          if (i == index) {
            this.question.answers[i].is_correct = true;
          }
          else {
            this.question.answers[i].is_correct = false;
          }
        }
        return true;
      },
      draggableUpdate() {
        this.updateOrders();
      },
      draggableChange(e) {
      },
      draggableAdd(e) {
      },
      updateOrders() {
        let order = 0;
        for ( let i in this.question.answers) {
          this.question.answers[i].answer_order = order;
          order++;
        }
      },
      removeQuestion(id) {
        this.$emit('removedQuestion', this.question.question_order);
      },
    },
  }
</script>
