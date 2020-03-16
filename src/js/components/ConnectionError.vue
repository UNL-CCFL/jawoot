<template>
  <div id="loading">
    <h1 :class="fade">Jawoot!</h1>
    <div :class="'loading '+fade">
      Sorry, there was an error an establishing a connection with the server...
    </div>
  </div>
</template>

<script>
  export default {
    name: "ConnectionError",
    data() {
      return {
        fade: 'redBG',
        serverURI,
        apiURI,
        socketIOURI,
      }
    },
    created() {
      EventBus.$on('ConnectionErrorBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'ConnectionErrorBGColor');
      this.serverURI = window.serverURI;
      this.apiURI = window.apiURI;
      this.socketIOURI = window.socketIOURI;
      console.error('window.serverURI', window.serverURI);
      console.error('window.apiURI', window.apiURI);
      console.error('window.socketIOURI', window.socketIOURI);
    },
    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
