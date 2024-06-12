const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming you have a User model for clients
        required: true
    },
    date: {
        type: Date,
        required: true
    }   
});

module.exports = mongoose.model('Visit', visitSchema);

