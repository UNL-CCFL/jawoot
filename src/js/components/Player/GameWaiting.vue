<template>
  <div id="player--game_waiting" :class="'slide '+fade">
    <div id="playerCount">Players in Lobby ({{Object.keys(players).length}})</div>
    <div id="playerList">
      <div v-for="(player, index) in players" :class="{inactive : player.active == 0} ">
        <i v-if="player.active == 0" class="fas fa-ghost"></i>
        {{player.name}}
        <div v-if="player.active == 0">Inactive</div>
      </div>
    </div>
    <div id="waitingForPlayers"><i class="fas fa-user-clock"></i> Waiting for host to start game...</div>
  </div>
</template>

<script>
  export default {
    name: "",

    data() {
      return {
        fade: "redBG",
      }
    },

    props: {
      players: {
        Type: Object,
      },
    },

    created() {
      EventBus.$on('gameWaitingBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'gameWaitingBGColor');
    },

    methods: {
      setBGColor(color) {
        this.fade = color;
      },
    },
  }
</script>
