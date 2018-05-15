
<template>
  <div class="userpanel">
    Hello <span class="username">{{username}}</span>
  </div>

</template>

<script>

  module.exports = {

    props: ["username"],
    data: ()=>({

    }),
    methods: {

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

</style>
