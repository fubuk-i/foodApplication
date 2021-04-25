const dao = require('../daos/index');
const winston = require('../config/winston');
const utils = require('./utils');

//logic to add bulk data to datbase without repeating productId
exports.addTestData = function (doc) {
    return new Promise(async function (resolve, reject) {
        try {
            if (doc) {
               for(let i=0 ;i<doc.length;i++){
                var criteria = {};
                criteria['productId'] = doc[i].productId;
                var existingProduct = await dao.checkIfExists(criteria, "products");
                if (existingProduct == null) {
                    doc[i]['createdDate'] = new Date();
                    doc[i]['createdBy'] = "ADMIN";
                    doc[i]['status'] = "ACTIVE";

                    await dao.insert(doc[i], "products");
                }
                else {
                    winston.error("This product "+doc.productId+" is already exists");
                }
               }
                    resolve(utils.createResponse('product', "newProduct", "constants.SUCCESS", "200", null));
                }
            else {
                winston.error("invalid payload");
                reject(utils.createErrorResponse(400, "errorConstants.INVALIDPAYLOAD"));
                return;
            }
        }
        catch (ex) {
            winston.error('addNewProduct ' + ex + ' input' + doc);
            reject(utils.createErrorResponse(500, "errorConstants.INTERNALSERVERERROR"));
        }

    });
}