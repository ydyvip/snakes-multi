
<template>

  <div class="userpanel">
    <div style="display: inline-block; width: 20%">
      Hello <span class="username">{{username}}</span>
    </div>
    <div style="text-align: right; display: inline-block; width: 75%;" >
      <a v-on:click.prevent="logout" class="href" id="logout" href=""> Logout >> </a>
    </div>
  </div>

</template>

<script>

  module.exports = {

    props: ["username"],
    data: ()=>({

    }),
    methods: {
      logout: function(){

        this.$axios.get("/login/logout")
        .then( ()=>{
          this.$emit("logout")
        } )

      }
    }

  }

</script>

<style scoped>

.userpanel{
  background-color: white;
  color: black;
  padding: 8px;
}

.username {
  font-weight: 900;
}

#logout{
  color: black;
}

</style>
