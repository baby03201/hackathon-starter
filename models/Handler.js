var mongoose = require('mongoose');

var handlerSchema = new mongoose.Schema({
    deviceName: String,
    deviceToken: String,
    state: Number
});

var Handler = mongoose.model('Handler', handlerSchema);
module.exports = Handler;
