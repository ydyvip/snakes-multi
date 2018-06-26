
<template>

  <div class="top-box">
    <transition-group name="player-table-list" tag="div">
      <div v-for="player in player_table" v-bind:key="player.playername">
        <div v-bind:class="{dead: !player.live}" v-bind:style="{backgroundColor: player.color}" class="flag"></div>
        <span v-bind:class="{dead: !player.live}" class="player">{{player.playername}}</span>
        <span v-bind:class="{dead: !player.live}" class="points">{{player.points}}</span>
        <transition v-on:enter="on_enter" v-on:leave="on_leave">
          <span style="display: inline-block" v-if="!player.live || player.winner">+{{player.round_points}}</span>
        </transition>
      </div>
    </transition-group>
  </div>

</template>

<script>



  module.exports = {

    props: ["player_table"],

    data: ()=>({

      cnt_killed: 0,
      cnt_players: 6,
      round_ended: false

    }),

    methods: {

      on_enter: function(el, done) {

        this.$anime({
          targets: el,
          opacity: [0,1],
          complete: done,
          duration: 2000,
          easing: "linear"
        })

      },

      on_leave: function(el, done){

        this.$anime({
          targets: el,
          opacity: [1,0],
          complete: done,
          duration: 2000,
          easing: "linear"
        })

      },

      endRound: function() {

        for( var player_item of this.player_table){

          this.round_ended = true;

          if(player_item.live){
            player_item.winner = true;
            player_item.round_points = this.cnt_players-1;
          }

        }

        setTimeout( this.incrementByRoundPoints, 2000 );

      },

      incrementByRoundPoints: function(){

        for( var player_item of this.player_table){

          //player_item.points += player_item.round_points;
          player_item.live = true;
          player_item.winner = false;

          var a  = this.$anime({targets: player_item, points: "+="+player_item.round_points, round: true, duration: 500, easing: "linear"})
          a.finished.then( ()=>{

            this.player_table = this.player_table.sort( (a,b)=>{
              if(a.points>b.points)
                return -1;
              else if(a.points<b.points)
                return 1
              else {
                return 1;
              }
            })

          })

        }

      }

    },

    mounted: function(){

      this.$io.on("killed", (playername)=>{

        if(this.round_ended)
          return;

        for( var player_item of this.player_table){

          if(player_item.playername == playername){
            player_item.live = false;
            player_item.round_points = this.cnt_killed;
            this.cnt_killed++;
          }

        }

        if(this.cnt_killed == this.cnt_players-1){
          this.endRound();
        }

      })

      this.$io.on("round_start", ()=>{

        this.cnt_killed = 0;
        this.round_ended = false;

      })

    }


  }

</script>

<style scoped>

@import url('https://fonts.googleapis.com/css?family=Jua');


  .top-box {
    display: inline-block;
    vertical-align: top;
    background-color: #5e6672;
    padding: 20px;
    width: 350px;
    margin-left: 15px;
    margin-top: 15px;
    font-family: 'Jua', sans-serif;
    font-size: 22px;;
    color: white;
  }

  .player {
    width: 150px;
    display: inline-block;
    margin-right: 10px;
    transition: opacity 2s;
  }

  .points{
    width: 30px;
    display: inline-block;
    transition: opacity 2s;
  }

  .dead{
    transition: opacity 2s;
    opacity: 0.2;
  }

  .flag {
    display: inline-block;
    height: 22px;
    width: 12px;
    background-color: pink;
    transition: opacity 2s;
  }

  .player-table-list-move{
    transition: transform 2s;
  }


</style>
