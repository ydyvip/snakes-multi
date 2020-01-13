
<template>

  <div class="ranking_box">

    <table>
      <tr v-for="(rank_item, index) of rank_arr">
        <td>{{cur_page*15+index+1}}</td>
        <td>{{rank_item.username}}</td>
        <td>{{rank_item.points}}</td>
      </tr>
    </table>

    <div style="margin: 0 auto; text-align: center;">
      <a href="" class="href" v-on:click.prevent="previousPage">&lt;&lt;</a>
      &nbsp;&nbsp;&nbsp; {{cur_page+1}} &nbsp;&nbsp;&nbsp;
      <a href="" class="href" v-on:click.prevent="nextPage">&gt;&gt;</a>
    </div>

  </div>

</template>

<script>

  module.exports = {

    data: ()=>({
      rank_arr: [],
      cur_page: 0
    }),

    mounted: function(){

      this.pageRequest(0);

    },

    methods: {

      pageRequest: function(page_dir){

        var page_requested;

        if(page_dir==0){
          page_requested = 0;
        }

        if(page_dir == 1){
          page_requested = this.cur_page+1;
        }
        if(page_dir == -1){
          page_requested = this.cur_page-1;
        }

        this.$axios.post("/login/ranking", {page: page_requested})
        .then((response)=>{

          console.log("ranking");
          console.log(response.data);

          if(response.data==null){
            return;
          }

          this.rank_arr = response.data.ranking;

          this.cur_page = page_requested;

        })

      },

      previousPage: function(){

        if(this.cur_page == 0){
          return;
        }

        this.pageRequest(-1);


      },

      nextPage: function(){

        this.pageRequest(1);

      }

    }
  }

</script>

<style>

.ranking_box{
  color: white;
}
.ranking_box td{
  padding: 4px;
  border-bottom: 1px solid #476fa9;
}

.ranking_box td:nth-child(1){
  padding: 4px 10px;
  width: 10px;
}
.ranking_box td:nth-child(2){
  width: 200px;
}

.ranking_box table{
  border-collapse: collapse;
  margin: 10px auto 10px;
}

</style>
