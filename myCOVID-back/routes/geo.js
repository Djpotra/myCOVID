let express = require('express');
let router = express.Router();
const basePath = '../data/geos';
let geoParents = require(`${basePath}/geoParents.json`);

function getPath(adcode){
    if(geoParents.adcode){
        return `${getPath(geoParents.adcode)}/${adcode}`;
    }
    else return `/${adcode}`;
}

router.get('/:adcode',(req,res,next)=>{
    let temp = require(`${basePath}${getPath(req.params.adcode)}.json`);
    res.send(temp);
})

module.exports = router;