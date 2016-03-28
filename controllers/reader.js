var _ = require('lodash');
var async = require('async');
var Reader = require('../models/Reader');
var Log = require('../models/Log');
var Handler = require('../models/Handler');
var exec = require('child_process').exec;
var child;

function APIToAOP(method, key, value, handler){
	//method=Put/Get
	command = "./aBeingTool DAS "+method+" "+key+" "+value;
	command += " | grep resp | tail -n 1 | awk -F',' '{ print $4 }' | awk -F'\"' '{ printf $2 }'";
	child = exec(command, function (error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
			return;
		}
		console.log('stdout: '+stdout+".");
		handler(stdout);
	});
}

function updateHandlerState(req, handlerToken, state) {
    Handler.findOne({'deviceToken': handlerToken}, function(err, handler) {
		var res, ret;
		APIToAOP("Put", "status", state, function(ret){
			console.log('handler was set to '+ ret);
			handler.state = ret;
			handler.save();
			var socketio = req.app.get('socketio');
			socketio.emit('status.updated', ret);	
		});
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
    var recognition = req.param('recognition', true);//req.query['recognition'] || 0;
    var photoName = req.param('photoName', '');
    var timestamp = req.param('timestamp', '');
    var date = new Date();
	
	if (timestamp != '') {
        date = Date(timestamp);
    }


    Reader.findOne({'deviceToken': deviceToken}, 'deviceName deviceToken handler whiteList', function (err, reader) {
        if (err) return res.json({'success': 0, 'message': 'something went wrong when query reader'});
        console.log('deviceToken '+ deviceToken);
        console.log('deviceId '+ deviceId);
        console.log('photoName ' + photoName);
        if (reader) {
            var handler = reader.handler;
            var lists = reader.whiteList;
            var object = _.findIndex(lists, function(list) {
                return list.deviceId == deviceId;
            });

            Log.create({
                'reader': deviceToken,
                'handler': handler,
                'success': (object != -1)? 1: 0,
                'deviceId': deviceId,
                'requestTime': date,
                'photoFilePath': photoName
            }, function (err, log) {
                if (err)
                    console.log('failed to save log' + JSON.stringify(err));
                else
                    console.log('save successfully');
            });
                console.log('rfid card accessed');
                // Check whitelist and add log in system

			if (recognition == true){
				// pop up
				return res.json({'success': 1});
			}
            if (object != -1) {
				//granted
                updateHandlerState(req, handler, 1);
                setTimeout(function() {
					//idle
                    updateHandlerState(req, handler, 0);
				}, 3000);
                return res.json({'success': 1});
            } else {
				//deny
				updateHandlerState(req, handler, 2);
				setTimeout(function() {
					//idle
                    updateHandlerState(req, handler, 0);
				}, 3000);
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
