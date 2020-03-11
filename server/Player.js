class Player {
  constructor(player) {
    this.socket_id = player.socket_id;
    this.name = player.name;
    this.session_code = player.session_code;
    this.totalPoints = 0;
  }

  addPlayer(player) {
    this.players[player.id] = player;
  }

  removePlayer(player_id) {
    delete this.players[player_id];
  }
}
module.exports = {Player};
