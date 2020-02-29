import ReconnectingWebSocket from "reconnecting-websocket";

class WebsocketTools {
    constructor() {
        this.websocket = null;
    }

    async wsConnect(store) {
        return new Promise((resolve, reject) => {
            // Websocket connection
            let websocket = new ReconnectingWebSocket(WS_URL + 'at/ws');
            let pingIntervalId = null;

            websocket.onopen = () => {
                console.log('Web Socket Connection Made');

                // Start ping routine
                pingIntervalId = setInterval(() => {
                    console.log("Ping sent to the backend!");
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
            websocket.onmessage = (event) => store.dispatch("onWebsocketsMessage", event);
        });
    }

    async experimentWsConnect() {
        this.experimentWebsocket = new WebSocket(WS_URL + 'at/experiment');
        this.experimentWebsocket.onopen = function() {
            console.log('Experiment Web Socket Connection Made');
        };
        this.experimentWebsocket.onmessage = function (data) {};
    }

    async wsRefresh() {
        try {
            this.websocket.refresh();
        }
        catch(err) {
            console.log(err);
        }
    }

    async experimentWsRefresh() {
        this.experimentWebsocket.refresh();
    }
}

export let wsTools = new WebsocketTools();
