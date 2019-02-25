
var positions = require("./fixtures/init_positions.json");

module.exports = {

  stubGamePrototype: function(Game){

    Object.defineProperty(Game.prototype, "makeInitPositions", { value: function(player, playername){

      var pos = {
        x: 0,
        y: 0
      };

      var angle = 0;
      var pos_for = "";

      if(player){
        pos_for = player.name;
      }
      else{
        pos_for = playername;
      }

      for( var pos_item of positions){

        if(pos_item.for == pos_for){
          pos.x = pos_item.x;
          pos.y = pos_item.y;
          angle = pos_item.angle;
        }

      }

      if(player){
        player.curpath.start.x = pos.x;
        player.curpath.start.y = pos.y;
        player.curpath.end.x = pos.x;
        player.curpath.end.y = pos.y;
        player.angle = angle;
        player.base_start_angle = angle;
        player.dir = "straight";
      }

      return {
        pos: pos,
        angle: angle
      }

    }
  });

    console.log(Game.prototype);

  }

}
