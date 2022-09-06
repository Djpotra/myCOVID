<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
    <Map :adcode="110000" :map-name="'110000'" :statics-type="'yesterdayLocalConfirmedCount'"/>
  <!-- <RouterView /> -->
</template>

<style lang="less" scoped>
  div {
    width:100%;
  }
</style>
