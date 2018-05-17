<template>

  <div class="game-box">

    <div v-for="game in games" style="height: 45px;">
      <img v-for="n in game.cnt_players" src="img/circle-24-on.png" />
      <img v-for="n in 6-game.cnt_players" src="img/circle-24-off.png" />
      <span class="game-name">{{game.name}}</span>
      <span class="bet">{{game.bet}} Satoshi</span>
      <button><b>JOIN</b></button>
    </div>

  </div>

</template>

<script>

  module.exports = {



    data: ()=>({

      games: [
        {
          cnt_players: 4,
          players: ["john", "paul", "sandre", "kuba"],
          name: "Fast !",
          bet: 250 // satoshi amount
        },
        {
          cnt_players: 3,
          players: ["piotr", "sam", "jacob"],
          name: "Faster !",
          bet: 500 // satoshi amount
        }

      ]

    }),



  }

</script>

<style scoped>

button {
  color: black;
  width: 100px;
  padding: 4px;
  box-sizing: border-box;
  vertical-align: middle;
  margin-left: 50px;
}

button {
  font-family: 'Titillium Web', sans-serif;
  border-radius: 10px;
  border-color: black;
  background-color: #2ece2e;
  box-sizing: border-box;
}

button:active {
  padding-top: 5px;
  padding-bottom: 3px;
}

button:focus {
  outline: none;
}

.bet {
  color: #efdf24;
  font-family: 'Titillium Web', sans-serif;
}

.game-name {
  display: inline-block;
  width: 150px;
  margin-right: 20px;
  margin-left: 20px;
  color: white;
  font-size: 20px;
  font-family: 'Titillium Web', sans-serif;
}

.game-box {
  width: 800px;
  height: 800px;
  margin: 30px auto;
  background-color: #5e6672;
}

img {
  width: 18px;
  height: 18px;
  margin-right: 5px;
  position: relative;
  top: 3px;
}

</style>
