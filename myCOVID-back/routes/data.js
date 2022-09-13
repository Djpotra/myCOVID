let express = require('express');
let router = express.Router();
let geoParents = require('../data/geos/geoParents.json');

router.get('/parent_adcode/:adcode',(req,res,next)=>{
    // console.log('hello!');
    res.json(geoParents[req.params.adcode]);
})

router.get('/:key', (req, res, next) => {
    let temp = require(`../data/${req.params.key}.json`);
    res.json(temp);
})


router.get('/', (req, res, next) => {
    let data = require('../data/data.json');
    res.send(data);
})

module.exports = router;