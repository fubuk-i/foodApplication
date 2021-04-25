const express = require('express');
const router = express.Router();
const service = require('../../../api/service/test.service');

//Add bulk product data to database
router.post('/addData', async (req, res, next) => {

    var doc = req.body;
    try {
        res.json(await service.addTestData(doc));
    }
    catch (err) {

        res.status(err.error.code).send(err);
    }
})

module.exports = router