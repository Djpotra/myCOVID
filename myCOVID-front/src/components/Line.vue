<script setup>
import { getGeoJson, getParentAdCode, getNcovJson, getChildNcovJson } from '@/api'
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
    intiStaticsType: {
        type: String,
        default: 'currentConfirmedCount'
    }
})

let staticsType = ref(props.intiStaticsType);

let echarts_dom = ref(null);
let staticsData = reactive([]);
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
    xAxis: {
        type: 'category',
        data: []
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
    option.series = [
        {
            data: NumberCnts[staticsType.value],
            type: 'line',
            smooth: true
        }
    ];
    option.xAxis.data = NumberCnts.dateId;
}

let myChart;

let setDomSize = (node) => {
    let parentNode = node.parentNode;
    node.style.width = `${parentNode.clientWidth * 0.9}px`;
    node.style.height = `${parentNode.clientWidth * 0.7}px`;
}

let setNumberCnts = async (adcode) => {
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

let updateMapByAdCode = async function (newAdCode) {

    myChart.showLoading();
    let oldVal = adcode.value;
    adcode.value = newAdCode;

    let geoJson = echarts.getMap(newAdCode);
    if (!geoJson) {
        geoJson = await getGeoJson(newAdCode);
        for (let feature of geoJson.features) {
            adcodeMap2Name.set(feature.properties.adcode, feature.properties.name);
        }
        echarts.registerMap(`${newAdCode}`, geoJson);
    }

    let flag = await setNumberCnts(newAdCode, true);
    myChart.hideLoading();
    if (flag) {
        myChart.setOption(option);
        return true;
    } else {
        adcode.value = oldVal;
    }

    return false;
}

onMounted(() => {
    setDomSize(echarts_dom.value);
    myChart = echarts.init(echarts_dom.value);
    myChart.on('click', (() => {
        let handled = true;
        return function (params) {
            if (handled) {
                nextTick(async () => {
                    handled = false;
                    if (params.data && !bannedAdCodes.has(params.data.adcode)) {
                        parentAdCodes.set(params.data.adcode, adcode.value);
                        if (!await updateMapByAdCode(params.data.adcode)) {
                            bannedAdCodes.add(params.data.adcode);
                        }
                    }
                    setTimeout(() => {
                        handled = true;
                    }, 400);
                })
            }
        }
    })())

    nextTick(() => {
        updateMapByAdCode(adcode.value);
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