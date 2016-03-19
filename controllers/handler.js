var _ = require('lodash');
var async = require('async');
var Handler = require('../models/Handler');

/**
 * GET /hander/:id
 * get handler state
 */
exports.getHandlerState = function(req, res) {
    Handler.findOne({ 'deviceToken': req.params.id }, 'state', function (err, handler) {
        if (err) return res.json({ 'success': 0, 'message': 'Handler not found!' });

        return res.json({ 'success': handler.state, 'message': 'Handler is found.' });
    });
};
