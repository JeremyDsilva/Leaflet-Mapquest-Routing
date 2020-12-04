window.onload = function () {

    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('error'))
        $('#error-message').removeAttr("style");

    $('#cookieconsent').prop('checked', true);
}

function onAcceptCookies() {
    $('#consent').hide();
}

function onDeclineCookies() {
    $('#consent').hide();
    $('#cookieconsent').prop('checked', false);
}