$(document).ready(function () {

    /**
     * Update Arrow
     */

    function updateArrow(locations) {
        x = locations[1].lat - locations[0].lat;
        y = locations[1].lng - locations[0].lng;

        var angleRad = Math.atan2(y, x);

        var angle = angleRad * 180 / Math.PI;

        var angle = 'rotate(' + angle + 'deg)';

        $("#icon").css({
            '-webkit-transform': angle,
            '-moz-transform': angle,
            '-o-transform': angle,
            '-ms-transform': angle,
            'transform': angle
        });

        console.log(angle);
    }

    /**
     * MQTT
     */

    const mqttConfig = {
        "host": "localHost",
        "port": 443,
        "url": '',
        "topic": {
            "subscribe": "map",
            "publish": "direction"
        }
    }

    // Create a client instance
    client = new Paho.MQTT.Client(mqttConfig.host, mqttConfig.port, mqttConfig.url, '');

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect({ onSuccess: onConnect });

    // called when the client connects
    function onConnect() {
        // Once a connection has been made, make a subscription and send a message.
        console.log("onConnect");
        client.subscribe(mqttConfig.topic.subscribe);

        messageToSend = new Paho.MQTT.Message("Connected from the browser");
        messageToSend.destinationName = mqttConfig.topic.publish;
        client.send(messageToSend);
    }

    // called when the client loses its connection
    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    // called when a message arrives
    function onMessageArrived(message) {
        console.log("onMessageArrived:" + message.payloadString);

        try {
            response = JSON.parse(message.payloadString)

            updateArrow(response.location)
        } catch (error) {
            console.log("Message was not a location")
        }

    }

    function sendMQTTMessage(messageString) {
        message = new Paho.MQTT.Message(messageString);
        message.destinationName = mqttConfig.topic.publish;
        client.send(message);
    }

});

