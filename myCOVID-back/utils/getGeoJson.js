let fs = require('fs');
const { features } = require('process');

const aliyunJsonApi = 'https://geo.datav.aliyun.com/areas_v3/bound/';
const ChinaCode = 100000;

let parents = {};

function getGeoByAdcode(adcode) {
    return fetch(`${aliyunJsonApi}${adcode}_full.json`)
        .then(res => res.json())
        .catch(() => {

            return fetch(`${aliyunJsonApi}${adcode}.json`)
                .then(res => res.json())
                .catch((err) => {
                    console.log(`failed with ${adcode} err:${err}`);
                    return null;
                });

        });
}

function writeGeoByAdcode(temp, adcode, basePath) {
    if (temp) fs.writeFile(`${basePath}/${adcode}.json`, JSON.stringify(temp), err => err ? console.log(err) : console.log(`done ${adcode}`));
}

function sleep(time){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('hello');
        },time);
    })
}

async function getGeoJson(rootAdCode, basePath) {
    let root;
    if(fs.existsSync(`${basePath}/${rootAdCode}.json`)) {
        console.log(`pass ${rootAdCode}`);
        root = require(`${basePath}/${rootAdCode}.json`);
    }else{
        console.log(`start ${rootAdCode}`);
        root = await getGeoByAdcode(rootAdCode);
        writeGeoByAdcode(root, rootAdCode, basePath);
        await sleep(3000);
    }
    
    if (root && root.features.length > 1) {
        let newPath = `${basePath}/${rootAdCode}`;
        try {
            fs.mkdir(`${basePath}/${rootAdCode}`, err => {});
        } catch (e) {}
        
        for(let  i=0;i<root.features.length;i++){
            let nextAdCode = root.features[i].properties.adcode;
            parents[nextAdCode] = rootAdCode;
            await getGeoJson(nextAdCode, newPath);
        }
    }
}

// fetch(`${aliyunJsonApi}${ChinaCode}_full.json`).then(res => res.json()).then(res => console.log(res));
getGeoJson(ChinaCode, '../data/geos').then(()=>{
    fs.writeFile('../data/geos/geoParents.json',JSON.stringify(parents),err=>{});
});





