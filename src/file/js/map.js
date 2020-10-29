window.onload = function () {

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

        $.post("/map", { "location": locations });
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