<script setup>
import { getGeoJson, getNcovJson } from '@/api'
import { ref, onMounted, watch, computed, nextTick, reactive } from 'vue';

import * as echarts from 'echarts/core'
import { MapChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    ToolboxComponent,
    VisualMapComponent
} from 'echarts/components'
import {
    LabelLayout,
    UniversalTransition
} from 'echarts/features'
import {
    CanvasRenderer
} from 'echarts/renderers'

echarts.use([
    MapChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    ToolboxComponent,
    VisualMapComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

const props = defineProps({
    adcode: {
        type: Number,
        default: 100000
    },
    mapName: {
        type: String,
        default: '100000'
    },
    staticsType: {
        type: String,
        default: 'currentConfirmedCount'
    }
})

let echarts_dom = ref(null);
let NumberCnts = reactive({
    yesterdayLocalConfirmedCount: [],
    yesterdayAsymptomaticCount: [],
    currentConfirmedCount: [],
    confirmedCount: [],
    dangerCountIncr: [],
    currentDangerCount: [],
    suspectedCount: [],
    curedCount: [],
    deadCount: [],
    highDangerCount: [],
    midDangerCount: [],
});
let childs = [];
let option = {
    title: {

    },
    tooltip: {

    },
    toolbox: {

    },
    visualMap: {
        min: 0,
        max: 0,
        text: ['High', 'Low'],
        realtime: false,
        calculable: true,
        inRange: {
            color: ['lightskyblue', 'yellow', 'orangered']
        }
    },
    grid: {
        width: 'auto',
        height: 'auto'
    },
    series: []
}
let myChart;

let setDomSize = (node) => {
    node.style.height = `${node.clientWidth * 0.7}px`;
}

let setNumberCnts = async () => {

    for (let key in NumberCnts) {
        NumberCnts[key] = [];
    }

    for (let child of childs) {
        let temp = await getNcovJson(child.adcode);
        if (temp) {
            for (let key in NumberCnts) {
                NumberCnts[key].push({
                    name: child.name,
                    value: temp[key]
                })
            }
        }
    }
}

let printMyEchart = async () => {
    setDomSize(echarts_dom.value);
    myChart = echarts.init(echarts_dom.value);
    myChart.showLoading();

    let geoJson = await getGeoJson(props.adcode);
    // console.log(geoJson);
    myChart.hideLoading();
    echarts.registerMap(props.mapName, geoJson);

    for (let feature of geoJson.features) {
        childs.push({
            adcode: feature.properties.adcode,
            name: feature.properties.name
        });
    }

    await setNumberCnts();
    myChart.setOption(option);
}

onMounted(() => {
    nextTick(printMyEchart);
    window.onresize = (function () {
        let free = true;
        return () => {
            if (free && myChart) {
                nextTick(() => {
                    setDomSize(echarts_dom.value);
                    myChart.resize();
                    free = true;
                })
                free = false;
            }
        }
    })();
})

watch(NumberCnts, () => {
    option.visualMap.min = NumberCnts[props.staticsType].length && NumberCnts[props.staticsType]
        .map(item => item.value)
        .reduce((cur, next) => {
            return Math.min(cur, next);
        });
    option.visualMap.max = NumberCnts[props.staticsType].length && NumberCnts[props.staticsType]
        .map(item => item.value)
        .reduce((cur, next) => {
            return Math.max(cur, next);
        });
    option.series = [{
        name: '',
        type: 'map',
        map: props.mapName,
        zoom: 1,
        label: {
            show: true
        },
        data: NumberCnts[props.staticsType]
    }];
})

</script>

<script>
export default {
    name: 'Map'
}
</script>

<template>
    <div ref='echarts_dom'>

    </div>
</template>

<style lang="less" scoped>
div {
    width: 100%;
}
</style>