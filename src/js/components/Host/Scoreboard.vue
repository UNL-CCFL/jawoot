<template>
  <div id="host--scoreboard" :class="'slide '+ fade">
    <div>
      <h1>Scoreboard</h1>
      <div id="scoreboard">
        <div v-for="(player, index) in scoreboard" class="playerScore">
          <div :class="{scoreboard__player_name: true, inactive : player.active == 0}">
            <i v-if="player.active == 0" class="fas fa-ghost"></i>
            {{player.name}}
            <span v-if="player.active == 0">Inactive</span>
          </div>
          <div class="scoreboard__player_points">{{player.totalPoints}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "HostScoreboard",
    data() {
      return {
        fade: 'redBG',
      }
    },
    props: {
      scoreboard: {
        type: Array,
      }
    },
    created() {
      EventBus.$on('scoreboardBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'scoreboardBGColor');
    },
    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
