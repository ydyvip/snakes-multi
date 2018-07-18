
var router = require("express").Router();
var Faucets = require("../DB/faucet.db.js");

router.get("/", function(req,res){

  Faucets.getAllForList()
  .then((faucet_list)=>{

    res.json({
      faucet_list: faucet_list
    });

  })



})

module.exports = router;
