<template>
  <div id="loading">
    <h1 :class="fade">Jawoot!</h1>
    <i :class="'waiting fas fa-circle-notch fa-spin '+fade"></i>
    <div :class="'loading '+fade"> Loading...</div>
  </div>
</template>

<script>
  export default {
    name: "Loading",
    data() {
      return {
        fade: 'redBG',
      }
    },
    created() {
      EventBus.$on('loadingBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'loadingBGColor');
    },
    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
