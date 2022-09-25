<script setup>
import { getStatisticsDataJson } from '@/api'
import { ref, onMounted, watch, computed, nextTick, reactive } from 'vue';

import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
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
    LineChart,
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
    initAdcode: {
        type: Number,
        default: 100000
    },
    initStaticsType: {
        type: String,
        default: 'currentConfirmedCount'
    }
})

let staticsType = ref(props.initStaticsType);

let echarts_dom = ref(null);
let NumberCnts = reactive({
    confirmedCount: [],
    confirmedIncr: [],
    curedCount: [],
    curedIncr: [],
    currentConfirmedCount: [],
    currentConfirmedIncr: [],
    dateId: [],
    deadCount: [],
    deadIncr: [],
    highDangerCount: [],
    midDangerCount: [],
    suspectedCount: [],
    suspectedCountIncr: []
});

let option = {
    title: {

    },
    tooltip: {

    },
    xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
            show: true,
            interval: 90,
            rotate: -90,
            inside: false,
        }
    },
    yAxis: {
        type: 'log'
    },
    grid: {
        width: 'auto',
        height: 'auto'
    },
    series: []
}

function setOption() {
    // console.log(NumberCnts[staticsType.value]);
    option.series = [
        {
            data: NumberCnts[staticsType.value].filter(value=>value>=1),
            type: 'line',
            smooth: true
        }
    ];
    option.xAxis.data = NumberCnts.dateId.filter((value,index)=>NumberCnts[staticsType.value][index]>=1);
}

let myChart;

let setDomSize = (node) => {
    let parentNode = node.parentNode;
    node.style.width = `${parentNode.clientWidth * 0.9}px`;
    node.style.height = `${parentNode.clientWidth * 0.7}px`;
}

let setNumberCnts = async (adcode) => {
    let temp = await getStatisticsDataJson(adcode);
    // console.log(temp);
    if (temp) {
        let newNumberCnts = {
            confirmedCount: [],
            confirmedIncr: [],
            curedCount: [],
            curedIncr: [],
            currentConfirmedCount: [],
            currentConfirmedIncr: [],
            dateId: [],
            deadCount: [],
            deadIncr: [],
            highDangerCount: [],
            midDangerCount: [],
            suspectedCount: [],
            suspectedCountIncr: []
        };
        for (let item of temp) {
            for (let key in item) {
                newNumberCnts[key].push(item[key]);
            }
        }

        for (let key in newNumberCnts) {
            NumberCnts[key].push(...newNumberCnts[key]);
        }

        return true;
    }
    return false;
}

let updateLineByAdCode = async function (adcode) {

    myChart.showLoading();

    let flag = await setNumberCnts(adcode, true);
    myChart.hideLoading();
    if (flag) {
        myChart.setOption(option);
        return true;
    }

    return false;
}

onMounted(() => {
    setDomSize(echarts_dom.value);
    myChart = echarts.init(echarts_dom.value);

    nextTick(() => {
        updateLineByAdCode(props.initAdcode);
    });

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


watch(staticsType, () => {
    setOption();
    myChart.setOption(option);
})

watch(NumberCnts, () => {
    setOption();
})

</script>

<script>
export default {
    name: 'Line'
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