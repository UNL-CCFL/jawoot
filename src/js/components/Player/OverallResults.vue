<template>
  <div id="player--overall_results" :class="'slide '+fade">
    <div class="medal" v-if="result">
      <div class='medal_ribbons medal_ribbons__complete'><div class="complete"></div></div>
      <div :class="'medal_place '+nth+''+place">{{place}}<sup>{{nth}}</sup></div>
      <div class="points">{{result.totalPoints}} pts</div>
      <div class="position">{{place}}{{nth}} of {{results.length}}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "",

    data() {
      return {
        fade: 'redBG',
        place: 0,
      }
    },
    props: {
      results: {
        type: Array,
        default: [],
      },
      playerID: {
        type: String,
      },
    },

    computed: {
      result() {
        let result = false;
        for(let i = 0; i < this.results.length; i++) {
          console.log(this.results[i].socket_id," == ", this.playerID)
          if (this.results[i].socket_id == this.playerID) {
            this.place = i+1;
            result = this.results[i];
            break;
          }
        }
        return result;
      },
      nth() {
        if (this.place > 3 && this.place < 21) return 'th';
        switch (this.place % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      },
    },
    created() {
      console.log('player overallResults', this.results);
    },

    mounted() {
      console.log('this.playerID', this.playerID);
    },

    methods: {
    },
  }
</script>
