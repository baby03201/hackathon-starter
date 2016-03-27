var _ = require('lodash');
var async = require('async');
var Log = require('../models/Log');

exports.getLog = function(req, res) {
    var q = Log.find().sort({'requestTime':-1}).limit(10);
    q.exec(function(err, results) {
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
