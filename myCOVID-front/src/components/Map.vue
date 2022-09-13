<script setup>
import { getGeoJson, getParentAdCode, getNcovJson, getChildNcovJson } from '@/api'
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
    initAdcode: {
        type: Number,
        default: 100000
    },
    intiStaticsType: {
        type: String,
        default: 'currentConfirmedCount'
    }
})

let adcode = ref(props.initAdcode);
let staticsType = ref(props.intiStaticsType);

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
let adcodeMap2Name = new Map();
let option = {
    title: {

    },
    tooltip: {

    },
    toolbox: {
        feature: {
            myButton_back: {
                show: true,
                title: 'back',
                icon: 'path://M960 583.68a320 320 0 0 1-320 320H102.4v-76.8h537.6a243.2 243.2 0 0 0 0-486.4H102.4v-76.8h537.6a320 320 0 0 1 320 320z M167.0144 296.9088L283.136 413.0816l-54.272 54.272-170.496-170.496L228.864 126.464l54.272 54.272L167.0144 296.96z',
                onclick: async function () {
                    let parentAdCode = await getParentAdCode(adcode.value).then(res => res.data);
                    if (parentAdCode) {
                        updateMapByAdCode(parentAdCode);
                    }
                }

            }

        }
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

    printMyEchartByAdCode(adcode.value);

    myChart.on('click', (()=>{
        let handled = true;
        return function(params){
            if(handled){
                handled = false;
                setTimeout(()=>{
                    if (params.data) updateMapByAdCode(params.data.adcode);
                    handled = true;
                },400);
            }
            
        }
    })())
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

let updateMapByAdCode = function (newAdCode) {
    nextTick(async () => {
        let oldVal = adcode.value;
        adcode.value = newAdCode;

        myChart.showLoading();
        let geoJson = echarts.getMap(newAdCode);
        if (!geoJson) {
            geoJson = await getGeoJson(newAdCode);
            for (let feature of geoJson.features) {
                adcodeMap2Name.set(feature.properties.adcode, feature.properties.name);
            }
            echarts.registerMap(`${newAdCode}`, geoJson);
        }

        myChart.hideLoading();
        let flag = await setNumberCnts(newAdCode, true);

        if (flag) {
            myChart.setOption(option);
        } else {
            adcode.value = oldVal;
        }
        console.log(newAdCode, adcode.value);
    });
}

watch(staticsType, () => {
    setOption();
    myChart.setOption(option);
})

function setOption() {
    option.visualMap.min = NumberCnts[staticsType.value].length && NumberCnts[staticsType.value]
        .map(item => item.value)
        .reduce((cur, next) => {
            return Math.min(cur, next);
        });
    option.visualMap.max = NumberCnts[staticsType.value].length && NumberCnts[staticsType.value]
        .map(item => item.value)
        .reduce((cur, next) => {
            return Math.max(cur, next);
        });
    option.series = [{
        name: '',
        type: 'map',
        map: `${adcode.value}`,
        zoom: 1.2,
        roam: true,
        center: undefined,
        label: {
            show: true
        },
        data: NumberCnts[staticsType.value]
    }];
}
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