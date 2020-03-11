<template>
  <div id="host--get_ready" :class="'slide '+ fade">
    <div>
      <h1>Get Ready!</h1>
      <i class="waiting fas fa-circle-notch fa-spin"></i>
    </div>
  </div>
</template>

<script>
  export default {
    name: "HostGetReady",
    data() {
      return {
        fade: 'redBG',
      }
    },
    created() {
      EventBus.$on('getReadyBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'getReadyBGColor');
    },
    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
