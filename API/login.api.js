
var router = require("express").Router();
var passport = require("passport");
const axios = require("axios");
const querystring = require('querystring');

var Users = require("../DB/users.db.js");
var Stats = require("../DB/stats.db.js");


router.post("/", passport.authenticate("json"), function(req, res){

  // authentication successfull, req.user populated
  // if authentication fails, Passport will respond with a 401 Unauthorized status
  // Strategies must be configured prior to using them in a route

  if(!req.body.rememberMe){
    req.session.cookie.expires = false;
  }

  res.json({
    success: true,
    username: req.user.username,
    balance: req.user.balance_total
  })

});

// get initial data from user
router.get("/session", function(req,res){

    if(!req.user){
      res.end();
      return;
    }

    res.json({
      username: req.user.username,
      balance: req.user.balance_total
    })


})

router.get("/session/balance", function(req,res){

    if(!req.user){
      res.end();
      return;
    }

    res.json({
      balance_total: req.user.balance_total,
      balance_withdrawal: req.user.balance_withdrawal,
    })


})

router.get("/logout", function(req,res){

  req.session.destroy((err)=>{
    res.end();
  })

})

router.post("/withdraw", function(req,res){

  /*
    req.body.where
    req.body.amount
    req.body.wallet_id
  */

  if(!req.user){
    res.end();
    return;
  }

  console.log("/withdraw")

  Users.checkBalanceForWalletWithdrawal(req.user.username, req.body.amount)
  .then((reduction_obj)=>{

    if(reduction_obj.success == false){
      res.json({
        success: false,
        failure_reason: reduction_obj.failure_reason
      })
      return;
    }

    const api_key = "SbnetlXTapubCeeLV2hrKIOQi00tErpP";
    const user_token = "tokenik";

    axios.post("https://expresscrypto.io/public-api/v2/sendPayment",  querystring.stringify({
      api_key: api_key,
      userId: req.body.wallet_id,
      currency: "BCH",
      user_token: user_token,
      amount: req.body.amount,
      payment_type: "Normal"
    }),
    {
      headers: {'Content-type': 'application/x-www-form-urlencoded'}
    })
    .then((response)=>{
      console.log("response from ec");
      console.log(response.data);
      if(response.data.status == 200){

        Users.reduceBalance(req.user.username, reduction_obj);

        res.json({
          success: true
        })
        return;
      }
      else{
        res.json({
          success: false,
          failure_reason: "Something went wrong. Try again later."
        })
        return;
      }
    });

  })

})

router.get("/stats", (req, res)=>{

  Stats.getStats()
  .then((stats)=>{

	if(!stats.winners_earn){
	  stats.winners_earn = 0;
	}

	if(!stats.registered_users){
	  stats.registered_users = 0;
	}

	if(!stats.matches_played){
	  stats.matches_played = 0;
	}

	res.json(stats);

  })

})

router.post("/ranking", (req,res)=>{

  if(req.body.page<0){
    res.json(null);
    return;
  }

  Users.getRanking(req.body.page)
  .then((ranking)=>{
    const {arr_players, isCurPageLast} = ranking;

    if(arr_players.length == 0){
      res.json(null);
      return;
    }
    else{
      res.json({
        ranking: arr_players,
        isCurPageLast: isCurPageLast
      });
    }


  })


});

module.exports = router;
