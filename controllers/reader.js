var _ = require('lodash');
var async = require('async');
var Reader = require('../models/Reader');
var Log = require('../models/Log');
var Handler = require('../models/Handler');
var exec = require('child_process').exec;
var fs = require('fs');
var child, child_files;
var path="public/images/";

function APIToAOP(method, key, value, handler){
	//method=Put/Get
	command = "./aBeingTool DAS "+method+" "+key+" "+"\""+value+"\"";
	//command += " | grep resp | tail -n 1 | awk -F',' '{ print $4 }' | awk -F'\"' '{ printf $2 }'";
	child = exec(command, function (error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
			return;
		}
		console.log('stdout: '+stdout+".");
		handler(stdout);
	});
}

function APIToAOPPutFiles(method, images){
	command = "./aBeingTool CloudFiles "+method+"File "+path;
	command += images;
	child_files = exec(command, function (error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
			return;
		}
		console.log('stdout: '+stdout+".");	
	});
}

function updateHandlerState(req, handlerToken, state) {
    Handler.findOne({'deviceToken': handlerToken}, function(err, handler) {
		var ret;
		var json_str = "{\\\"data\\\":\\\""+state+"\\\"}"; //{\"data\":\"1\"}
		console.log(json_str);
		handler.state = state;
		handler.save();
		var socketio = req.app.get('socketio');
		socketio.emit('status.updated', state);
		APIToAOP("Put", "status", json_str, function(ret){
			console.log('handler was set to '+ ret);
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
		if (result){
			res.render('reader/detail', {
				reader: result,
				whiteLists: result.whiteList
			});
		}
    });
};

/**
 * GET /open_door/:id
 * current reader info
 */
exports.getOpenDoor = function(req, res) {
    Reader.findOne({ 'deviceToken': req.params.id }, 'deviceName deviceToken handler whiteList', function (err, reader) {
		if (err) return res.json({'success': false, 'message':'sorry your reader not found!'});
        if (reader) {
			var handler = reader.handler;
			updateHandlerState(req, handler, 1); 
			setTimeout(function() {
				//idle
				updateHandlerState(req, handler, 0);
			}, 3000);
			return res.json({'success': 1});
			/*res.render('reader/detail', {
				reader: reader,
				whiteLists: reader.whiteList
			});*/
		}
		else{
			return res.json({'success': 0});
		}
    });
};

/**
 * POST /image_done
 * request from rasberry pi
 */
exports.uploadImage = function(req, res) {
	var deviceId = req.param('deviceId', '');//req.query['deviceId'] || '';
	var deviceToken = req.param('deviceToken', '');//req.query['deviceToken'] || '';
	var photoName = req.param('photoName', '');
	var recognition = req.param('recognition', '1');//req.query['recognition'] || 0; 

	console.log('uploadImage');

	Reader.findOne({'deviceToken': deviceToken}, 'deviceName deviceToken handler whiteList', function (err, reader) {
        if (err) return res.json({'success': 0, 'message': 'something went wrong when query reader'});
        console.log('deviceToken '+ deviceToken);
        console.log('deviceId '+ deviceId);
        console.log('photoName ' + photoName);
		console.log('recognition ' + recognition);
        if (reader) {
            var handler = reader.handler;
            var lists = reader.whiteList;
            var object = _.findIndex(lists, function(list) {
                return list.deviceId == deviceId;
            });

			OldFileName=photoName;
			TmpFileName=photoName.split(".");
			NewFileName=TmpFileName[0];
			NewFileName+=(recognition == '1')?"_reco.":(object!=-1)?"_granted.":"_deny.";
			NewFileName+=TmpFileName[1];
			photoName=NewFileName;
	
			fs.rename(path+OldFileName, path+NewFileName, function (err) {
				if (err) throw err;
				console.log('Renamed complete: '+OldFileName+'->'+NewFileName);
				APIToAOPPutFiles("Put", NewFileName);
			});
				
			if (recognition == true){
				var socketio = req.app.get('socketio');
				socketio.emit('modal.active', NewFileName);
			}

			return res.json({'success': 1});
		} else {
            return res.json({'success': 0, 'message': 'Reader not found!'});
        }
    });
};

/**
 * POST /request
 * request from rasberry pi
 */
exports.requestPermission = function(req, res) {
    var deviceId = req.param('deviceId', '');//req.query['deviceId'] || '';
    var deviceToken = req.param('deviceToken', '');//req.query['deviceToken'] || '';
    var recognition = req.param('recognition', '');//req.query['recognition'] || 0;
    var photoName = req.param('photoName', '');
    var timestamp = req.param('timestamp', '');
    var date = new Date();
	
	if (timestamp != '') {
        date = Date(timestamp);
    }

	console.log('uploadImage');

    Reader.findOne({'deviceToken': deviceToken}, 'deviceName deviceToken handler whiteList', function (err, reader) {
        if (err) return res.json({'success': 0, 'message': 'something went wrong when query reader'});
        console.log('deviceToken '+ deviceToken);
        console.log('deviceId '+ deviceId);
        console.log('photoName ' + photoName);
		console.log('recognition '+ recognition);
        if (reader) {
            var handler = reader.handler;
            var lists = reader.whiteList;
            var object = _.findIndex(lists, function(list) {
                return list.deviceId == deviceId;
            });

			OldFileName=photoName;
			TmpFileName=photoName.split(".");
			NewFileName=TmpFileName[0];
			NewFileName+=(recognition == true)?"_reco.":(object!=-1)?"_granted.":"_deny.";
			NewFileName+=TmpFileName[1];
			photoName=NewFileName;

            Log.create({
                'reader': deviceToken,
                'handler': handler,
                'success': (recognition == '1')?3:(object != -1)? 1: 2,
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

			if (recognition == '1'){
				// pop up
				updateHandlerState(req, handler, 3);
				setTimeout(function() {
					//idle
					updateHandlerState(req, handler, 0);
				}, 3000);
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
