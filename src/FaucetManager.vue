<template>

  <div>

    <v-select id="select_faucet" v-model="selected" :options="names_of_owned"></v-select>

    <div v-if="faucet_details" id="faucet_details">
      <table>
        <tr>
          <td>Name: </td><td>{{faucet_details.name}}</td>
        </tr>
        <tr>
          <td>Website: </td><td>{{faucet_details.url}}</td>
        </tr>
        <tr>
          <td>Approved: </td><td>{{faucet_details.approved}}</td>
        </tr>
        <tr>
          <td>Reward: </td><td>{{faucet_details.reward}}</td>
        </tr>
        <tr>
          <td>Timer: </td><td>{{faucet_details.timer}}</td>
        </tr>
        <tr>
          <td>Balance: </td><td>{{faucet_details.balance}}</td>
        </tr>
        <tr>
          <td>Api key: </td><td>{{faucet_details.api_key}}</td>
        </tr>
        <tr>
          <td>BTC deposit address: </td><td>{{faucet_details.btc_deposit}}</td>
        </tr>
      </table>
    </div>

  </div>

</template>

<script>

  module.exports = {

    data: ()=>({
      names_of_owned: [],
      selected: null,
      faucet_details: null
    }),

    watch: {

      selected: function(newv){

        if(!newv){
          this.faucet_details = null;
        }

        this.$axios.get("/faucet/details/" + newv)
        .then((response)=>{
          this.faucet_details = response.data;
        });

      }

    },

    mounted: function(){

      this.$axios.get("/faucet/namesofowned")
      .then((response)=>{
        this.names_of_owned = response.data;
      })

    }

  }

</script>

<style scoped>

  #select_faucet {
    width: 80%;
    background-color: #bbbab8;
    margin: 25px auto;
    font-family: 'Titillium Web', sans-serif;
    letter-spacing: 3px;
  }

  #faucet_details {
    color: white;
  }
  table {
    border-collapse: collapse;
    margin: 0 auto;
  }
  #faucet_details td {
    padding: 4px;
    border-bottom: 1px solid #476fa9;
  }


</style>
