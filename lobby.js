
var games = [
  {
    cnt_players: 5,
    players: ["john", "paul", "sandre", "kuba", "micke"],
    name: "Fast !",
    bet: 250 // satoshi amount
  },
  {
    cnt_players: 3,
    players: ["piotr", "sam", "jacob"],
    name: "Faster !",
    bet: 500 // satoshi amount
  }

];

games.getRoomWithName = function(gamename){

  var room = this.find( function(game){

    if(game.name == gamename)
      return true;

  });

  return room;

}


module.exports = function( io ){


  io.on("connection", function(socket){

    socket.on("getgamelist", function(){

      socket.emit("updategamelist", games);

    })

    socket.on("join", function(data){

      var previousroom = null;
      var currentroom = data.roomname;

      var room = games.getRoomWithName(currentroom);
      if(!room || room.cnt_players>=6){
        return; // TODO: room is full
      }

      // update previous game
      games.findIndex( (game)=>{

        if(game.name == socket.currentRoom){
          game.cnt_players--;
          previousroom = game.name;
          // remove player from list
          var index = game.players.findIndex((player)=>{

            if(player == data.loggedAs){
              return true;
            }

          });
          game.players.splice(index, 1);
          return true;
        }

      })

      // update new game
      games.findIndex( (game)=>{

        if(game.name == data.roomname){
          game.cnt_players++;
          game.players.push(data.player);
          socket.currentRoom = data.roomname;

          socket.broadcast.emit("roomchanged", data.player, previousroom, currentroom);

          return true;
        }

      })

    })

  })



}
