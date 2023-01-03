"use strict";

var Promise   = require('bluebird');

module.exports = function(req, res, next){
    const apiKey = req.header("x-api-key");
    
    if(!apiKey) {
        return res.status(401).json({ ok : false});
    }
    const dbModel = req.app.get('db_model');
    Promise
        .try(() => dbModel.Company.findOne({ where : { integration_api_token : apiKey }}))
        .then(data => {
            if(!data || req.get('host') !== "localhost:3000") {
                return res.status(401).json({ ok : false});
            }
            next();
        })
        .catch(() => {
            return res.status(500).json({ message : "Error check api key"});
        });
};