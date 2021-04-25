const express = require('express');
const router = express.Router();
const service = require('../../service/foodOrder.service');

//Verify order data with inventory before order placement
router.post('/verifyOrder', async (req, res, next) => {

    var doc = req.body;
    try {
        res.json(await service.verifyOrder(doc));
    }
    catch (err) {

        res.status(err.error.code).send(err);
    }
})

//Order placement
router.post('/placeOrder', async (req, res, next) => {

    var doc = req.body;
    try {
        res.json(await service.placeOrder(doc));
    }
    catch (err) {

        res.status(err.error.code).send(err);
    }
})
module.exports = router