<template>
  <div id="player--waiting_on_answers" :class="'slide '+fade">
    <i class="waiting fas fa-circle-notch fa-spin"></i>
  </div>
</template>

<script>
  export default {
    name: "PlayerWaitingOnAnswers",
    data() {
      return {
        fade: 'redBG',
      }
    },
    created() {
      EventBus.$on('waitingOnAnswersBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'waitingOnAnswersBGColor');
    },
    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
