
module.exports = {

  stubGamePrototype: function(Game){

    Object.defineProperty(Game.prototype, "makeInitPositions", { value: function(player){

      var pos = {
        x: 200,
        y: 200
      };

      var angle = 90;

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
