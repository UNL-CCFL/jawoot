<template>

</template>
<script>
  export default {
    props: {
      model: {
        type: Object,
      },
    },
    data() {
      return {

      }
    },
    created() {
      this.question = this.model;
    },
    mounted() {
    },
    methods: {
      answerQuestion(answer) {
        this.$emit('answered', answer);
      },
    },
  }
</script>
