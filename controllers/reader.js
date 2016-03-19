var _ = require('lodash');
var async = require('async');
var Reader = require('../models/Reader');
var Log = require('../models/Log');
var Handler = require('../models/Handler');


function updateHandlerState(handlerToken, state) {
    Handler.findOne({'deviceToken': handlerToken}, function(err, handler) {
        console.log('handler was set to '+ state);
        handler.state = state;
        handler.save();
    });
};

/**
 * GET /reader
 * admin reader list
 */
exports.getReader = function(req, res) {
    Reader.find(function(err, results) {
        if (results != undefined) {
            res.render('reader/list', {
                title: 'Reader',
                readers: results
            });
        } else {
            res.redirect('/login');
        }
    });
};

/**
 * GET /reader/:id
 * current reader info
 */
exports.getSingleReader = function(req, res) {
    Reader.findOne({ 'deviceToken': req.params.id }, 'deviceName whiteList', function (err, result) {
        if (err) return res.json({'success': false, 'message':'sorry your reader not found!'});
        res.render('reader/detail', {
            reader: result,
            whiteLists: result.whiteList
        });
    });
};

/**
 * POST /request
 * request from rasberry pi
 */
exports.requestPermission = function(req, res) {
    var deviceId = req.param('deviceId', '');//req.query['deviceId'] || '';
    var deviceToken = req.param('deviceToken', '');//req.query['deviceToken'] || '';
    var photoName = req.param('photoName', '');//req.query['photoName'] || '';
    var recognition = req.param('recognition', 1);//req.query['recognition'] || 0;
    var timestamp = req.param('timestamp', '');
    var date = new Date();
    if (timestamp != '')
        date = Date(timestamp * 1000);


    Reader.findOne({'deviceToken': deviceToken}, 'deviceName deviceToken handler whiteList', function (err, reader) {
        if (err) return res.json({'success': 0, 'message': 'something went wrong when query reader'});

        if (reader) {
            if (recognition == 0) {
                console.log('rfid card accessed');
                // Check whitelist and add log in system
                var handler = reader.handler;
                var lists = reader.whiteList;
                var object = _.findIndex(lists, function(list) {
                    return list.deviceId == deviceId;
                });

                Log.create({
                    'reader': deviceToken,
                    'handler': handler,
                    'success': (object != -1)? true: false,
                    'requestTime': date,
                    'photoFilePath': photoName
                }, function (err, log) {
                    if (err)
                        console.log('failed to save log' + JSON.stringify(err));
                    else
                        console.log('save successfully');
                });

                if (object != -1) {
                    updateHandlerState(handler, true);

                    setTimeout(function() {
                        updateHandlerState(handler, false);
                    }, 10000);
                    return res.json({'success': 1});
                } else {
                    return res.json({'success': 1});
                }
            } else {
                return res.json({'success': 1});
            }
        } else {
            return res.json({'success': 0, 'message': 'Reader not found!'});
        }
    });
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
