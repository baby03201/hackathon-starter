var _ = require('lodash');
var async = require('async');
var Handler = require('../models/Handler');

/**
 * GET /handler
 * get handler
 */
exports.getHandler = function(req, res) {
    Handler.find(function(err, results) {
        res.render('handler/list', {
            title: 'Handler',
            handlers: results
        });
    });
};

/**
 * GET /hander/:id
 * get handler state
 */
exports.getHandlerState = function(req, res) {
    Handler.findOne({ 'deviceToken': req.params.id }, 'state', function (err, handler) {
        if (err) return res.json({ 'success': false, 'message': 'Handler not found!' });
        if (handler) {
            return res.json({ 'success': handler.state, 'message': 'Handler is found.' });
        }

        return res.json({ 'success': false, 'message': 'Handler not found!' });

    });
};
