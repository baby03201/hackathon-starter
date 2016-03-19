var _ = require('lodash');
var async = require('async');
var Log = require('../models/Log');

exports.getLog = function(req, res) {
    Log.find(function(err, results) {
        if (results != undefined) {
            var lists = _.map(results, function(result) {
                result.requestTime = result.requestTime.toString();
                return result;
            });

            res.render('log/list', {
                title: 'Logs',
                logs: lists
            });
        } else {
            res.redirect('/login');
        }
    });
};
