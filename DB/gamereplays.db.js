var ObjectId = require('mongodb').ObjectId;

var p = require("../db.js").promise;

var gamereplays = {};

p.then( function(db){

  gamereplays.coll = db.collection("gamereplays");

})

gamereplays.insertOne = function(game_replay){

  this.coll.insertOne(game_replay);

}

gamereplays.getList = function(){

  var replaylist = [];

  return this.coll.find({}, {_id: 1, name: 1, winner: 1, reward: 1}).toArray()
  .then((res_replaylist)=>{

    for(var replay_item of res_replaylist){
      replay_item._id = replay_item._id.toHexString()
      replaylist.push(replay_item);
    }
    console.log(replaylist);
    return replaylist;

  })
}

gamereplays.getReplayMeta = function(replay_id){

  return this.coll.findOne({ _id: ObjectId(replay_id)}, {
    _id: 0,
    cnt_rounds: 1,
    cnt_players: 1,
    name: 1,
    bet: 1,
    players: 1
  })
  .then((replay_meta)=>{
    return replay_meta;
  });

}

gamereplays.getNewRoundPositions = function(replay_id, round_ix, player_name){

  return this.coll.findOne({ _id: ObjectId(replay_id)}, {rounds: { $slice: [round_ix, 1]}, "rounds.new_round_positions": 1})
  .then((res)=>{
    for(var round_pos of res.rounds[0].new_round_positions){
      if(round_pos.for == player_name){
        return round_pos;
      }
    }
  })
}

gamereplays.getInputsForRound = function(replay_id, round_ix){

  return this.coll.findOne({ _id: ObjectId(replay_id)}, {rounds: {$slice:[round_ix,1]}, "rounds.inputs": 1} )
  .then((res)=>{
    return res.rounds[0].inputs;
  })

}

module.exports = gamereplays;
