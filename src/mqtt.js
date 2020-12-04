
const mqtt = require('mqtt');
const mongoose = require('mongoose');

var client = mqtt.connect('mqtt://localhost:1883')

client.on('connect', function () {
    client.subscribe('map', function (err) {
        if (err)
            console.log(err);
        else
            console.log('connected succesffully')
    })
})

mongoose.connect('mongodb://localhost:27017/mapdb', { useNewUrlParser: true, useUnifiedTopology: true });

const locationSchema = new mongoose.Schema({
    email: String,
    current: { lat: Number, lng: Number },
    destination: { lat: Number, lng: Number },
});

// // we create a collection called WifiQ with the wifiSchema
// const User = mongoose.model("User", userSchema);
const Location = mongoose.model("Location", locationSchema);

client.on('message', function (topic, message) {
    // message is Buffer
    try {
        response = JSON.parse(message.toString())

        new Location({
            email: response.useremail,
            current: response.location[0],
            destination: response.location[1]
        }).save()
    } catch (error) {
        console.log("Message was not a location")
    }

})


