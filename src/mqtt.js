const mqtt = require('mqtt')

var client = mqtt.connect('mqtt://localhost:1883')

client.on('connect', function () {
    client.subscribe('emotion', function (err) {
        if (err)
            console.log(err);
        else
            console.log('connected succesffully')
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log('message')
    console.log(message.toString())
})