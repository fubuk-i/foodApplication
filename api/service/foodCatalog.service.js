const dao = require('../daos/index');
const winston = require('../config/winston');
const utils = require('./utils');
const constants = require('../app-constants').APP_CONSTANTS;
const errorConstants = require('../service-error-constants').ERROR_CONSTANTS;

//Database operations and core backend logic

exports.addProduct = function (doc) {
    return new Promise(async function (resolve, reject) {
        try {
            if (doc && doc.productId && doc.qtyInventory) {
                var criteria = {};
                criteria['productId'] = doc.productId;
                var existingProduct = await dao.checkIfExists(criteria, "products");
                if (existingProduct == null) {

                    doc['createdDate'] = new Date();
                    doc['createdBy'] = "ADMIN";
                    doc['status'] = "ACTIVE";

                    await dao.insert(doc, "products");

                    var newProduct = await dao.checkIfExists(doc, "products")
                    resolve(utils.createResponse('product', newProduct, constants.SUCCESS, constants.SUCCESSCODE, null));
                }
                else {
                    winston.error("This product is already exists");
                    reject(utils.createErrorResponse(409, "This product is already exists"));
                    return;
                }
            }
            else {
                winston.error("invalid payload Product Id or Quantity missing");
                reject(utils.createErrorResponse(400, errorConstants.INVALIDPAYLOAD));
                return;
            }
        }
        catch (ex) {
            winston.error('addNewProduct ' + ex + ' input' + doc);
            reject(utils.createErrorResponse(500, errorConstants.INTERNALSERVERERROR));
        }

    });
}

exports.updateProduct = function (doc) {
    return new Promise(async function (resolve, reject) {
        try {
            if (doc && doc.productId) {
            var productId = doc.productId;
            var criteria = {};
            criteria["productId"] = productId;


            if (!productId) {
                reject(utils.createErrorResponse(400, 'Invalid Product Id'));
                return;
            }

            var product = await dao.findOneWithCriteriaAndProjections('products', criteria, {});

            if (!product) {
                reject(utils.createErrorResponse(400, 'Product not found'));
                return;
            }


            doc['UPDATEDDATE'] = new Date();
            doc["UPDATEDBY"] = "ADMIN"

            await dao.updateCollection("products", criteria, doc, false);

            var updateProduct = await dao.findOneWithCriteriaAndProjections('products', criteria, {});
            resolve(utils.createResponse("product", updateProduct, constants.SUCCESS, constants.SUCCESSCODE, null));
            return;
        }
        else {
            winston.error("invalid payload Product Id or Quantity missing");
            reject(utils.createErrorResponse(400, errorConstants.INVALIDPAYLOAD));
            return;
        }

        }
        catch (err) {
            reject(utils.createErrorResponse(500, errorConstants.INTERNALSERVERERROR));
        }
    });
}

exports.deleteProduct = function (doc) {
    return new Promise(async function (resolve, reject) {
        try {
            if (doc && doc.productId) {
            var productId = doc.productId;
            var criteria = {};
            criteria["productId"] = productId;


            var product = await dao.findOneWithCriteriaAndProjections('products', criteria, {});

            if (!product) {
                reject(utils.createErrorResponse(400, 'Product not found'));
                return;
            }

            var updatedProduct = {};
            updatedProduct['status'] = "DELETED";
            updatedProduct['DELETEDDATE'] = new Date();
            updatedProduct["DELETEBY"] = "ADMIN"

            await dao.updateCollection("products", criteria, updatedProduct, false);

            var updateProduct = await dao.findOneWithCriteriaAndProjections('products', criteria, {});
            resolve(utils.createResponse("product", updateProduct, constants.SUCCESS, constants.SUCCESSCODE, null));
        }
        else {
            winston.error("invalid payload Product Id missing");
            reject(utils.createErrorResponse(400, errorConstants.INVALIDPAYLOAD));
            return;
        }

        }
        catch (err) {
            reject(utils.createErrorResponse(500, errorConstants.INTERNALSERVERERROR));
        }
    });
}

exports.getAllProducts = function (doc, options) {
    return new Promise(async function (resolve, reject) {
        /* */
        var products = [];
        try {
            var arr = [];
                var notEqual = {};
                notEqual[constants.MONGO_NOT_EQUAL] = "DELETED";

                var criteria = {};
                criteria['status'] = notEqual;//constants.ACTIVE;


                var match = { "$match": criteria }
                arr.push(match);

                var sort = { createdDate: -1 };

                var facet = {
                    $facet: {
                        products: [
                            { $sort: sort },
                            { $skip: options.skip },
                            { $limit: options.limit }
                        ]
                    }
                }

                arr.push(facet);

                var products = await dao.findAggregate("products", arr);
               
                var totalRecords = await dao.getCollectionCountWithCriteria("products", criteria);
                products[0].totalRecords = totalRecords;
                if (products && products.length > 0) {
                    resolve(utils.createResponse('products', products, constants.SUCCESS, null, null))
                }
                else {
                    reject(utils.createErrorResponse(204, errorConstants.RESOURCENOTFOUND));
                }
        }
        catch (err) {
            console.log(err);
            reject(utils.createErrorResponse(500, errorConstants.INTERNALSERVERERROR));
        }
    });
}

exports.searchProduct = function (doc, options) {

    return new Promise(async function (resolve, reject) {

        var products = [];

        try {
            if (doc && doc.params.keyword ) {
                var arr = [];
                var notEqual = {};
                notEqual[constants.MONGO_NOT_EQUAL] = "DELETED";
                var criteria = {};
                criteria['status'] = notEqual;
                var productIdCriteria = {};
                productIdCriteria['productId'] = new RegExp(doc.params.keyword, 'i');
                var productNameCriteria = {};
                productNameCriteria['productName'] = new RegExp(doc.params.keyword, 'i');
                var typeCriteria = {};
                typeCriteria['type'] = new RegExp(doc.params.keyword, 'i');
                var cusineCriteria = {};
                cusineCriteria['cusine'] = new RegExp(doc.params.keyword, 'i');
                var orQuery = [];
                orQuery.push(productIdCriteria);
                orQuery.push(productNameCriteria);
                orQuery.push(typeCriteria);
                orQuery.push(cusineCriteria);
                criteria['$or'] = orQuery;
                var match = { "$match": criteria }
                arr.push(match);

                var sort = { createdDate: -1 };

                var facet = {
                    $facet: {
                        products: [
                            { $sort: sort },
                            { $skip: options.skip },
                            { $limit: options.limit }

                        ]
                    }
                }

                arr.push(facet);

                var products = await dao.findAggregate('products', arr);

                var totalRecords = await dao.getCollectionCountWithCriteria("products", criteria);
            }
            else {
                winston.error("invalid payload");
                reject(utils.createErrorResponse(400, errorConstants.INVALIDPAYLOAD));
                return;
            }
            products[0].totalRecords = totalRecords;


            if (products && products.length > 0) {
                resolve(utils.createResponse('products', products, constants.SUCCESS, null, null))
            }
            else{
                reject(utils.createErrorResponse(404, constants.RESOURCENOTFOUND));
                return;
            }

        }
        catch (error) {
            winston.error("In service, search" + error);
            reject(utils.createErrorResponse(500, constants.INTERNALSERVERERROR));
        }
    })
}

exports.getProduct = function (doc,options) {
    return new Promise(async function (resolve, reject) {
        /* */
        var products = [];
        try {
            if (doc) {
                var arr = [];
                var criteria = {};
                var notEqual = {};
                notEqual[constants.MONGO_NOT_EQUAL] = "DELETED";
                criteria['status'] = notEqual;
                if (doc['productName'] && doc['productName'] != null && doc['productName'] != "")
                {
                criteria["productName"] = doc['productName'];
                }
                else if (doc['productId'] && doc['productId'] != null && doc['productId'] != "")
                {
                criteria["productId"] = doc['productId'];
                }
                else if (doc['type'] && doc['type'] != null && doc['type'] != "")
                {
                criteria["type"] = doc['type'];
                }
                else if (doc['cusine'] && doc['cusine'] != null && doc['tycusinepe'] != "")
                {
                criteria["cusine"] = doc['cusine'];
                }
                else if (doc['serving'] && doc['serving'] != null && doc['serving'] != "")
                {
                criteria["serving"] = doc['serving'];
                }
                else if (doc['cost'] && doc['cost'] != null && doc['cost'] != "")
                {
                var costQuery = {}
                costQuery[constants.MONGO_LESS_THAN_EQUAL_TO] = doc['cost'];
                criteria['cost'] = costQuery ;
                }
                var sort = { createdDate: -1 };
            
                var match = { "$match": criteria }
                arr.push(match);

                

                var facet = {
                    $facet: {
                        products: [
                            {$sort: sort},
                            { $skip: options.skip },
                            { $limit: options.limit }
                        ]
                    }
                }

                arr.push(facet);
                var products = await dao.findAggregate("products", arr);

                var totalRecords = await dao.getCollectionCountWithCriteria("products", criteria);

                products[0].totalRecords = totalRecords;
                if (products && products.length > 0) {
                    resolve(utils.createResponse('products', products, constants.SUCCESS, null, null))
                }
                else {
                    reject(utils.createErrorResponse(204, errorConstants.RESOURCENOTFOUND));
                }
            }
            else {
                winston.error("Invalid Payload");
                reject(utils.createErrorResponse(400, errorConstants.INVALIDPAYLOAD));
                return;
            }
        }
        catch (err) {
            winston.error(err);
            console.log("err:",err);
            reject(utils.createErrorResponse(500, errorConstants.INTERNALSERVERERROR));
        }
    });
}

exports.sortProduct = function (doc,options) {
    return new Promise(async function (resolve, reject) {
        /* */
        var products = [];
        try {
            if (doc) {
                var arr = [];
                var criteria = {};
                var notEqual = {};
                notEqual[constants.MONGO_NOT_EQUAL] = "DELETED";
                criteria['status'] = notEqual;
                if (doc['productName'] && doc['productName'] != null && doc['productName'] != "")
                {
                criteria["productName"] = doc['productName'];
                }
                else if (doc['productId'] && doc['productId'] != null && doc['productId'] != "")
                {
                criteria["productId"] = doc['productId'];
                }
                else if (doc['type'] && doc['type'] != null && doc['type'] != "")
                {
                criteria["type"] = doc['type'];
                }
                else if (doc['cusine'] && doc['cusine'] != null && doc['tycusinepe'] != "")
                {
                criteria["cusine"] = doc['cusine'];
                }
                else if (doc['serving'] && doc['serving'] != null && doc['serving'] != "")
                {
                criteria["serving"] = doc['serving'];
                }
                else if (doc['cost'] && doc['cost'] != null && doc['cost'] != "")
                {
                var costQuery = {}
                costQuery[constants.MONGO_LESS_THAN_EQUAL_TO] = doc['cost'];
                criteria['cost'] = costQuery ;
                }
                var sort = {};
                if(doc.sortBy) {
                    if (doc.orderBy) {
                        sort[doc.sortBy]   = doc.orderBy === 'desc' ? -1 : 1
                    } 
                    else {
                        sort[doc.sortBy]   = 1;
                    }
                }
                else{
                    sort['createdDate']   = -1;
                }
            
                var match = { "$match": criteria }
                arr.push(match);

                

                var facet = {
                    $facet: {
                        products: [
                            {$sort: sort},
                            { $skip: options.skip },
                            { $limit: options.limit }
                        ]
                    }
                }

                arr.push(facet);
                var products = await dao.findAggregate("products", arr);

                var totalRecords = await dao.getCollectionCountWithCriteria("products", criteria);

                products[0].totalRecords = totalRecords;
                if (products && products.length > 0) {
                    resolve(utils.createResponse('products', products, constants.SUCCESS, null, null))
                }
                else {
                    reject(utils.createErrorResponse(204, errorConstants.RESOURCENOTFOUND));
                }
            }
            else {
                winston.error("Invalid Payload");
                reject(utils.createErrorResponse(400, errorConstants.INVALIDPAYLOAD));
                return;
            }
        }
        catch (err) {
            winston.error(err);
            console.log("err:",err);
            reject(utils.createErrorResponse(500, errorConstants.INTERNALSERVERERROR));
        }
    });
}