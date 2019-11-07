import Vue from 'vue';
import Vuex from 'vuex';
import daphne from './modules/daphne';
import experiment from './modules/experiment';

// Anomaly code
import anomaly from './modules/anomaly-problem';
import anomalyPlot from './modules/anomaly-plot';
import anomalyInfo from './modules/anomaly-info';
import anomalyDiagnose from './modules/anomaly-diagnose';
import telemetryFeed from './modules/telemetry-feed';
import {processedTelemetryData} from "../scripts/at-data-helpers";
import { mapGetters, mapMutations } from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state: {
    },
    computed: {
    },
    getters: {
    },
    mutations: {
    },
    actions: {
        async onWebsocketsMessage({ commit, state, getters, dispatch }, message) {
            let received_info = JSON.parse(message.data);

            if (received_info['type'] === 'active.message') {
                commit('addDialoguePiece', received_info['message']);
            } else if (received_info['type'] === 'ping') {
                console.log("Ping back!");
            } else if (received_info['type'] === 'console_text') {
                console.log(received_info['text']);
            } else if (received_info['type'] === 'initialize_telemetry') {
                let telemetryVariables = received_info['variables'];
                commit('initializeTelemetry', telemetryVariables);
                console.log('Telemetry feed thread succesfully initialized.');
            } else if (received_info['type'] === 'telemetry_update') {
                console.log("Telemetry Feed Data update received.");
                let rawTelemetryValues = received_info['values'];
                // let TelemetryInfo = received_info['info'];
                let selectedVariables = state.telemetryFeed.telemetryPlotSelectedVariables;
                let plotData = processedTelemetryData(rawTelemetryValues, selectedVariables);
                commit('updateTelemetryPlotData', plotData);
            }
        },
    },
    modules: {
        daphne,
        anomaly,
        anomalyPlot,
        anomalyInfo,
        anomalyDiagnose,
        experiment,
        telemetryFeed
    },
    strict: debug
});
