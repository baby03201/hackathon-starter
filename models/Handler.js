var mongoose = require('mongoose');

var handlerSchema = new mongoose.Schema({
    deviceToken: String,
    state: Boolean
});

var Handler = mongoose.model('Handler', handlerSchema);
module.exports = Handler;
