var _ = require('lodash');
var async = require('async');
var Handler = require('../models/Handler');

function updateHandlerState(handlerToken, state) {
    Handler.findOne({'deviceToken': handlerToken}, function(err, handler) {
        console.log('handler was set to '+ state);
        handler.state = state;
        handler.save();
    });
};

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
			old_state = handler.state;
			/* cannot do like this (polling stuff)
			var socketio = req.app.get('socketio');
			updateHandlerState(req.params.id, 0);
			socketio.emit('status.updated', 0);
            */
			return res.json({ 'success': old_state, 'message': 'Handler is found.' });
        }
        return res.json({ 'success': false, 'message': 'Handler not found!' });
    });
};
