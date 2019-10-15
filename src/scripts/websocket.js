import ReconnectingWebSocket from "reconnecting-websocket";

class WebsocketTools {
    constructor() {
        this.websocket = null;
    }

    async wsConnect() {
        return new Promise((resolve, reject) => {
            // Websocket connection
            let websocket = new ReconnectingWebSocket(WS_URL + 'at/ws');
            let pingIntervalId = null;

            websocket.onopen = function () {
                console.log('Web Socket Connection Made');

                // Start ping routine
                pingIntervalId = setInterval(() => {
                    console.log("Ping sent!");
                    websocket.send(JSON.stringify({'msg_type': 'ping'}));
                }, 30000);

                // Resolve the promise
                this.websocket = websocket;
                resolve();
            };
            websocket.onclose = (event) => {
                console.log("Websockets closed", event);
                clearInterval(pingIntervalId);
            };
            websocket.onmessage = function (event) {
                let received_info = JSON.parse(event.data);
                console.log(received_info);
                if (received_info['type'] === 'ping') {
                    console.log("Ping back!");
                }
            };
        });
    }
}

export let wsTools = new WebsocketTools();
