var router = require("express").Router();

var GameReplayDB = require.main.require("./DB/gamereplays.db.js");

router.get("/", function(req, res){

  GameReplayDB.getList()
  .then((replaylist)=>{
    res.json(replaylist);
  })

})

module.exports = router;
