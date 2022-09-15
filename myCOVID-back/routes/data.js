let express = require('express');
let router = express.Router();

router.get('/:key', (req, res, next) => {
    let temp = require(`../data/${req.params.key}.json`);
    res.json(temp);
})


router.get('/', (req, res, next) => {
    let data = require('../data/data.json');
    res.send(data);
})

module.exports = router;