let express = require('express');
let router = express.Router();
let data = require('../data/data.json');


router.get('/:key', (req, res, next) => {
    let temp = require(`../data/${req.params.key}.json`);
    res.json(temp);
})


router.get('/', (req, res, next) => {
    res.send(data);
})

module.exports = router;