const mongoose=require("mongoose");


const ConferenceSchema = new mongoose.Schema({
title: {
type: String,
required: [true, 'Please add a title'],
trim: true,
},
description: {
type: String,
required: [true, 'Please add a description'],
},
startTime: {
type: Date,
required: [true, 'Please add a start time'],
},
endTime: {
type: Date,
required: [true, 'Please add an end time'],
validate: {
    validator: function(value) {
    return value > this.startTime;
    },
    message: 'End time must be after start time',
},
},
organizer: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Organizer',
required: true
},
speakers: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Speaker'
}],
sponsors: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Sponsor'
}],
partners: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Partner'
}],
location: {
type: String,
required: true
},
status: {
type: String,
enum: ['Planning', 'Ongoing', 'Completed', 'Cancelled'],
default: 'Planning'
}
}, {
timestamps: true
});

module.exports = mongoose.model('Conference', ConferenceSchema);