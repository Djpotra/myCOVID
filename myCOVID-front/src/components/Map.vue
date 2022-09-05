<script setup>
import * as echarts from 'echarts'
import {getGeoJson} from '@/api'
import { ref,onMounted,watch,computed } from 'vue';

// const name = 'Map';

const props = defineProps({
    adcode:{
        type:Number,
        default:100000
    },
    mapName:{
        type:String,
        default:'china'
    }
})

let echarts_dom = ref(null);
let option = {
    title:{
        
    },
    tooltip:{

    },
    toolbox:{

    },
    visualMap:{

    },
    grid:{
        width:'auto',
        height:'auto'
    },
    series:[{
        name:'',
        type:'map',
        map:props.mapName,
        zoom:1,
        label:{

        },
        data:[

        ]
    }]
}

onMounted(async () => {
    let myChart = echarts.init(echarts_dom.value);
    myChart.showLoading();
    
    let geoJson = await getGeoJson(props.adcode);
    // console.log(geoJson);
    myChart.hideLoading();

    echarts.registerMap(props.mapName,geoJson);
    myChart.setOption(option);
})

</script>

<script>
    export default {
        name:'Map'
    }
</script>

<template>
    <div class="container" ref='echarts_dom'>

    </div>
</template>

<style lang="less" scoped>
    .container{
        width:100%;
        height:800px;
    }
</style>