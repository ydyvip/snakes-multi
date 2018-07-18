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
          <td><a class="href" v-bind:href="faucet.address">Visit >></a></td>
        </tr>
      </table>

    </div>
</template>


<script>

  module.exports = {

    data: ()=>({

      faucet_list: []

    }),

    mounted: function(){

      this.$axios.get("/faucet")
      .then((res)=>{

        this.faucet_list = res.data.faucet_list;

      })

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
