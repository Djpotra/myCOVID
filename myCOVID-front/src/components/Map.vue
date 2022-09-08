<script setup>
import { getGeoJson, getNcovJson, getChildNcovJson } from '@/api'
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
    VisualMapComponent,
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
    staticsType: {
        type: String,
        default: 'currentConfirmedCount'
    }
})

let echarts_dom = ref(null);
let NumberCnts = reactive({
    adcode: null,
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
let adcodeMap2Name = new Map();
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
    let parentNode = node.parentNode;
    node.style.width = `${parentNode.clientWidth * 0.9}px`;
    node.style.height = `${parentNode.clientWidth * 0.7}px`;
}

let setNumberCnts = async (adcode, ifExclude) => {
    let exclude = ifExclude ? new Set([710000, 810000, 820000]) : new Set();
    let temp = await getChildNcovJson(adcode);
    if (temp) {
        for (let key in NumberCnts) {
            if (!Array.isArray(temp[key])) {
                NumberCnts[key] = temp[key];
                continue;
            }
            NumberCnts[key] = temp[key]
                .filter(item => !exclude.has(item.name))
                .map(item => {
                    return {
                        adcode: item.name,
                        name: adcodeMap2Name.get(item.name),
                        value: item.value
                    }
                });
        }
        return true;
    }
    return false;
}

let printMyEchartByAdCode = async (adcode) => {
    myChart.showLoading();
    let geoJson = await getGeoJson(adcode);
    myChart.hideLoading();

    for (let feature of geoJson.features) {
        adcodeMap2Name.set(feature.properties.adcode, feature.properties.name);
    }

    let flag = await setNumberCnts(adcode, true);
    if (flag) {
        echarts.registerMap(`${adcode}`, geoJson);
        myChart.setOption(option);
    }

}

let printMyEchart = () => {
    setDomSize(echarts_dom.value);
    myChart = echarts.init(echarts_dom.value);

    printMyEchartByAdCode(props.adcode);

    nextTick(() => {
        myChart.on('click', params => {
            let newAdCode = params.data.adcode;
            nextTick(() => printMyEchartByAdCode(newAdCode));
        })
    })
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
        map: `${NumberCnts.adcode}`,
        zoom: 1.2,
        roam: true,
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
    border: 1px solid black;
    margin: auto;
    margin-top: 5px;
}
</style>