<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
    <Pie :init-adcode="100000" :init-statics-type="'confirmedCount'"/>
  <!-- <RouterView /> -->
</template>

<style lang="less" scoped>
  div {
    width:100%;
  }
</style>
