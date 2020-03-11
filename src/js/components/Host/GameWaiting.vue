<template>
  <div id="host--game_waiting" :class="'slide '+fade">
    <div id="playerCount">Players in Lobby ({{Object.keys(players).length}})</div>
    <button v-on:click="startGame" :disabled="canStartGame" id="start_game">Start Game</button>
    <div id="playerList">
      <div v-for="(player, index) in players" :class="{inactive : player.active == 0} ">
        <i v-if="player.active == 0" class="fas fa-ghost"></i>
        {{player.name}}
        <div v-if="player.active == 0">Inactive</div>
      </div>
    </div>
    <div id="waitingForPlayers"><i class="fas fa-user-plus"></i> Waiting for more players...</div>
  </div>
</template>

<script>
  export default {
    name: "",

    data() {
      return {
        fade: 'redBG',
      }
    },

    props: {
      players: {
        Type: Object,
      },
      canStartGame: {
        type: Boolean,
      },
    },

    created() {
      EventBus.$on('gameWaitingBGColor', this.setBGColor);
      EventBus.$emit('getBGColor', 'gameWaitingBGColor');
    },

    mounted() {
    },

    methods: {
      setBGColor(color) {
        this.fade = color;
      },
      startGame() {
        this.$emit('startGame');
      },
    },
  }
</script>
