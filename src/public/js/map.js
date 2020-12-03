window.onload = function () {

    /**
    *  MQTT
    */

    // Create a client instance
    client = new Paho.MQTT.Client('localHost', 9001, '', 'browsermap');

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect({ onSuccess: onConnect });


    // called when the client connects
    function onConnect() {
        // Once a connection has been made, make a subscription and send a message.
        console.log("onConnect");
        client.subscribe('map');
        messageToSend = new Paho.MQTT.Message("Connected from the browser");
        messageToSend.destinationName = "World";
        client.send(messageToSend);
        console.log("Sent Message")
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
    }

    function sendMQTTMessage(messageString) {
        message = new Paho.MQTT.Message("Hello for the browser");
        message.destinationName = "Direction";
        client.send(message);
    }


    /**
     *  Map
     */

    var locations = [
        { latLng: { lat: null, lng: null } },
        { latLng: { lat: null, lng: null } }
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

        locations[0].latLng.lat = e.latlng.lat;
        locations[0].latLng.lng = e.latlng.lng;

        if (locations[1].latLng.lat != null) {
            updateRoute();
        }

        if (popup != null && map.hasLayer(popup)) {
            map.removeLayer(popup)
        }
        // marker = L.popup(e.latlng);
        // marker.addTo(map)
        //     .bindPopup("You are within " + radius + " meters from this point").openPopup();

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

        dir.route({ locations });

        myLayer = MQ.routing.routeLayer({
            directions: dir,
            fitBounds: true,
            draggable: false
        });;

        map.addLayer(myLayer);

        sendMQTTMessage(locations);
    }

    map.on('click', function (event) {
        console.log("click")

        if (locations[1].latLng.lat != null)
            return;

        console.log(event)

        locations[1].latLng.lat = event.latlng.lat;
        locations[1].latLng.lng = event.latlng.lng;

        onClick = true;

        updateRoute();

    })

}