<template>
    <div class="main-box">

      <table>
        <tr>
          <th>Name</th>
          <th>Reward</th>
          <th>Timer</th>
          <th>Visit</th>
        </tr>
        <tr v-for="faucet in faucet_list">
          <td>{{faucet.name}}</td>
          <td>{{faucet.reward}}</td>
          <td>{{faucet.timer}}</td>
          <td v-if="!faucet.countdown">
            <a class="href" v-bind:href="faucet.address">Visit >></a>
          </td>
          <td v-if="faucet.countdown">
            {{ checkZero(faucet.countdown.getMinutes()+"") + ":" + checkZero(faucet.countdown.getSeconds()+"") }}
          </td>
        </tr>
      </table>

    </div>
</template>


<script>



  module.exports = {

    data: ()=>({

      faucet_list: [],
      interval: undefined

    }),

    mounted: function(){

      this.$axios.get("/faucet")
      .then((res)=>{

        this.faucet_list = res.data.faucet_list;

        var cur_date = new Date();

        this.faucet_list = this.faucet_list.map( (x)=>{

            var last_visited = new Date(x.last_visited).getTime();
            var ms_to_complete_timer = last_visited + x.timer * 60 * 1000 - cur_date.getTime();
            if(ms_to_complete_timer>0){
              x.countdown = new Date(ms_to_complete_timer);
            }
            return x;
        })
      })

      this.interval = setInterval( ()=> {

        for( let [index, faucet] of this.faucet_list.entries()){
          if(faucet.countdown){
            faucet.countdown.setTime( faucet.countdown.getTime() - 1000 );
            if(faucet.countdown.getTime()<0){
              faucet.countdown = undefined;
            }
            this.$set(this.faucet_list, index, faucet );
          }
        }

      }, 1000)

    },

    beforeDestroy: function(){
      clearInterval(this.interval);
    },

    methods: {

      checkZero: function(data){
        if(data.length == 1){
          data = "0" + data;
        }
        return data;
      }

    }
  }

</script>

<style scoped>

  table {
    margin: 0 auto;
    text-align: center;
  }

  tr th {
    color: white;
    width: 135px;
    font-family: 'Titillium Web', sans-serif;
    font-size: 20px;
  }

  tr td {
    color: white;
    font-family: 'Titillium Web', sans-serif;
  }

</style>
