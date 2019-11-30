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
import {processedPlotData} from "../scripts/at-display-builders";
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
            } else if (received_info['type'] === 'telemetry_update') {
                let rawTelemetryValues = received_info['values'];
                let telemetryInfo = received_info['info'];
                let selectedVariables = state.telemetryFeed.telemetryPlotSelectedVariables;
                let plotData = processedPlotData(rawTelemetryValues, telemetryInfo, selectedVariables);
                commit('updateTelemetryPlotData', plotData);
            } else if (received_info['type'] === 'at_analysis') {
                message = received_info['diagnosed_anomalies'];
                commit('updateSignatureMessages', message);
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
