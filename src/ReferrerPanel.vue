<template>
  <div class="main-box">

    <a style="display: inline-block; margin-bottom: 40px; " v-on:click.prevent="$emit('returnToPreviousPanel')" class="href username" href="">&lt;&lt;&lt; Return</a>

    <div class="box">

      <div class="h">
        Your referrer link:
      </div>

      <div class="ref">
        http://snakes-multi.win/register/ref/<span style="weight: 900;">your_user_name</span>
      </div>

      <div>
        You will receive 8% of winnings of users registered from above link
      </div>

    </div>

    <div class="box">

      Amount of referrals: {{ ref_amount }} <br/>
      Earnings from referrers: {{ ref_earned }}

    </div>

  </div>
</template>

<script>

  module.exports = {

    data: ()=>({

      ref_amount: 0,
      ref_earned: 0

    }),

    mounted: function(){

      this.$axios.get("/referrer/stats")
      .then((res)=>{
        this.ref_amount = res.data.ref_amount;
        this.ref_earned = res.data.ref_earned;
      })

    }

  }

</script>

<style scoped>

.box {
  font-family: 'Titillium Web', sans-serif;
  color: white;
  border-top: 1px solid #476fa9;
  margin: 0 40px;
  padding: 30px;
  text-align: center;
  font-size: 20px;
  border-top: 1px solid #476fa9;
}

.h {
  font-size: 25px;
}
.ref{
  padding: 5px 15px;
  display: inline-block;
  color: #f09f9f;
  border: 1px solid black;
  background-color: #41668f;
  border-radius: 20px;
  margin: 10px;
}
</style>
