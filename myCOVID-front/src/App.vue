<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
    <Map :adcode="100000" :statics-type="'confirmedCount'"/>
  <!-- <RouterView /> -->
</template>

<style lang="less" scoped>
  div {
    width:100%;
  }
</style>
