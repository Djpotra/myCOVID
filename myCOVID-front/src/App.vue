<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
    <Line :init-adcode="100000" :init-statics-type="'deadIncr'"/>
  <!-- <RouterView /> -->
</template>

<style lang="less" scoped>
  div {
    width:100%;
  }
</style>
