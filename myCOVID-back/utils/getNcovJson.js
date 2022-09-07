let fs = require('fs');

let getAreaStat = require('../data/getAreaStat.json');
let fetchRecentStat = require('../data/fetchRecentStat.json');
let fetchRecentStatV2 = require('../data/fetchRecentStatV2.json');
let getListByCountryTypeService2true = require('../data/getListByCountryTypeService2true.json');

let geoParents = require('../data/geos/geoParents.json');
const { start } = require('repl');

const basePath = '../data/ncovs';
let cityNameAdcodeMap = new Map();

function getPath(adcode) {
    if (geoParents[adcode]) {
        return `${getPath(geoParents[adcode])}/${geoParents[adcode]}`;
    } else return ``;
}

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('hello');
        }, time);
    })
}

async function saveAreaStat(areaStat) {
    let name = areaStat['cityName'] || areaStat['provinceShortName'];
    if (areaStat.hasOwnProperty('locationId') && !cityNameAdcodeMap.has(name)) {
        cityNameAdcodeMap.set(name, areaStat['locationId'].toString());
    }
    let temp = {};
    let adcode = cityNameAdcodeMap.get(name);

    if (!geoParents[adcode]) return;

    let prePath = `${basePath}${getPath(adcode)}`
    let target = `${prePath}/${adcode}.json`;

    try {
        fs.mkdir(prePath, err => { });
        temp = require(target);
    } catch (e) {

    }

    for (let key in areaStat) {
        if (key == 'cities') {
            for (let city of areaStat[key]) {
                await saveAreaStat(city);
            }
        } else if (key == 'dangerAreas') {
            let dangerAreasTarget = target.replace('.json', '_dangerAreas.json');
            fs.writeFile(dangerAreasTarget, JSON.stringify(areaStat[key]), err => { });
        } else if (key == 'statisticsData') {
            let statisticsDataTarget = target.replace('.json', '_statisticsData.json');
            await fetch(areaStat[key])
                .then(res => res.json())
                .then(res => {
                    fs.writeFile(statisticsDataTarget, JSON.stringify(res), err => { });
                })
                .catch(err=>{console.log(err)});
            await sleep(3000);
        } else {
            if(!temp.hasOwnProperty(key))temp[key] = areaStat[key];
        }
    }
    
    fs.writeFile(target, JSON.stringify(temp), err => { });
}

async function getNcovJson() {
    for (let areaStat of getAreaStat) {
        await saveAreaStat(areaStat);
    }
    for (let recentStat of fetchRecentStat) {
        await saveAreaStat(recentStat);
    }

    for (let recentStat of fetchRecentStatV2) {
        await saveAreaStat(recentStat);
    }

    for (let item of getListByCountryTypeService2true) {
        if (item['countryFullName'] == 'China') {
            fs.writeFile(`${basePath}/100000.json`, JSON.stringify(item), err => { });
            fetch(item['statisticsData'])
                .then(res => res.json())
                .then(res => {
                    fs.writeFile(`${basePath}/100000_statisticsData.json`, JSON.stringify(res), err => { });
                })
                .catch(err=>{console.log(err)});
            break;
        }
    }
}

getNcovJson();

module.exports = getNcovJson;
