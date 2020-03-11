<template>
  <div id="host--overall_results" :class="'slide '+fade">
    <h1 id="question">{{quiz.title}}</h1>

    <div id="podium">
      <div id="podium__first">
        <div class="podium_name">{{this.results[0].name}}</div>
        <div class="podium">
          <div class="medal">
            <div class='medal_ribbons'></div>
            <div class="medal_place st1">1<sup>st</sup></div>
            <div class="points">{{this.results[0].totalPoints}} pts</div>
            <div class="position">1st of {{this.results.length}}</div>
          </div>
        </div>
      </div>
      <div id="podium__second" v-if="this.results[1] != undefined">
        <div class="podium_name">{{this.results[1].name}}</div>
        <div class="podium">
          <div class="medal">
            <div class='medal_ribbons'></div>
            <div class="medal_place nd2">2<sup>nd</sup></div>
            <div class="points">{{this.results[1].totalPoints}} pts</div>
            <div class="position">2nd of {{this.results.length}}</div>
          </div>
        </div>
      </div>
      <div id="podium__third" v-if="this.results[2] != undefined">
        <div class="podium_name">{{this.results[2].name}}</div>
        <div class="podium">
          <div class="medal">
            <div class='medal_ribbons'></div>
            <div class="medal_place rd3">3<sup>rd</sup></div>
            <div class="points">{{this.results[2].totalPoints}} pts</div>
            <div class="position">3rd of {{this.results.length}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "HostOverallResults",

    data() {
      return {
        fade: 'redBG',
      }
    },

    computed: {
    },

    props: {
      quiz: {
        type: Object,
      },
      results: {
        type: Array,
      }
    },

    created() {
    },

    mounted() {
      console.log(this.results);
    },

    methods: {
    },
  }
</script>
