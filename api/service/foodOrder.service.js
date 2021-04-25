const dao = require('../daos/index');
const winston = require('../config/winston');
const utils = require('./utils');
const constants = require('../app-constants').APP_CONSTANTS;
const errorConstants = require('../service-error-constants').ERROR_CONSTANTS;

//Database operations and core backend logic

exports.verifyOrder = function (doc) {
    return new Promise(async function (resolve, reject) {
        try {
            if (doc && doc.orders.length != 0) {
                var Orders = [];
                for(let i=0;i<doc.orders.length;i++) {
                    var criteria = {};
                    var orderResponse ;
                    var order = {};
                    var productId = doc.orders[i].productId;
                    criteria['productId'] = productId;
                    if (!productId) {
                        reject(utils.createErrorResponse(400, 'Invalid Product Id'));
                        return;
                    }
                    var product = await dao.findOneWithCriteriaAndProjections('products', criteria, {});
                    product = product._doc;
                    if (!product) {
                        reject(utils.createErrorResponse(400, 'Product not found'));
                        return;
                    }
                    
                    if(parseInt(doc.orders[i].qty) > parseInt(product.qtyInventory)){
                        if(product.qtyInventory != 0){
                            order['productId'] = product.productId;
                            order['Total cost'] = 0;
                            order['message'] = "Available quantity "+product.qtyInventory;
                             orderResponse = utils.createResponse("order",order,constants.FAILED, constants.LESSRESOURCE,null)
                            Orders.push(orderResponse);
                        }
                        else{
                            order['productId'] = product.productId;
                            order['Total cost'] = 0;
                            order['message'] = "Out of stock ";
                             orderResponse = utils.createResponse("order",order,constants.FAILED, constants.NO_CONTENT_CODE,null)
                            Orders.push(orderResponse);
                        }
                    } 
                    else {
                        let cost = doc.orders[i].qty * product.cost;
                        
                        order['productId'] = product.productId;
                        order['Total cost'] = cost;
                        order['message'] = "Available"
                         orderResponse = utils.createResponse("order",order,constants.SUCCESS, constants.SUCCESSCODE, null)
                        Orders.push(orderResponse);
                    }
                }
                if(Orders){
                    resolve(utils.createResponse('Orders', Orders, constants.SUCCESS, constants.SUCCESSCODE, null));
                    return;
                }
            }
            else {
                winston.error("invalid payload Order missing");
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

exports.placeOrder = function (doc) {
    return new Promise(async function (resolve, reject) {
        try {
            if (doc && doc.orders.length != 0 && doc.orderId) {
                var updateProduct = [];
                var totalCost = 0;
                for(let i=0; i<doc.orders.length; i++){
                    
                    var criteria = {};
                    var productId = doc.orders[i].productId;
                    if (!productId) {
                        reject(utils.createErrorResponse(400, 'Invalid Product Id'));
                        return;
                    }
                    criteria['productId'] = productId;
                    var product = await dao.findOneWithCriteriaAndProjections('products', criteria, {});
                    product = product._doc;
                    if (!product) {
                        reject(utils.createErrorResponse(400, 'Product not found'));
                        return;
                    }
                    doc.orders[i].productDbId = product._id;
                    if(parseInt(doc.orders[i].qty) > parseInt(product.qtyInventory)){
                        reject(utils.createErrorResponse(400, 'Product '+product.productId+' out of stock'));
                        return;
                    }
                    else {
                        
                        totalCost = totalCost + (doc.orders[i].qty * product.cost);
                        let productQty = {};
                        productQty["productId"] = product.productId;
                        productQty["qtyInventory"] = (product.qtyInventory - doc.orders[i].qty);
                        updateProduct.push(productQty);
                        console.log("docc",doc.orders[i]);
                        
                    }

                }
                if(updateProduct){
                    var orderCriteria = {};
                    orderCriteria['orderId'] = doc.orderId;
                var existingOrder = await dao.checkIfExists(orderCriteria, "orders");
                if (existingOrder == null) {
                    doc['Total Cost'] = totalCost;
                    doc['createdDate'] = new Date();
                    doc['createdBy'] = "ADMIN";
                    doc['status'] = "PLACED";

                    await dao.insert(doc, "orders");
                    var newOrder = await dao.checkIfExists(doc, "orders")
                    if(newOrder){
                        for(let x=0;x<updateProduct.length;x++){
                            var crit = {};
                            var updateDoc = {}
                            crit['productId'] = updateProduct[x].productId;
                            updateDoc['UPDATEDDATE'] = new Date();
                            updateDoc["qtyInventory"] = updateProduct[x].qtyInventory;
                            await dao.updateCollection("products", crit, updateDoc, false);

                        }
                    }
                    resolve(utils.createResponse('order', newOrder, constants.SUCCESS, constants.SUCCESSCODE, null));
                }
                else {
                    winston.error("This order is already exists");
                    reject(utils.createErrorResponse(409, "This order is already exists"));
                    return;
                }
                }
            }
            else {
                winston.error("invalid payload Order missing");
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