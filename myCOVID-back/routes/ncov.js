let express = require('express');
let router = express.Router();
const basePath = '../data/ncovs';
const geoParentsPath = '../data/geos';
let geoParents = require(`${geoParentsPath}/geoParents.json`);

function getPath(adcode){
    if(geoParents[`${adcode}`]){
        return `${getPath(geoParents[`${adcode}`])}/${adcode}`;
    }
    else return `/${adcode}`;
}

router.get('/:adcode/:suffix',(req,res,next)=>{
    let {adcode,suffix} = req.params;
    let temp = require(`${basePath}${getPath(adcode)}_${suffix}.json`);
    res.send(temp);
})

router.get('/:adcode',(req,res,next)=>{
    let {adcode,suffix} = req.params;
    try{
        let temp = require(`${basePath}${getPath(adcode)}.json`);
        res.send(temp);
    }catch(err){
        res.send(null);
    }
    
})

module.exports = router;