var Mongoose = require('mongoose'), cfg = require('../config');
Mongoose.Promise = require('bluebird');
const winston = require('../config/winston');
var Connection = Mongoose.connection;
var model = require('./models');
var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');


var db = Mongoose.connect(
  cfg.mongo.uri, {  })
  .then(
    () => {
      winston.info('connection with database succeeded');

    }
  )
  .catch(
    err => winston.error(err)
  );

Mongoose.set('debug', true);

exports.checkIfExists = function (query, collectionName) {

  return new Promise(function (resolve, reject) {
    var coll = model.getModel(collectionName);
    coll.findOne(query, function (err, results) {

      if (err)
        reject(err)
      else
        resolve(results)


    })



  })

}

exports.findAggregate = function (collectionName, aggregateArray) {

  return new Promise(function (resolve, reject) {
    var coll = model.getModel(collectionName);
    coll.aggregate(aggregateArray).exec((err, aggVal) => {
      if (err) reject(err);
      resolve(aggVal)
    });

  })
}

exports.insert = function (doc, collectionName) {

  return new Promise(function (resolve, reject) {
    Connection.collection(collectionName).insertOne(doc).then(
      function (obj) {
        resolve(obj);
      }
    ).catch(function (err) {
      reject(err);
    });

  })


}


exports.getCollection = function (collectionName, options) {

  return new Promise(function (resolve, reject) {

    var coll = model.getModel(collectionName);

    coll.find({}, options, function (err, results) {

      if (err)
        reject(err)
      else
        resolve(results)

    })
    /*
    coll.find({}, function (err, results) {

      if (err)
        reject(err)
      else
        resolve(results)


    })
    */



  })

}

exports.getCollectionCountWithCriteria = function (collectionName, criteria) {

  return new Promise(function (resolve, reject) {

    var coll = model.getModel(collectionName);
    coll.find(criteria).count(function (err, count) {
      if (err)
        reject(err)
      else
        resolve(count)
    })
  })
}

exports.findOneWithCriteriaAndProjections = function (collectionName, criteria, projections) {

  return new Promise(function (resolve, reject) {

    var coll = model.getModel(collectionName);
    coll.findOne(criteria, projections, function (err, results) {

      if (err)
        reject(err)
      else
        resolve(results)


    })



  })

}

exports.updateCollection = function (collectionName, criteria, updateDoc, multi, upsert = true, arrayFilters = {}) {

  return new Promise(function (resolve, reject) {

    var coll = model.getModel(collectionName);

    coll.update(criteria, updateDoc, { arrayFilters,'multi': multi, 'strict': false, 'upsert': upsert }, function (err, results) {
      
      if (err)
        reject(err)
      else
        resolve(results)


    })



  })
}
exports.db = db;