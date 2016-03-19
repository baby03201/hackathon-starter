var mongoose = require('mongoose');

var readerSchema = new mongoose.Schema({
    deviceName: String,
    deviceToken: { type: String, unique: true },
    handler: String,
    whiteList: [
        {
            'deviceId': String,
            'expiredDate': Date
        }
    ]
}, { timestamps: true });

var Reader = mongoose.model('Reader', readerSchema);
module.exports = Reader;
