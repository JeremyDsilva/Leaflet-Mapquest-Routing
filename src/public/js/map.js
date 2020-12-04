window.onload = function () {

    {
        let user_message = "Hello " + getCookieValue('username') + "!";
        let date = decodeURI(getCookieValue('date'))

        if(date != '') // cookie exist. User has visited before.
            user_message += " You last visited on " + date;
        
        $('#user_message').text(user_message)
    }

    /**
     * MQTT
     */

    const mqttConfig = {
        "host": "localHost",
        "port": 443,
        "url": '',
        "topic": {
            "subscribe": "direction",
            "publish": "map"
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
        messageToSend.destinationName = "config";
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
        if (locations[1].lat != null) // if i get a message on direction channel publish locations on map if locations exist. This is in the case the arrow is just coming up online
            sendMQTTMessage(JSON.stringify(
                {
                    useremail: getCookieValue('useremail'),
                    location: locations
                }));
    }

    function sendMQTTMessage(messageString) {
        message = new Paho.MQTT.Message(messageString);
        message.destinationName = mqttConfig.topic.publish;
        client.send(message);
    }

    /**
     * Map
     */

    var locations = [
        { lat: null, lng: null },
        { lat: null, lng: null }
    ];

    var myLayer = null;

    var map = L.map('map', {
        layers: MQ.mapLayer(),
        zoom: 15
    });

    map.locate({ setView: true, maxZoom: 16, watch: true });

    var popup = null;

    map.on('locationfound', function onLocationFound(e) {
        var radius = e.accuracy;

        if (locations[0].lat == e.latlng.lat && locations[0].lng == e.latlng.lng) // same location
            return;

        locations[0].lat = e.latlng.lat;
        locations[0].lng = e.latlng.lng;

        if (locations[1].lat != null)
            updateRoute();

        if (popup != null && map.hasLayer(popup))
            map.removeLayer(popup)

        popup = L.popup({ offset: L.point(20, 30) }).setLatLng(e.latlng).setContent("You are within " + radius + " meters from this point");
        popup.openOn(map);

    });

    map.on('locationerror', function onLocationError(e) {
        alert(e.message);
    });

    function updateRoute() {

        if (myLayer != null && map.hasLayer(myLayer)) {
            map.removeLayer(myLayer);
        }

        var dir = MQ.routing.directions();

        dir.route({
            locations: [
                { latLng: locations[0] },
                { latLng: locations[1] }
            ]
        });

        myLayer = MQ.routing.routeLayer({
            directions: dir,
            fitBounds: true,
            draggable: false
        });;

        map.addLayer(myLayer);

        sendMQTTMessage(JSON.stringify(
            {
                useremail: getCookieValue('useremail'),
                location: locations
            }));
    }

    map.on('click', function (event) {
        console.log("click")

        if (locations[1].lat != null)
            return;

        console.log(event)

        locations[1].lat = event.latlng.lat;
        locations[1].lng = event.latlng.lng;

        onClick = true;

        updateRoute();

    })

}

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}