var ADStream = function(stream, transport, client_name, on_message, on_disconnect)
{

    var self = this;
    this.client_name = client_name;
    this.on_message = on_message;
    this.on_disconnect = on_disconnect;

    this.ad_on_message = function(data)
    {
        self.on_message(data)
    };

    this.ad_on_connect = function()
    {
        var data =
            {
                client_name: client_name
            };

            if (getCookie('adcreds') !== '') {
                var creds = getCookie('adcreds');
                creds = creds.substring(1, (creds.length - 1));
                data['cookie'] = creds
            }

            self.send("hello", data);
    };

    this.ad_on_disconnect = function()
    {
        // do nothing
    };

    this.send = function(type, data)
    {
        var request =
            {
                request_type: type,
                data: data
            };

        self.stream.send(request)
    };

    if (transport === "ws")
    {
        this.stream = new WSStream(stream, this.ad_on_connect, this.ad_on_message, this.ad_on_disconnect)
    }
    else if (transport === "socketio")
    {
        this.stream = new SocketIOStream(stream, this.ad_on_connect, this.ad_on_message, this.ad_on_disconnect)
    }
};

var SocketIOStream = function(stream, on_connect, on_message, on_disconnect)
{

    var self = this;
    this.on_connect = on_connect;
    this.on_message = on_message;
    this.on_disconnect = on_disconnect;

    this.send = function(data)
    {
        console.log(data)
        iosocket.emit("down", data)
    };

    this.sio_on_connect = function()
    {
        self.on_connect()
    };

    this.sio_on_message = function(event)
    {
        var data = JSON.parse(event.data);
        self.on_message(data)
    };

    this.sio_on_disconnect = function()
    {
        self.on_disconnect()
    };

    var iosocket = io.connect(stream);

    iosocket.on("connect", function()
    {
        self.sio_on_connect()
    });

    iosocket.on("up", function(msg)
    {
        self.sio_on_message(msg)
    });

    iosocket.on("disconnect", function()
    {
        self.sio_on_disconnect()
    });
};

var WSStream = function(stream, on_connect, on_message, on_disconnect)
{

    var self = this;
    this.on_connect = on_connect;
    this.on_message = on_message;
    this.on_disconnect = on_disconnect;

    this.send = function(data)
    {
        webSocket.send(JSON.stringify(data));
    };

    this.ws_on_connect = function()
    {
        self.on_connect()
    };

    this.ws_on_message = function(event)
    {
        var data = JSON.parse(event.data);
        self.on_message(data)
    };

    this.ws_on_disconnect = function()
    {
        self.on_disconnect()
    };

    var webSocket = new ReconnectingWebSocket(stream);

    webSocket.onopen = this.ws_on_connect;
    webSocket.onmessage = this.ws_on_message;
    webSocket.onclose = this.ws_on_disconnect;

};