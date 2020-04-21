
var router = require("express").Router();

var Users = require("../DB/users.db.js");

router.get("/stats", (req,res)=>{

  if(!req.user.username){
    res.end();
    return;
  }

  Users.getReferrerStats(req.user.username)
  .then((stats)=>{
    res.json({
      ref_amount: stats.ref_amount,
      ref_earned: stats.ref_earned
    })
  })


})

module.exports = router;
