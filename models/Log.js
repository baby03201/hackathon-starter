var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
    reader: String,
    handler: String,
    requestTime: { type: Date, default: Date.now },
    photoFilePath: String,
    success: Boolean
});

var Log = mongoose.model('Log', logSchema);
module.exports = Log;
