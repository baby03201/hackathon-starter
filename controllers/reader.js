var _ = require('lodash');
var async = require('async');
var Reader = require('../models/Reader');

/**
 * GET /reader
 * admin reader list
 */
exports.getReader = function(req, res) {
    if (req.user) {
        Reader.find(function(err, results) {
            res.render('reader', {
                title: 'Reader',
                readers: results
            });
        });
    } else {
        return res.redirect('account/login', {
            title: 'Login'
        });
    }
};

/**
 * POST /reader/:id/whitelist/:whiteid
 * insert whitelist to reader
 */
exports.insertWhiteList = function(req, res) {
    Reader.findByIdAndUpdate(
        req.params.id,
        { $push: {'deviceId': req.params.whiteid } },
        { safe: true, upsert: true},
        function(err, model) {
            if (err) {
                console.log(err);
                return res.json({ 'success': 0 });
            }

            return res.json({ 'success': 1 });
        }
    );
};
