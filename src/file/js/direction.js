$(document).ready(function () {


    setInterval(function () {

        $.get("/direction", (data, status) => {
            l = JSON.parse(data);

            x = l['location[1][latLng][lat]'] - l['location[0][latLng][lat]'];
            y = l['location[1][latLng][lng]'] - l['location[0][latLng][lng]'];

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
        })

    }, 3000);



});

