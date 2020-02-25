import Vue from 'vue';
import Vuex from 'vuex';
import daphne from './modules/daphne';
import telemetryFeed from './modules/daphne-at';
import experiment from './modules/experiment';
import auth from'./modules/auth';
import modal from './modules/modal';
import {processedPlotData} from "../scripts/at-display-builders";

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
                let telemetryDict = received_info['content'];
                dispatch('initializeTelemetry', telemetryDict);
            } else if (received_info['type'] === 'telemetry_update') {
                let telemetryDict = received_info['content'];
                let selectedVariables = state.telemetryFeed.telemetryPlotSelectedVariables;
                let plotData = processedPlotData(telemetryDict, selectedVariables);
                dispatch('updateTelemetryPlotData', plotData);
                dispatch('updateTelemetryValuesAndInfo', telemetryDict);
            } else if (received_info['type'] === 'symptoms_report') {
                let symptoms_report = received_info['content'];
                dispatch('updateSymptomsList', symptoms_report);
            }
        },
    },
    modules: {
        daphne,
        experiment,
        telemetryFeed,
        auth,
        modal
    },
    strict: debug
});
