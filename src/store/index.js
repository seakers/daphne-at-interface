import Vue from 'vue';
import Vuex from 'vuex';
import problem from './modules/problem';
import tradespacePlot from './modules/tradespace-plot';
import functionalityList from './modules/functionality-list';
import daphne from './modules/daphne';
import dataMining from './modules/data-mining';
import filter from './modules/filter';
import featureApplication from './modules/feature-application';
import experiment from './modules/experiment';
// Anomaly code
import anomaly from './modules/anomaly-problem';
import anomalyPlot from './modules/anomaly-plot';
import anomalyInfo from './modules/anomaly-info';
import anomalyDiagnose from './modules/anomaly-diagnose';
import ReconnectingWebSocket from "reconnecting-websocket";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state: {
        websocket: null
    },
    getters: {
        getWebsocket(state) {
            return state.websocket;
        }
    },
    mutations: {
        setWebsocket(state, websocket) {
            state.websocket = websocket;
        },
    },
    actions: {
        async startWebsocket({state, commit, dispatch, getters }) {
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
                commit('setWebsocket', websocket);
            });
        },
    },
    modules: {
        daphne,
        problem,
        tradespacePlot,
        anomaly,
        anomalyPlot,
        anomalyInfo,
        anomalyDiagnose,
        functionalityList,
        dataMining,
        filter,
        featureApplication,
        experiment
    },
    strict: debug
});
