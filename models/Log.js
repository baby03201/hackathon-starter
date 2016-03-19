var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
    reader: ObjectId,
    handler: ObjectId,
    requestTime: { type: Date, default: Date.now },
    success: Boolean,
    photoFile: String
});

var Log = mongoose.model('Log', logSchema);
module.exports = Log;
