const express = require('express');
const router = express.Router();
const service = require('../../service/foodCatalog.service');

//Add new product
router.post('/addProduct', async (req, res, next) => {

    var doc = req.body;
    try {
        res.json(await service.addProduct(doc));
    }
    catch (err) {

        res.status(err.error.code).send(err);
    }
})

//Update Existing product
router.put('/updateProduct', async (req, res, next) => {
    var doc = req.body;
    try {
        res.json(await service.updateProduct(doc));
    }
    catch (err) {
        res.status(err.error.code).send(err);
    }
})

//Delete product (soft delete)
router.delete('/deleteProduct', async (req, res, next) => {
    var doc = req.body;
    try {
        res.json(await service.deleteProduct(doc));
    }
    catch (err) {
        res.status(err.error.code).send(err);
    }
})

//Get all products with pagination
router.get('/getAllProducts', async (req, res, next) => {
    var doc = req.query;
    var page = doc.page ? doc.page : 1;
    try {
        var options = { skip: '', limit: '' };
        if (page && page != 'null' && page != '') {
            var recordsPerPage = 10;
            if (doc.recordsPerPage && doc.recordsPerPage != 'null' && doc.recordsPerPage != '')
                {
                recordsPerPage = parseInt(doc.recordsPerPage);
        }
            options.skip = page ? page * recordsPerPage - recordsPerPage : 0;
            options.limit = recordsPerPage;
        }
        var response = await service.getAllProducts(doc, options);
        res.json(response);
    }
    catch (err) {
        console.log("err in con",err)
        res.status(err.error.code).send(err);
    }
})

//Global search with keywords and pagination
router.post('/searchProduct', async (req, res, next) => {
    var doc = req.body;
    var page = doc.page ? doc.page : 1;

    var options = { skip: '', limit: '' };
    if (page && page != 'null' && page != '') {
        var recordsPerPage = 10;
        if (doc.recordsPerPage && doc.recordsPerPage != 'null' && doc.recordsPerPage != '')
            {
            recordsPerPage = parseInt(doc.recordsPerPage);
    }
        options.skip = page ? page * recordsPerPage - recordsPerPage : 0;
        options.limit = recordsPerPage;
    }

    try {
        var response = await service.searchProduct(doc, options);
        res.json(response);
    }
    catch (err) {

        res.status(err.error.code).send(err);
    }

})

//Specific search by one of the mentioned parameters
router.get('/getProduct', async (req, res, next) => {
    var doc = req.query;
    var page = doc.page ? doc.page : 1;
    try {
        var options = { skip: '', limit: '' };
        if (page && page != 'null' && page != '') {
            var recordsPerPage = 10;
            if (doc.recordsPerPage && doc.recordsPerPage != 'null' && doc.recordsPerPage != '')
                {
                recordsPerPage = parseInt(doc.recordsPerPage);
        }
            options.skip = page ? page * recordsPerPage - recordsPerPage : 0;
            options.limit = recordsPerPage;
        }
        var response = await service.getProduct(doc, options);
        res.json(response);
    }
    catch (err) {
        console.log("err in con",err)
        res.status(err.error.code).send(err);
    }
})

//Sort serached product by any parameter
router.get('/sortProduct', async (req, res, next) => {
    var doc = req.query;
    var page = doc.page ? doc.page : 1;
    try {
        var options = { skip: '', limit: '' };
        if (page && page != 'null' && page != '') {
            var recordsPerPage = 10;
            if (doc.recordsPerPage && doc.recordsPerPage != 'null' && doc.recordsPerPage != '')
                {
                recordsPerPage = parseInt(doc.recordsPerPage);
        }
            options.skip = page ? page * recordsPerPage - recordsPerPage : 0;
            options.limit = recordsPerPage;
        }
        var response = await service.sortProduct(doc, options);
        res.json(response);
    }
    catch (err) {
        console.log("err in con",err)
        res.status(err.error.code).send(err);
    }
})
module.exports = router