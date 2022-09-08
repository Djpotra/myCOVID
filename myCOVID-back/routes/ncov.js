let express = require('express');
let router = express.Router();
const basePath = '../data/ncovs';
const geoParentsPath = '../data/geos';
let fs = require('fs');
let geoParents = require(`${geoParentsPath}/geoParents.json`);

function getPath(adcode) {
    if (geoParents[`${adcode}`]) {
        return `${getPath(geoParents[`${adcode}`])}/${adcode}`;
    }
    else return `/${adcode}`;
}

router.get('/child/:adcode', (req, res, next) => {
    let { adcode } = req.params;
    let NumberCnts = {
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
    };
    let targetPath = `data/ncovs${getPath(adcode)}`;
    fs.readdir(targetPath, (err, files) => {
        if (err) {
            res.send(null);
            return;
        }
        files = files.filter(file => /[0-9]+[.json]/.test(file));
        // console.log(files);
        for (let file of files) {
            let temp = require(`../${targetPath}/${file}`);
            for (let key in NumberCnts) {
                NumberCnts[key].push({
                    name: temp['locationId'],
                    value: temp[key]
                })
            }

        }

        res.send({ ...NumberCnts, adcode});
    })
})

router.get('/:adcode/:suffix', (req, res, next) => {
    let { adcode, suffix } = req.params;
    let temp = require(`${basePath}${getPath(adcode)}_${suffix}.json`);
    res.send(temp);
})

router.get('/:adcode', (req, res, next) => {
    let { adcode } = req.params;
    try {
        let temp = require(`${basePath}${getPath(adcode)}.json`);
        res.send(temp);
    } catch (err) {
        res.send(null);
    }
})




module.exports = router;