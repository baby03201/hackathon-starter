var mongoose = require('mongoose');

var handlerSchema = new mongoose.Schema({
    deviceName: String,
    deviceToken: String,
    state: Boolean
});

var Handler = mongoose.model('Handler', handlerSchema);
module.exports = Handler;
