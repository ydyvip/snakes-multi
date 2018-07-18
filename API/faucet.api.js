
var router = require("express").Router();
var Faucets = require("../DB/faucet.db.js");
var Users = require("../DB/users.db.js");

router.get("/", function(req,res){

  Faucets.getAllForList()
  .then((faucet_list)=>{

    res.json({
      faucet_list: faucet_list
    });

  })

})

router.post("/send", function(req,res){

  // Handling withdraws

  Faucets.reduceBalanceByReward(req.body.api_key)
  .then((reward)=>{

    Users.incrementBalanceForAdressOwner(req.body.to, reward );

    res.end();

  })


})

module.exports = router;
