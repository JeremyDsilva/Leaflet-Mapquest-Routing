var net = require('net');
var fs = require('fs');

/**
 *  My Server
 */

var myServer = {
    "_paths": {
        "GET": {},
        "POST": {}
    },
    "helper": {
        getUrl(request) {
            return request.substring(request.indexOf(' /') + 1, request.indexOf(' HTTP'));
        },
        getRequestType(request) {
            return request.substring(0, request.indexOf(" "));
        },
        getBody(request) {
            return request.substring(
                request.indexOf("\n\n") == -1 ? request.indexOf("\r\n\r\n") + 4 : request.indexOf("\n\n") + 2,
                request.length)
        },
        getParam(url) {
            return url;
        }
    },
    listen(port, host) {
        _server = net.createServer(this._connectionListener.bind({ "_paths": this._paths, "helper": this.helper }));
        _server.listen(port, host);
    },
    get(path, callback) {
        this._paths['GET'][path] = callback;
    },
    post(path, callback) {
        this._paths['POST'][path] = callback;
    },
    _connectionListener(connection) {

        connection.on('data', _onData.bind({ "helper": this.helper, "_paths": this._paths }));

        function _onData(data) {
            data = data.toString();

            var request = {
                "url": this.helper.getUrl(data),
                "type": this.helper.getRequestType(data),
                "body": this.helper.getBody(data)
            }

            function callback(data) {
                var dataToWrite = data.toString();

                connection.write("HTTP/1.1 200 OK\n");
                connection.write("Content-Length:" + dataToWrite.length);
                connection.write("\n\n"); // two carriage returns
                connection.write(dataToWrite);
            }

            func = null;

            try {
                var func = this._paths[request.type][request.url];

                try {
                    func(request, callback)
                } catch (error) {
                    console.log('Error');
                    callback('500 -- Server Error -- ')
                }

            } catch (error) {
                console.log('Error')
                console.log(data)
                callback("404 -- Page not found --")
            }
        }
    }
};

var fsHelper = {
    readFile(path, callback) {
        fs.readFile(path, (err, contents) => {
            if (err) {
                console.log('Error: Reading File');
                callback('500 -- Error')
                return;
            }
            callback(contents);
        });
    },
    replyWithTemplate(path, data, callback) {
        fs.readFile(path, (err, contents) => {
            if (err) {
                console.log('Error: Reading File');
                callback('500 -- Error')
                return;
            }
            fsHelper.fillTemplate(contents.toString(), data, callback);
        });
    },
    fillTemplate(content, data, callback) {
        var length = data.length;

        if (length != 1)
            for (let i = 0; i < length; ++i) {
                content = content.replace(`{{DATA(${i + 1})}}`, data[i])
            }
        else
            content = content.replace('{{DATA}}', data);

        callback(content)

    }
};

/**
 *  Define Paths
 */

myServer.get('/', (request, callback) => fsHelper.readFile('./file/index.html', callback));

myServer.get('/map.html', (request, callback) => fsHelper.readFile('./file/map.html', callback));
myServer.get('/direction.html', (request, callback) => fsHelper.readFile('./file/direction.html', callback))

myServer.get('/js/direction.js', (request, callback) => fsHelper.readFile('./file/js/direction.js', callback))
myServer.get('/js/map.js', (request, callback) => fsHelper.readFile('./file/js/map.js', callback))

var locations = null;

myServer.post('/map', (request, callback) => {

    locations = JSON.parse('{"' + decodeURI(request.body).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    console.log(locations);
    callback('');
});

myServer.get("/direction", (request, callback) => {
    callback(JSON.stringify(locations));
})

/**
 *  Start Server
 */
const port = 3000
const host = '127.0.0.1'
myServer.listen(port, host)
console.log(`Listening at http://${host}:${port}`)