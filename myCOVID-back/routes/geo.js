let express = require('express');
let router = express.Router();
const basePath = '../data/geos';
let geoParents = require(`${basePath}/geoParents.json`);

function getPath(adcode) {
    if (geoParents[`${adcode}`]) {
        return `${getPath(geoParents[`${adcode}`])}/${adcode}`;
    }
    else return `/${adcode}`;
}

router.get('/parent/:adcode', (req, res, next) => {
    let parentAdCode = geoParents[req.params.adcode];
    if (parentAdCode) {
        let temp = require(`${basePath}${getPath()}.json`);
        res.send(temp);
    }else res.send(null);

})

router.get('/:adcode', (req, res, next) => {
    // console.log(getPath(req.params.adcode));
    let temp = require(`${basePath}${getPath(req.params.adcode)}.json`);
    res.send(temp);
})

module.exports = router;