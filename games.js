
var games = [];

games.getRoomWithName = function(gamename){

  var room = this.find( function(game){

    if(game.name == gamename)
      return true;

  });

  return room;

}

games.getGameList = function(){

  var arr = [];

  games.forEach( (game_item)=>{

    var p_names = [];

    game_item.players.forEach( (player_item)=>{
      p_names.push(player_item.playername);
    })

    arr.push({
      cnt_players: game_item.cnt_players,
      max_players: game_item.max_players,
      bet: game_item.bet,
      name: game_item.name,
      players: p_names
    });


  });

  return arr;

}

games.isPlayerInGame = function(playername){

  for(var game_item of games){

    for(var player_item of game_item.players){
      if(player_item.playername == playername){
        return game_item.name;
      }
    }

  }

  return false;

}

module.exports = games;
