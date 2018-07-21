
var router = require("express").Router();
var Faucets = require("../DB/faucet.db.js");
var Users = require("../DB/users.db.js");

// https://stackoverflow.com/a/15855457/8060962
function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

router.get("/", function(req,res){

  Faucets.getAllForList()
  .then((faucet_list)=>{

    res.json({
      faucet_list: faucet_list
    });

  })

})

router.post("/register", function(req,res){

  var response = {
    success: null,
    errs: []
  }

  var promise = Promise.resolve(true);

  if( !req.user){
    res.status(400).end();
  }

  if( !req.body.name ){
    response.errs.push({
      for: "name",
      msg: "Faucet name is required"
    })
  }

  else{
    promise = Faucets.faucetNameTaken(req.body.name);
    promise = promise.then((taken)=>{

      if(taken){
        response.errs.push({
          for: "name",
          msg: "Faucet name  already taken"
        })
      }

    })
  }

  if( !req.body.url ){
    response.errs.push({
      for: "url",
      msg: "Faucet address is required"
    })
  }
  else if ( !validateUrl(req.body.url)){
    response.errs.push({
      for: "url",
      msg: "Invalid URL format"
    })
  }
  if( !req.body.reward ){
    response.errs.push({
      for: "reward",
      msg: "Faucet reward is required"
    })
  }
  else if( isNaN( parseInt(req.body.reward) )){
    response.errs.push({
      for: "reward",
      msg: "Invalid input format"
    })
  }
  else if ( parseInt(req.body.reward) < 10){
    response.errs.push({
      for: "reward",
      msg: "Minimum faucet reward is 10 Satoshi"
    })
  }
  if( !req.body.timer ){
    response.errs.push({
      for: "timer",
      msg: "Faucet timer is required"
    })
  }
  else if( isNaN( parseInt(req.body.timer) ) ){
    response.errs.push({
      for: "timer",
      msg: "Invalid input format"
    })
  }
  else if( parseInt(req.body.timer) < 1  ){
    response.errs.push({
      for: "timer",
      msg: "Minimum waiting time between withdraws is 1 minute"
    })
  }
  else if( req.body.timer > 1440 ){
    response.errs.push({
      for: "timer",
      msg: "Maximum waiting time between withdraws is 24 hours"
    })
  }

  promise.then(()=>{
    if(response.errs.length > 0){
      response.success = false;

      res.json(response);

    }
    else{
      response.success = true;
      Faucets.register(req.body.name, req.body.url, req.body.reward, req.body.timer, req.user.username)
      .then((register_result)=>{
        response.btc_deposit = register_result.btc_deposit;
        response.api_key = register_result.api_key;
        res.json(response);
      })
    }
  })


})

router.post("/send", function(req,res){

  // Handling withdraws

  Faucets.withdraw(req.body.api_key)
  .then((reward)=>{

    Users.incrementBalanceForAdressOwner(req.body.to, reward );

    res.end();

  })


})



module.exports = router;
