<template>
  <div id="loading">
    <h1 :class="fade">Jawoot!</h1>
    <i class="waiting fas fa-circle-notch fa-spin"></i>
    <div :class="'loading '+fade">Connecting...</div>
  </div>
</template>

<script>
  export default {
    name: "Connecting",
    data() {
      return {
        fade: 'redBG',
      }
    },
    created() {
      EventBus.$on('ConnectingBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'ConnectingBGColor');
    },
    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
