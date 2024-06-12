const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    firstName:{
        type:String,
        require:true
    },
    lastName:{
        type:String,
        require:true
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }]
});


module.exports = mongoose.model('Worker', workerSchema);