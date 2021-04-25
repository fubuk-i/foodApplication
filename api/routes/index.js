const routes = require('express').Router();
const test = require('../controllers/test');
const foodCatalog = require('../controllers/foodCatalog');
const foodOrder = require('../controllers/foodOrder'); 

routes.use('/api/importData', test)
routes.use('/api/foodCatalog', foodCatalog)
routes.use('/api/foodOrder', foodOrder)

module.exports = routes;