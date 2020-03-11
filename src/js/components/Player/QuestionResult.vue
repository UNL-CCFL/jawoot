<template>
  <div id="player--question_result" :class="'slide '+fade">
    <div v-if="result.is_correct">
      <h1>Correct!</h1>
      <i class="fas fa-check"></i>
      <div id="plus_points">+{{result.points}}pts</div>
    </div>
    <div v-else>
      <h1>Incorrect! </h1>
      <i class="fas fa-times"></i>
    </div>
  </div>
</template>

<script>
  export default {
    name: "PlayerQuestionResult",

    props: {
      result: {
        type: Object,
      }
    },
    data() {
      return {
        fade: 'redBG',
      }
    },

    created() {
      console.log('questionresults');
      console.log('questionresults', this.result);
      EventBus.$on('questionResultBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'questionResultBGColor');
    },
    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
